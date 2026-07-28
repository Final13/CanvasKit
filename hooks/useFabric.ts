import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { getFabric } from "@/lib/fabric";
import { useHistory } from "./useHistory";
import type { TemplateData } from "@/lib/templates";

export type FabricCanvas = any;

// Иконки контролов выделения: тёмный глиф на светло-серой подложке
// (скруглённый квадрат), как на evyt. Удаление — красным.
const CONTROL_ICON_SIZE = 110;

// Геометрия контролов в canvas-пикселях — нужна плавающей панели,
// чтобы не перекрывать их (отступ панели считается от этих чисел)
export const CONTROL_LAYOUT = {
  size: CONTROL_ICON_SIZE,
  cornerOffset: 65, // copy/delete/stretch — отступ наружу от угла
  rotateOffsetY: 88, // поворот — отступ вниз от нижней кромки
};

function controlIconUrl(glyphFill: string, path: string) {
  const s = CONTROL_ICON_SIZE;
  const g = 56; // размер глифа внутри кнопки (~51% от кнопки)
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 ${s} ${s}">` +
    `<rect x="3" y="3" width="${s - 6}" height="${s - 6}" rx="20" fill="#f4f4f5" stroke="#d4d4d8" stroke-width="2"/>` +
    `<g transform="translate(${(s - g) / 2} ${(s - g) / 2}) scale(${g / 24})">` +
    `<path fill="${glyphFill}" d="${path}"/></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// Material autorenew — поворот
const ROTATE_CONTROL_ICON = controlIconUrl(
  "#18181b",
  "M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"
);
// Material delete — удаление
const DELETE_CONTROL_ICON = controlIconUrl(
  "#e53935",
  "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
);
// Material content_copy — дублирование объекта
const COPY_CONTROL_ICON = controlIconUrl(
  "#18181b",
  "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
);
// Растягивание за один угол — двунаправленная стрелка по диагонали
// верхний-левый ↔ нижний-правый (open_in_full, зеркально по горизонтали)
const STRETCH_CONTROL_ICON = controlIconUrl(
  "#18181b",
  "M3 11V3h8L7.71 6.29l10 10L21 13v8h-8l3.29-3.29-10-10L3 11z"
);

// уже внедрённые family — не дублируем @font-face при повторных вызовах
const injectedFontFamilies = new Set<string>();

export function injectFonts(fonts: { family: string; url?: string }[]) {
  if (typeof document === "undefined") return;
  const styleId = "template-fonts";
  let style = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = styleId;
    document.head.appendChild(style);
  }
  const css = fonts
    .filter((f) => f.url && !injectedFontFamilies.has(f.family))
    .map((f) => {
      injectedFontFamilies.add(f.family);
      return `@font-face { font-family: "${f.family}"; src: url("${encodeURI(f.url!)}"); font-display: swap; }`;
    })
    .join("\n");
  if (!css) return;
  style.textContent += (style.textContent ? "\n" : "") + css;
}

export async function loadFonts(fonts: { family: string; url?: string }[]) {
  const families = fonts.filter((f) => f.url).map((f) => `${f.family}`);
  if (!families.length || typeof document === "undefined") return;
  try {
    await Promise.all(families.map((family) => document.fonts.load(`12px "${family}"`)));
  } catch {
    // ignore font loading errors, fallback will be used
  }
}

export function useFabric(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  template: TemplateData | null,
  initialJson?: string | null
) {
  const [ready, setReady] = useState(false);
  const fabricRef = useRef<any>(null);
  const canvasRefState = useRef<FabricCanvas | null>(null);
  const skipHistory = useRef(false);
  const [activeObject, setActiveObject] = useState<any>(null);
  const [activeObjectTick, setActiveObjectTick] = useState(0);
  // рамка выделения в CSS-пикселях канваса — для плавающей панели под объектом
  const [selectionRect, setSelectionRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    canvasWidth: number;
    canvasHeight: number;
    scaleX: number; // CSS-px на canvas-px
    scaleY: number;
  } | null>(null);
  const {
    push,
    undo,
    redo,
    reset: resetHistory,
    canUndo,
    canRedo,
  } = useHistory<string>(null, 30);

  const capture = useCallback(() => {
    const canvas = canvasRefState.current;
    if (!canvas || skipHistory.current) return;
    const json = JSON.stringify(canvas.toJSON());
    push(json);
  }, [push]);

  const updateSelectionRect = useCallback(() => {
    const canvas = canvasRefState.current;
    const el = canvasRef.current;
    if (!canvas || !el) return;
    const obj = canvas.getActiveObject();
    if (!obj) {
      setSelectionRect(null);
      return;
    }
    obj.setCoords();
    const c = obj.aCoords;
    if (!c) {
      setSelectionRect(null);
      return;
    }
    const xs = [c.tl.x, c.tr.x, c.bl.x, c.br.x];
    const ys = [c.tl.y, c.tr.y, c.bl.y, c.br.y];
    const sx = el.clientWidth / canvas.getWidth();
    const sy = el.clientHeight / canvas.getHeight();
    setSelectionRect({
      left: Math.min(...xs) * sx,
      top: Math.min(...ys) * sy,
      width: (Math.max(...xs) - Math.min(...xs)) * sx,
      height: (Math.max(...ys) - Math.min(...ys)) * sy,
      canvasWidth: el.clientWidth,
      canvasHeight: el.clientHeight,
      scaleX: sx,
      scaleY: sy,
    });
  }, [canvasRef]);

  const withoutHistory = useCallback(
    (action: () => void, andCapture = true) => {
      skipHistory.current = true;
      try {
        action();
      } finally {
        skipHistory.current = false;
      }
      if (andCapture) capture();
    },
    [capture]
  );

  // В template.json фон помечен selectable:false/evented:false, но fabric
  // не сериализует эти поля в toJSON — после загрузки черновика или
  // undo/redo фон становился подвижным. Лочим фон по src картинок шаблона
  // после каждого loadFromJSON (src сравниваем по пути: fabric абсолютизирует).
  const lockTemplateBackgrounds = useCallback(
    (canvas: any) => {
      if (!template) return;
      const toPath = (src: string) => {
        try {
          return new URL(src, window.location.origin).pathname;
        } catch {
          return src;
        }
      };
      const lockedSrcs = new Set(
        (template.objects || [])
          .filter((o: any) => o.type === "image" && o.selectable === false)
          .map((o: any) => toPath(o.src))
      );
      if (!lockedSrcs.size) return;
      canvas.getObjects().forEach((o: any) => {
        if (o.type === "image" && o.src && lockedSrcs.has(toPath(o.src))) {
          o.set({ selectable: false, evented: false });
        }
      });
    },
    [template]
  );

  const loadTemplateIntoCanvas = useCallback(
    async (canvas: any, fabric: any, tpl: TemplateData, jsonOverride?: string | null) => {
      if (!canvas || !fabric || !tpl) return;

      injectFonts(tpl.fonts || []);
      await loadFonts(tpl.fonts || []);

      canvas.setWidth(tpl.canvas.width);
      canvas.setHeight(tpl.canvas.height);
      canvas.backgroundColor = tpl.canvas.background || "#ffffff";

      let source: unknown = {
        version: "5.3.0",
        objects: tpl.objects,
        background: tpl.canvas.background || "",
      };
      if (jsonOverride) {
        try {
          source = JSON.parse(jsonOverride);
        } catch {
          // невалидный черновик — грузим шаблон по умолчанию
        }
      }

      skipHistory.current = true;
      canvas.loadFromJSON(source, () => {
        lockTemplateBackgrounds(canvas);
        canvas.renderAll();
        resetHistory(JSON.stringify(canvas.toJSON()));
        skipHistory.current = false;
        setReady(true);
      });
    },
    [resetHistory, lockTemplateBackgrounds]
  );

  useEffect(() => {
    let disposed = false;
    const canvasEl = canvasRef.current;
    if (!canvasEl || !template) return;

    (async () => {
      await document.fonts.ready;
      const fabric = await getFabric();
      if (disposed) return;

      fabric.Object.prototype.set({
        cornerSize: 54,
        touchCornerSize: 80,
        cornerColor: "#ffffff",
        cornerStrokeColor: "#000000",
        cornerStyle: "circle",
        transparentCorners: false,
        borderColor: "#ffffff",
        borderScaleFactor: 3,
        borderDashArray: [8, 6],
      });

      // Увеличиваем толщину обводки угловых контролов (resize, rotate)
      fabric.controlsUtils.renderCircleControl = function (
        ctx: CanvasRenderingContext2D,
        left: number,
        top: number,
        styleOverride: any,
        fabricObject: any
      ) {
        styleOverride = styleOverride || {};
        const xSize =
          this.sizeX || styleOverride.cornerSize || fabricObject.cornerSize;
        const ySize =
          this.sizeY || styleOverride.cornerSize || fabricObject.cornerSize;
        const transparentCorners =
          typeof styleOverride.transparentCorners !== "undefined"
            ? styleOverride.transparentCorners
            : fabricObject.transparentCorners;
        const methodName = transparentCorners ? "stroke" : "fill";
        const stroke =
          !transparentCorners &&
          (styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor);
        let myLeft = left,
          myTop = top,
          size: number;

        ctx.save();
        ctx.fillStyle =
          styleOverride.cornerColor || fabricObject.cornerColor;
        ctx.strokeStyle =
          styleOverride.cornerStrokeColor || fabricObject.cornerStrokeColor;
        if (xSize > ySize) {
          size = xSize;
          ctx.scale(1.0, ySize / xSize);
          myTop = (top * xSize) / ySize;
        } else if (ySize > xSize) {
          size = ySize;
          ctx.scale(xSize / ySize, 1.0);
          myLeft = (left * ySize) / xSize;
        } else {
          size = xSize;
        }
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(myLeft, myTop, size / 2, 0, 2 * Math.PI, false);
        ctx[methodName]();
        if (stroke) {
          ctx.stroke();
        }
        ctx.restore();
      };

      // Кастомные контролы выделения (как на evyt): копия слева сверху,
      // красная корзина справа сверху, поворот снизу по центру,
      // растягивание одной кнопкой справа снизу. Без круга-фона.
      const rotateIconImg = new Image();
      rotateIconImg.src = ROTATE_CONTROL_ICON;
      const deleteIconImg = new Image();
      deleteIconImg.src = DELETE_CONTROL_ICON;
      const copyIconImg = new Image();
      copyIconImg.src = COPY_CONTROL_ICON;
      const stretchIconImg = new Image();
      stretchIconImg.src = STRETCH_CONTROL_ICON;

      const renderIconControl =
        (img: HTMLImageElement) =>
        function (
          this: any,
          ctx: CanvasRenderingContext2D,
          left: number,
          top: number,
          styleOverride: any,
          fabricObject: any
        ) {
          if (!img.complete || !img.naturalWidth) return;
          const size =
            this.sizeX || styleOverride?.cornerSize || fabricObject.cornerSize;
          ctx.save();
          ctx.translate(left, top);
          ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
          ctx.drawImage(img, -size / 2, -size / 2, size, size);
          ctx.restore();
        };

      const objectControls = fabric.Object.prototype.controls;

      // Стандартные точки ресайза прячем — растягивание одной кнопкой (br)
      ["tl", "tr", "bl", "ml", "mr", "mt", "mb"].forEach((key) => {
        objectControls[key].visible = false;
      });

      // Поворот — иконка снизу по центру
      objectControls.mtr.y = 0.5;
      objectControls.mtr.offsetY = CONTROL_LAYOUT.rotateOffsetY;
      objectControls.mtr.withConnection = false;
      objectControls.mtr.render = renderIconControl(rotateIconImg);
      // крупная иконка: и хитбокс, и рендер берут sizeX/sizeY контрола
      objectControls.mtr.sizeX = CONTROL_ICON_SIZE;
      objectControls.mtr.sizeY = CONTROL_ICON_SIZE;

      // Растягивание — одна кнопка в правом нижнем углу (scalingEqually/cursor из br)
      objectControls.br.render = renderIconControl(stretchIconImg);
      objectControls.br.sizeX = CONTROL_ICON_SIZE;
      objectControls.br.sizeY = CONTROL_ICON_SIZE;
      objectControls.br.offsetX = CONTROL_LAYOUT.cornerOffset;
      objectControls.br.offsetY = CONTROL_LAYOUT.cornerOffset;

      // Копирование — левый верхний угол
      const copyControl = new fabric.Control({
        x: -0.5,
        y: -0.5,
        offsetX: -CONTROL_LAYOUT.cornerOffset,
        offsetY: -CONTROL_LAYOUT.cornerOffset,
        sizeX: CONTROL_ICON_SIZE,
        sizeY: CONTROL_ICON_SIZE,
        cursorStyle: "pointer",
        mouseUpHandler: (_eventData: any, transform: any) => {
          const target = transform.target;
          const targetCanvas = target.canvas;
          if (!targetCanvas) return true;
          const OFFSET = 60;
          skipHistory.current = true;
          // clone() асинхронный — skipHistory снимаем и пишем историю в finish
          const finish = (clones: any[]) => {
            clones.forEach((c: any) => targetCanvas.add(c));
            const sel =
              clones.length === 1
                ? clones[0]
                : new fabric.ActiveSelection(clones, { canvas: targetCanvas });
            targetCanvas.setActiveObject(sel);
            targetCanvas.requestRenderAll();
            skipHistory.current = false;
            capture();
          };
          try {
            if (target.type === "activeSelection") {
              const objs = target.getObjects();
              // сброс выделения возвращает объектам абсолютные координаты
              targetCanvas.discardActiveObject();
              const clones: any[] = new Array(objs.length);
              let done = 0;
              objs.forEach((obj: any, i: number) =>
                obj.clone((c: any) => {
                  c.set({ left: (c.left || 0) + OFFSET, top: (c.top || 0) + OFFSET });
                  clones[i] = c;
                  if (++done === objs.length) finish(clones);
                })
              );
            } else {
              target.clone((c: any) => {
                c.set({ left: (c.left || 0) + OFFSET, top: (c.top || 0) + OFFSET });
                finish([c]);
              });
            }
          } catch {
            skipHistory.current = false;
          }
          return true;
        },
        render: renderIconControl(copyIconImg),
      });

      // Удаление — правый верхний угол (красная корзина)
      const deleteControl = new fabric.Control({
        x: 0.5,
        y: -0.5,
        offsetX: CONTROL_LAYOUT.cornerOffset,
        offsetY: -CONTROL_LAYOUT.cornerOffset,
        sizeX: CONTROL_ICON_SIZE,
        sizeY: CONTROL_ICON_SIZE,
        cursorStyle: "pointer",
        mouseUpHandler: (_eventData: any, transform: any) => {
          const target = transform.target;
          const targetCanvas = target.canvas;
          if (!targetCanvas) return true;
          skipHistory.current = true;
          try {
            if (target.type === "activeSelection") {
              target
                .getObjects()
                .forEach((obj: any) => targetCanvas.remove(obj));
            } else {
              targetCanvas.remove(target);
            }
            targetCanvas.discardActiveObject();
            targetCanvas.requestRenderAll();
          } finally {
            skipHistory.current = false;
          }
          capture();
          return true;
        },
        render: renderIconControl(deleteIconImg),
      });
      objectControls.copyControl = copyControl;
      objectControls.deleteControl = deleteControl;
      // у Textbox/IText собственный объект controls — добавляем и туда
      fabric.Textbox.prototype.controls.copyControl = copyControl;
      fabric.Textbox.prototype.controls.deleteControl = deleteControl;

      fabric.Text.prototype._setTextStyles = function (
        ctx: CanvasRenderingContext2D,
        charStyle: any,
        forMeasuring: boolean
      ) {
        ctx.textBaseline = "alphabetic";
        if (this.path) {
          switch (this.pathAlign) {
            case "center":
              ctx.textBaseline = "middle";
              break;
            case "ascender":
              ctx.textBaseline = "top";
              break;
            case "descender":
              ctx.textBaseline = "bottom";
              break;
          }
        }
        ctx.font = this._getFontDeclaration(charStyle, forMeasuring);
      };

      const canvas = new fabric.Canvas(canvasEl, {
        width: template.canvas.width,
        height: template.canvas.height,
        preserveObjectStacking: true,
        enableRetinaScaling: false,
        selection: true,
        backgroundColor: template.canvas.background || "#ffffff",
      });

      canvasRefState.current = canvas;
      fabricRef.current = fabric;
      // dev-ручка для e2e-проверок (позиции контролов, объекты канваса)
      if (process.env.NODE_ENV !== "production") {
        (window as any).__fabricCanvas = canvas;
      }

      // контролы дорисуются, когда иконки загрузятся
      [rotateIconImg, deleteIconImg, copyIconImg, stretchIconImg].forEach(
        (img) => {
          if (!img.complete) {
            img.addEventListener("load", () => canvas.requestRenderAll());
          }
        }
      );

      const updateSelection = () => setActiveObject(canvas.getActiveObject() || null);

      canvas.on("object:modified", capture);
      canvas.on("object:added", () => {
        if (!skipHistory.current) capture();
      });
      canvas.on("object:removed", () => {
        if (!skipHistory.current) capture();
      });
      canvas.on("text:editing:exited", capture);
      canvas.on("selection:created", updateSelection);
      canvas.on("selection:updated", updateSelection);
      canvas.on("selection:cleared", updateSelection);

      // плавающая панель под объектом следит за рамкой выделения
      canvas.on("selection:created", updateSelectionRect);
      canvas.on("selection:updated", updateSelectionRect);
      canvas.on("selection:cleared", updateSelectionRect);
      canvas.on("object:moving", updateSelectionRect);
      canvas.on("object:scaling", updateSelectionRect);
      canvas.on("object:rotating", updateSelectionRect);
      canvas.on("object:resizing", updateSelectionRect);
      canvas.on("object:modified", updateSelectionRect);
      canvas.on("text:changed", updateSelectionRect);
      window.addEventListener("resize", updateSelectionRect);

      await loadTemplateIntoCanvas(canvas, fabric, template, initialJson);
    })();

    return () => {
      disposed = true;
      window.removeEventListener("resize", updateSelectionRect);
      if (canvasRefState.current) {
        canvasRefState.current.dispose();
        canvasRefState.current = null;
      }
      setReady(false);
    };
  }, [canvasRef, template, initialJson, capture, loadTemplateIntoCanvas, updateSelectionRect]);

  const canvasSize = useMemo(
    () => template?.canvas || { width: 1748, height: 2480 },
    [template]
  );

  const addText = useCallback(
    (text = "Новый текст") => {
      const canvas = canvasRefState.current;
      const fabric = fabricRef.current;
      if (!canvas || !fabric) return;

      withoutHistory(() => {
        const t = new fabric.IText(text, {
          left: canvasSize.width / 2,
          top: canvasSize.height / 2,
          originX: "center",
          originY: "center",
          fontFamily: "Montserrat, sans-serif",
          fontSize: 80,
          fill: "#000000",
          textAlign: "center",
          editable: true,
        });
        canvas.add(t);
        canvas.setActiveObject(t);
        canvas.renderAll();
      });
    },
    [withoutHistory, canvasSize]
  );

  const addImageFromFile = useCallback(
    (file: File) => {
      const canvas = canvasRefState.current;
      const fabric = fabricRef.current;
      if (!canvas || !fabric) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        withoutHistory(() => {
          fabric.Image.fromURL(dataUrl, (img: any) => {
            img.set({
              left: canvasSize.width / 2,
              top: canvasSize.height / 2,
              originX: "center",
              originY: "center",
            });
            const maxW = canvasSize.width * 0.7;
            if (img.width * (img.scaleX || 1) > maxW) {
              img.scaleToWidth(maxW);
            }
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
          });
        });
      };
      reader.readAsDataURL(file);
    },
    [withoutHistory, canvasSize]
  );

  const addImageFromSrc = useCallback(
    (src: string) => {
      const canvas = canvasRefState.current;
      const fabric = fabricRef.current;
      if (!canvas || !fabric) return;

      withoutHistory(() => {
        fabric.Image.fromURL(src, (img: any) => {
          img.set({
            left: canvasSize.width / 2,
            top: canvasSize.height / 2,
            originX: "center",
            originY: "center",
          });
          const maxW = canvasSize.width * 0.7;
          if (img.width * (img.scaleX || 1) > maxW) {
            img.scaleToWidth(maxW);
          }
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        });
      });
    },
    [withoutHistory, canvasSize]
  );

  const addQR = useCallback(
    (dataUrl: string) => {
      addImageFromSrc(dataUrl);
    },
    [addImageFromSrc]
  );

  const updateDigits = useCallback(
    async (age: number, color: string) => {
      const canvas = canvasRefState.current;
      const fabric = fabricRef.current;
      if (!canvas || !fabric) return;

      const tens = age >= 10 ? String(Math.floor(age / 10)) : "";
      const units = String(age % 10);

      // цифры лежат либо отдельными картинками, либо внутри группы
      // (группа образуется при отражении пары)
      const isDigit = (o: any) =>
        o.name === "digit-tens" || o.name === "digit-units";
      const isDigitContainer = (o: any) =>
        isDigit(o) ||
        (typeof o.getObjects === "function" && o.getObjects().some(isDigit));

      const existing = canvas.getObjects().filter(isDigitContainer);

      withoutHistory(() => {
        canvas.discardActiveObject();
        existing.forEach((obj: any) => canvas.remove(obj));
        canvas.renderAll();
      });

      const centerX = canvasSize.width / 2;
      const top = canvasSize.height * 0.3;
      const offset = canvasSize.width * 0.15;
      const scale = (canvasSize.width / 1748) * 0.75;

      const digitColorSets: Record<string, Set<string>> = {
        default: new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]),
        gold: new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]),
        blue: new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]),
        pink: new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]),
        beige: new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]),
      };

      const neededDigits = [tens, units].filter(Boolean);
      const hasAll = (c: string) =>
        neededDigits.every((d) => digitColorSets[c]?.has(d));
      const effectiveColor = hasAll(color) ? color : "gold";

      const getDigitSrc = (value: string): string[] => {
        const candidates: string[] = [];
        if (effectiveColor && effectiveColor !== "default") {
          candidates.push(`/tpl-assets/2024/10/number-${value}-${effectiveColor}.webp`);
        }
        candidates.push(`/tpl-assets/2024/10/number-${value}.webp`);
        if (value === "7") {
          candidates.push(`/tpl-assets/2024/10/number-7-gold.webp`);
        }
        return candidates;
      };

      const loadDigitImage = (
        value: string,
        name: string,
        left: number
      ): Promise<void> => {
        const candidates = getDigitSrc(value);

        return new Promise((resolve) => {
          let index = 0;
          const tryNext = () => {
            if (index >= candidates.length) {
              resolve();
              return;
            }
            const src = candidates[index++];
            fabric.Image.fromURL(src, (img: any) => {
              if (!img || !img.width) {
                tryNext();
                return;
              }
              withoutHistory(() => {
                img.set({
                  originX: "center",
                  originY: "center",
                  left,
                  top,
                  scaleX: scale,
                  scaleY: scale,
                  name,
                  selectable: true,
                  evented: true,
                });
                canvas.add(img);
                canvas.moveTo(img, 1);
                canvas.renderAll();
              });
              resolve();
            });
          };
          tryNext();
        });
      };

      const digits: Promise<void>[] = [];
      if (tens) digits.push(loadDigitImage(tens, "digit-tens", centerX - offset));
      if (units) digits.push(loadDigitImage(units, "digit-units", centerX + offset));

      await Promise.all(digits);

      // фокус на добавленных цифрах (пара — мультивыделением)
      const added = canvas
        .getObjects()
        .filter(
          (obj: any) => obj.name === "digit-tens" || obj.name === "digit-units"
        );
      if (added.length === 1) {
        canvas.setActiveObject(added[0]);
      } else if (added.length > 1) {
        canvas.setActiveObject(new fabric.ActiveSelection(added, { canvas }));
      }
      canvas.requestRenderAll();
    },
    [canvasSize, withoutHistory]
  );

  const updateDigitColor = useCallback(
    (age: number, color: string) => {
      const canvas = canvasRefState.current;
      if (!canvas) return;
      const isDigit = (o: any) =>
        o.name === "digit-tens" || o.name === "digit-units";
      const existing = canvas
        .getObjects()
        .filter(
          (o: any) =>
            isDigit(o) ||
            (typeof o.getObjects === "function" && o.getObjects().some(isDigit))
        );
      if (existing.length === 0) return;
      updateDigits(age, color);
    },
    [updateDigits]
  );

  const deleteSelected = useCallback(() => {
    const canvas = canvasRefState.current;
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active) return;

    withoutHistory(() => {
      if (active.type === "activeSelection") {
        active.getObjects().forEach((obj: any) => canvas.remove(obj));
      } else {
        canvas.remove(active);
      }
      canvas.discardActiveObject();
      canvas.renderAll();
    });
  }, [withoutHistory]);

  // capture: false — live-обновление (слайдеры) без записи в историю;
  // после окончания драга вызывающий делает saveHistory() один раз.
  // Панель (selectionRect) при live-обновлениях не двигаем — иначе
  // она прыгает вместе с ползунком прямо во время драга.
  const updateActiveObject = useCallback(
    (props: Record<string, unknown>, options?: { capture?: boolean }) => {
      const canvas = canvasRefState.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;

      withoutHistory(() => {
        active.set(props);
        canvas.renderAll();
      }, options?.capture !== false);

      setActiveObject(active);
      setActiveObjectTick((t) => t + 1);
      if (options?.capture !== false) updateSelectionRect();
    },
    [withoutHistory, updateSelectionRect]
  );

  const saveHistory = useCallback(() => {
    capture();
    updateSelectionRect();
  }, [capture, updateSelectionRect]);

  // Отражение объекта. Для activeSelection fabric 5.3 ломает трансформы
  // детей при разборе выделения, если у них есть flip (флип превращается
  // в angle:180). Поэтому мультивыделение сначала конвертируем в Group
  // (группа не разбирается при снятии выделения) и флипаем её как
  // одиночный объект — вокруг собственного центра, без скачка.
  const flipActiveObject = useCallback(
    (axis: "x" | "y") => {
      const canvas = canvasRefState.current;
      const fabric = fabricRef.current;
      if (!canvas || !fabric) return;
      let target = canvas.getActiveObject();
      if (!target) return;

      withoutHistory(() => {
        if (target.type === "activeSelection") {
          target = target.toGroup(); // группа становится активным объектом
        }
        const prop = axis === "x" ? "flipX" : "flipY";
        const center = target.getCenterPoint();
        target.set(prop, !target[prop]);
        target.setPositionByOrigin(center, "center", "center");
        canvas.renderAll();
      });

      setActiveObject(canvas.getActiveObject());
      setActiveObjectTick((t) => t + 1);
      updateSelectionRect();
    },
    [withoutHistory, updateSelectionRect]
  );

  const handleUndo = useCallback(() => {
    const canvas = canvasRefState.current;
    if (!canvas) return;
    const state = undo();
    if (state) {
      skipHistory.current = true;
      canvas.loadFromJSON(state, () => {
        lockTemplateBackgrounds(canvas);
        canvas.renderAll();
        skipHistory.current = false;
      });
    }
  }, [undo, lockTemplateBackgrounds]);

  const handleRedo = useCallback(() => {
    const canvas = canvasRefState.current;
    if (!canvas) return;
    const state = redo();
    if (state) {
      skipHistory.current = true;
      canvas.loadFromJSON(state, () => {
        lockTemplateBackgrounds(canvas);
        canvas.renderAll();
        skipHistory.current = false;
      });
    }
  }, [redo, lockTemplateBackgrounds]);

  const handleReset = useCallback(() => {
    const canvas = canvasRefState.current;
    const fabric = fabricRef.current;
    if (!canvas || !fabric || !template) return;

    skipHistory.current = true;
    // возвращаем promise: вызывающий (Editor.handleReset) ждёт перезагрузку
    // canvas, чтобы зафиксировать новое базовое состояние для dirty-проверки
    return loadTemplateIntoCanvas(canvas, fabric, template).then(() => {
      skipHistory.current = false;
    });
  }, [template, loadTemplateIntoCanvas]);

  const getPreviewDataUrl = useCallback(async (maxWidth = 320) => {
    const canvas = canvasRefState.current;
    if (!canvas) return null;
    // Ждём реальную загрузку всех шрифтов, используемых на канвасе:
    // document.fonts.ready сам по себе недостаточен — ранний рендер
    // успевал сработать до подмены фолбэка, текст выходил шире и обрезался.
    try {
      const families = new Set<string>();
      canvas.getObjects().forEach((o: any) => {
        if (o.fontFamily) families.add(o.fontFamily);
      });
      await Promise.all(
        [...families].map((f) => document.fonts.load(`12px "${f}"`))
      );
    } catch {
      // ignore — отрисуем с фолбэком
    }
    const multiplier = Math.min(1, maxWidth / canvas.getWidth());
    return canvas.toDataURL({
      format: "jpeg",
      quality: 0.8,
      multiplier,
    }) as string;
  }, []);

  const getCanvasJson = useCallback(() => {
    const canvas = canvasRefState.current;
    if (!canvas) return null;
    return JSON.stringify(canvas.toJSON());
  }, []);

  return {
    ready,
    activeObject,
    activeObjectTick,
    selectionRect,
    canUndo,
    canRedo,
    addText,
    addImageFromFile,
    addQR,
    updateDigits,
    updateDigitColor,
    deleteSelected,
    undo: handleUndo,
    redo: handleRedo,
    reset: handleReset,
    getPreviewDataUrl,
    getCanvasJson,
    updateActiveObject,
    saveHistory,
    flipActiveObject,
  };
}

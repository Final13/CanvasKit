import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { getFabric } from "@/lib/fabric";
import { useHistory } from "./useHistory";
import type { TemplateData } from "@/lib/templates";

export type FabricCanvas = any;

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
    .filter((f) => f.url)
    .map(
      (f) =>
        `@font-face { font-family: "${f.family}"; src: url("${encodeURI(f.url!)}"); font-display: swap; }`
    )
    .join("\n");
  style.textContent = css;
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
        canvas.renderAll();
        resetHistory(JSON.stringify(canvas.toJSON()));
        skipHistory.current = false;
        setReady(true);
      });
    },
    [resetHistory]
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
      });
      fabric.Object.prototype.controls.mtr.offsetY = -100;

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

      await loadTemplateIntoCanvas(canvas, fabric, template, initialJson);
    })();

    return () => {
      disposed = true;
      if (canvasRefState.current) {
        canvasRefState.current.dispose();
        canvasRefState.current = null;
      }
      setReady(false);
    };
  }, [canvasRef, template, initialJson, capture, loadTemplateIntoCanvas]);

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

      const existing = canvas
        .getObjects()
        .filter(
          (obj: any) => obj.name === "digit-tens" || obj.name === "digit-units"
        );

      withoutHistory(() => {
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
          candidates.push(`/tpl-assets/2024/10/number-${value}-${effectiveColor}.png`);
        }
        candidates.push(`/tpl-assets/2024/10/number-${value}.png`);
        if (value === "7") {
          candidates.push(`/tpl-assets/2024/10/number-7-gold.png`);
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
    },
    [canvasSize, withoutHistory]
  );

  const updateDigitColor = useCallback(
    (age: number, color: string) => {
      const canvas = canvasRefState.current;
      if (!canvas) return;
      const existing = canvas
        .getObjects()
        .filter(
          (obj: any) => obj.name === "digit-tens" || obj.name === "digit-units"
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

  const updateActiveObject = useCallback(
    (props: Record<string, unknown>) => {
      const canvas = canvasRefState.current;
      if (!canvas) return;
      const active = canvas.getActiveObject();
      if (!active) return;

      withoutHistory(() => {
        active.set(props);
        canvas.renderAll();
      });

      setActiveObject(active);
      setActiveObjectTick((t) => t + 1);
    },
    [withoutHistory]
  );

  const handleUndo = useCallback(() => {
    const canvas = canvasRefState.current;
    if (!canvas) return;
    const state = undo();
    if (state) {
      skipHistory.current = true;
      canvas.loadFromJSON(state, () => {
        canvas.renderAll();
        skipHistory.current = false;
      });
    }
  }, [undo]);

  const handleRedo = useCallback(() => {
    const canvas = canvasRefState.current;
    if (!canvas) return;
    const state = redo();
    if (state) {
      skipHistory.current = true;
      canvas.loadFromJSON(state, () => {
        canvas.renderAll();
        skipHistory.current = false;
      });
    }
  }, [redo]);

  const handleReset = useCallback(() => {
    const canvas = canvasRefState.current;
    const fabric = fabricRef.current;
    if (!canvas || !fabric || !template) return;

    skipHistory.current = true;
    loadTemplateIntoCanvas(canvas, fabric, template).then(() => {
      skipHistory.current = false;
    });
  }, [template, loadTemplateIntoCanvas]);

  const getPreviewDataUrl = useCallback((maxWidth = 320) => {
    const canvas = canvasRefState.current;
    if (!canvas) return null;
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
  };
}

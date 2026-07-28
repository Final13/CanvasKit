"use client";

import { useState } from "react";
import { Bold, Italic } from "lucide-react";
import { FontSelect } from "./FontSelect";
import { CONTROL_LAYOUT } from "@/hooks/useFabric";

interface SelectionRect {
  left: number;
  top: number;
  width: number;
  height: number;
  canvasWidth: number;
  canvasHeight: number;
  scaleX: number;
  scaleY: number;
}

interface ObjectControlsPanelProps {
  activeObject: any;
  /** тик обновлений объекта — ресинхронизирует локальные значения слайдеров */
  tick: number;
  rect: SelectionRect | null;
  updateActiveObject: (
    props: Record<string, unknown>,
    options?: { capture?: boolean }
  ) => void;
  saveHistory: () => void;
  flipActiveObject: (axis: "x" | "y") => void;
  /** цвет цифр-шаров + колбэк смены (показывается только для цифр) */
  digitColor: string;
  onDigitColorChange: (color: string) => void;
  fonts: { family: string; url?: string }[];
}

const PANEL_WIDTH = 340;

const DIGIT_COLORS = [
  { key: "gold", label: "Золотой", swatch: "#d4af37" },
  { key: "blue", label: "Синий", swatch: "#3b82f6" },
  { key: "pink", label: "Розовый", swatch: "#ec4899" },
  { key: "beige", label: "Бежевый", swatch: "#d9c9a3" },
];

export function ObjectControlsPanel({
  activeObject,
  tick,
  rect,
  updateActiveObject,
  saveHistory,
  flipActiveObject,
  digitColor,
  onDigitColorChange,
  fonts,
}: ObjectControlsPanelProps) {
  const [fontSize, setFontSize] = useState(40);
  const [angle, setAngle] = useState(0);
  const [scale, setScale] = useState(1);
  // ресинк локальных значений при смене объекта или его внешнем изменении
  // (adjust-state-during-render вместо эффекта)
  const [synced, setSynced] = useState<{ obj: any; tick: number } | null>(null);

  const isText =
    activeObject &&
    (activeObject.type === "i-text" ||
      activeObject.type === "text" ||
      activeObject.type === "textbox");
  // цифры добавляются парой — приходит activeSelection;
  // после отражения пара становится группой — масштаб/поворот общие
  const isImageLike =
    activeObject &&
    (activeObject.type === "image" ||
      activeObject.type === "activeSelection" ||
      activeObject.type === "group");
  // выделены именно цифры-шары (одна или пара/группа с ними)
  const isDigitObj = (o: any) =>
    o?.name === "digit-tens" || o?.name === "digit-units";
  const isDigits =
    activeObject &&
    (isDigitObj(activeObject) ||
      (typeof activeObject.getObjects === "function" &&
        activeObject.getObjects().some(isDigitObj)));

  if (activeObject && (synced?.obj !== activeObject || synced?.tick !== tick)) {
    setSynced({ obj: activeObject, tick });
    setFontSize(Math.round(activeObject.fontSize || 40));
    setAngle(Math.round(activeObject.angle || 0));
    setScale(activeObject.scaleX || 1);
  } else if (!activeObject && synced) {
    setSynced(null);
  }

  if (!activeObject || !rect || (!isText && !isImageLike)) return null;

  // отступы панели от объекта: контролы (уголки/поворот) не должны перекрываться
  const clearTop =
    (CONTROL_LAYOUT.cornerOffset + CONTROL_LAYOUT.size / 2 + 12) * rect.scaleY;
  const clearBottom =
    (CONTROL_LAYOUT.rotateOffsetY + CONTROL_LAYOUT.size / 2 + 12) *
    rect.scaleY;
  const estHeight = isText ? 140 : 160;

  const centerX = rect.left + rect.width / 2;
  const half = PANEL_WIDTH / 2 + 8;
  const cx = Math.min(
    Math.max(centerX, half),
    Math.max(half, rect.canvasWidth - half)
  );
  const fitsBelow =
    rect.top + rect.height + clearBottom + estHeight <= rect.canvasHeight;
  const fitsAbove = rect.top - clearTop - estHeight >= 0;
  // иначе (объект почти на весь канвас) — док внутри у нижнего края
  const posStyle: React.CSSProperties = fitsBelow
    ? {
        left: cx,
        top: rect.top + rect.height + clearBottom,
        transform: "translateX(-50%)",
      }
    : fitsAbove
      ? { left: cx, top: rect.top - clearTop, transform: "translate(-50%, -100%)" }
      : {
          left: cx,
          top: rect.canvasHeight - 8,
          transform: "translate(-50%, -100%)",
        };

  const cardClass =
    "absolute z-10 flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg";
  const sliderRowClass = "flex items-center gap-2.5 text-sm text-zinc-700";

  if (isText) {
    const currentFont = (activeObject.fontFamily || "Montserrat")
      .split(",")[0]
      .trim();
    const currentColor =
      typeof activeObject.fill === "string" ? activeObject.fill : "#000000";
    const currentWeight = activeObject.fontWeight || "normal";
    const currentStyle = activeObject.fontStyle || "normal";

    return (
      <div style={{ ...posStyle, width: PANEL_WIDTH }} className={cardClass}>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={currentColor}
            onChange={(e) =>
              updateActiveObject({ fill: e.target.value }, { capture: false })
            }
            onBlur={saveHistory}
            title="Цвет"
            className="h-11 w-11 shrink-0 cursor-pointer rounded-lg border border-zinc-300 p-1"
          />
          <input
            type="number"
            min={8}
            max={400}
            value={fontSize}
            onChange={(e) => {
              const v = Number(e.target.value);
              setFontSize(v);
              if (v >= 8 && v <= 400) {
                updateActiveObject({ fontSize: v }, { capture: false });
              }
            }}
            onBlur={saveHistory}
            title="Размер шрифта"
            className="h-11 w-20 shrink-0 rounded-lg border border-zinc-300 px-2 text-center text-base outline-none focus:border-black"
          />
          <FontSelect
            value={currentFont}
            onChange={(family) => updateActiveObject({ fontFamily: family })}
            fonts={fonts}
            className="h-11 min-w-0 flex-1 cursor-pointer rounded-lg border border-zinc-300 bg-white px-2 text-base outline-none focus:border-black"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() =>
              updateActiveObject({
                fontWeight: currentWeight === "bold" ? "normal" : "bold",
              })
            }
            title="Жирный"
            className={`flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg transition ${
              currentWeight === "bold"
                ? "bg-black text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            <Bold size={20} />
          </button>
          <button
            onClick={() =>
              updateActiveObject({
                fontStyle: currentStyle === "italic" ? "normal" : "italic",
              })
            }
            title="Курсив"
            className={`flex h-11 flex-1 cursor-pointer items-center justify-center rounded-lg transition ${
              currentStyle === "italic"
                ? "bg-black text-white"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            <Italic size={20} />
          </button>
        </div>
      </div>
    );
  }

  // изображение/цифры: поворот, общий пропорциональный масштаб, отражения
  // для мультивыделения флип применяется к детям — состояние берём с первого
  const isFlipped = (axis: "x" | "y") => {
    const prop = axis === "x" ? "flipX" : "flipY";
    if (activeObject.type === "activeSelection") {
      const first = activeObject.getObjects()[0];
      return Boolean(first?.[prop]);
    }
    return Boolean(activeObject[prop]);
  };

  return (
    <div style={{ ...posStyle, width: PANEL_WIDTH }} className={cardClass}>
      <label className={sliderRowClass}>
        <span className="w-24 shrink-0">Повернуть</span>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={angle}
          onChange={(e) => {
            const v = Number(e.target.value);
            setAngle(v);
            updateActiveObject({ angle: v }, { capture: false });
          }}
          onPointerUp={saveHistory}
          onKeyUp={saveHistory}
          className="h-6 min-w-0 flex-1 accent-fuchsia-500"
        />
        <span className="w-10 shrink-0 text-right tabular-nums">{angle}°</span>
      </label>

      <label className={sliderRowClass}>
        <span className="w-24 shrink-0">Масштаб</span>
        <input
          type="range"
          min={0.05}
          max={3}
          step={0.01}
          value={scale}
          onChange={(e) => {
            const v = Number(e.target.value);
            setScale(v);
            updateActiveObject({ scaleX: v, scaleY: v }, { capture: false });
          }}
          onPointerUp={saveHistory}
          onKeyUp={saveHistory}
          className="h-6 min-w-0 flex-1 accent-fuchsia-500"
        />
        <span className="w-10 shrink-0 text-right tabular-nums">
          {scale.toFixed(2)}
        </span>
      </label>

      {isDigits && (
        <div className="flex items-center gap-2.5">
          <span className="w-24 shrink-0 text-sm text-zinc-700">Цвет</span>
          <div className="flex gap-2">
            {DIGIT_COLORS.map((c) => (
              <button
                key={c.key}
                onClick={() => onDigitColorChange(c.key)}
                title={c.label}
                className={`h-8 w-8 cursor-pointer rounded-full border-2 transition ${
                  digitColor === c.key
                    ? "border-black"
                    : "border-transparent hover:border-zinc-300"
                }`}
                style={{ backgroundColor: c.swatch }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-0.5">
        <button
          onClick={() => flipActiveObject("x")}
          className={`h-11 flex-1 cursor-pointer rounded-lg border px-2 text-sm font-medium transition ${
            isFlipped("x")
              ? "border-black bg-black text-white"
              : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          Горизонтально
        </button>
        <button
          onClick={() => flipActiveObject("y")}
          className={`h-11 flex-1 cursor-pointer rounded-lg border px-2 text-sm font-medium transition ${
            isFlipped("y")
              ? "border-black bg-black text-white"
              : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50"
          }`}
        >
          Вертикально
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, ChangeEvent, useMemo } from "react";
import { Type, ImagePlus, Bold, Italic, Crown } from "lucide-react";
import type { TabKey } from "./EditorTabs";

interface TabPanelProps {
  activeTab: TabKey;
  onAddText: () => void;
  onAddPhoto: (file: File) => void;
  onDigitsChange: (age: number, color: string) => void;
  onDigitColorChange: (age: number, color: string) => void;
  activeObject: any;
  updateActiveObject: (props: Record<string, unknown>) => void;
  fonts: { family: string; url?: string }[];
}

export function TabPanel({
  activeTab,
  onAddText,
  onAddPhoto,
  onDigitsChange,
  onDigitColorChange,
  activeObject,
  updateActiveObject,
  fonts,
}: TabPanelProps) {
  const [age, setAge] = useState(30);
  const [digitColor, setDigitColor] = useState("gold");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAddPhoto(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isText =
    activeObject &&
    (activeObject.type === "i-text" || activeObject.type === "text");

  const fontFamilies = useMemo(() => {
    const projectFonts = ["Montserrat", "Marck Script"];
    const templateFonts = fonts.filter((f) => f.family).map((f) => f.family);
    return [...new Set([...projectFonts, ...templateFonts])];
  }, [fonts]);

  const currentFont = activeObject?.fontFamily || "Montserrat";
  const currentColor =
    typeof activeObject?.fill === "string" ? activeObject.fill : "#000000";
  const currentWeight = activeObject?.fontWeight || "normal";
  const currentStyle = activeObject?.fontStyle || "normal";

  const handleFontChange = async (family: string) => {
    try {
      await document.fonts.load(`12px "${family}"`);
    } catch {
      // ignore
    }
    updateActiveObject({ fontFamily: family });
  };

  return (
    <div className="w-full bg-white p-4 sm:p-5">
      {activeTab === "digits" && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onDigitsChange(age, digitColor)}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <Crown size={18} />
            Добавить цифры
          </button>

          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={99}
              value={age}
              onChange={(e) => {
                const next = Math.max(0, Math.min(99, Number(e.target.value)));
                setAge(next);
                onDigitColorChange(next, digitColor);
              }}
              className="w-20 rounded-xl border border-zinc-300 px-3 py-2.5 text-center text-sm outline-none focus:border-black"
            />
            <select
              value={digitColor}
              onChange={(e) => {
                const next = e.target.value;
                setDigitColor(next);
                onDigitColorChange(age, next);
              }}
              title="Цвет шаров"
              className="min-w-0 flex-1 cursor-pointer rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-black"
            >
              <option value="gold">Золотой</option>
              <option value="blue">Синий</option>
              <option value="pink">Розовый</option>
              <option value="beige">Бежевый</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === "text" && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onAddText()}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <Type size={18} />
            Добавить текст
          </button>

          {isText ? (
            <div className="flex items-center gap-2">
              <select
                value={currentFont}
                onChange={(e) => handleFontChange(e.target.value)}
                title="Шрифт"
                className="min-w-0 flex-1 cursor-pointer rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
              >
                {fontFamilies.map((family) => (
                  <option key={family} value={family}>
                    {family}
                  </option>
                ))}
              </select>

              <input
                type="color"
                value={currentColor}
                onChange={(e) => updateActiveObject({ fill: e.target.value })}
                title="Цвет"
                className="h-10 w-10 shrink-0 cursor-pointer rounded-xl border border-zinc-300 p-1"
              />

              <button
                onClick={() =>
                  updateActiveObject({
                    fontWeight: currentWeight === "bold" ? "normal" : "bold",
                  })
                }
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition cursor-pointer ${
                  currentWeight === "bold"
                    ? "bg-black text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
                title="Жирный"
              >
                <Bold size={18} />
              </button>
              <button
                onClick={() =>
                  updateActiveObject({
                    fontStyle: currentStyle === "italic" ? "normal" : "italic",
                  })
                }
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition cursor-pointer ${
                  currentStyle === "italic"
                    ? "bg-black text-white"
                    : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
                title="Курсив"
              >
                <Italic size={18} />
              </button>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">
              Выберите текстовый блок, чтобы изменить его стиль.
            </p>
          )}
        </div>
      )}

      {activeTab === "photo" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-zinc-500">
            Загрузите фото, чтобы разместить его на приглашении.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <ImagePlus size={18} />
            Загрузить фото
          </button>
        </div>
      )}
    </div>
  );
}

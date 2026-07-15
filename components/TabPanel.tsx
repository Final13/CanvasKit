"use client";

import { useState, useRef, ChangeEvent, useMemo } from "react";
import { Type, ImagePlus, Bold, Italic } from "lucide-react";
import type { TabKey } from "./EditorTabs";

interface TabPanelProps {
  activeTab: TabKey;
  onAddText: () => void;
  onAddPhoto: (file: File) => void;
  onDigitsChange: (tens: string, units: string) => void;
  activeObject: any;
  updateActiveObject: (props: Record<string, unknown>) => void;
  fonts: { family: string; url?: string }[];
}

export function TabPanel({
  activeTab,
  onAddText,
  onAddPhoto,
  onDigitsChange,
  activeObject,
  updateActiveObject,
  fonts,
}: TabPanelProps) {
  const [age, setAge] = useState(30);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAddPhoto(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyDigits = () => {
    const tens = age >= 10 ? String(Math.floor(age / 10)) : "";
    const units = String(age % 10);
    onDigitsChange(tens, units);
  };

  const isText =
    activeObject &&
    (activeObject.type === "i-text" || activeObject.type === "text");

  const fontFamilies = useMemo(
    () => ["Montserrat", ...new Set(fonts.filter((f) => f.family).map((f) => f.family))],
    [fonts]
  );

  const currentFont = activeObject?.fontFamily || "Montserrat";
  const currentSize = activeObject?.fontSize || 80;
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
        <div className="flex flex-col gap-3">
          <p className="text-sm text-zinc-500">
            Введите возраст, чтобы заменить золотые цифры на приглашении.
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={99}
              value={age}
              onChange={(e) =>
                setAge(Math.max(0, Math.min(99, Number(e.target.value))))
              }
              className="w-24 rounded-xl border border-zinc-300 px-4 py-2.5 text-center text-sm outline-none focus:border-black"
            />
            <button
              onClick={applyDigits}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-black py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              Применить
            </button>
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
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500">Шрифт</label>
                  <select
                    value={currentFont}
                    onChange={(e) => handleFontChange(e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-black"
                  >
                    {fontFamilies.map((family) => (
                      <option key={family} value={family}>
                        {family}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500">Размер</label>
                  <input
                    type="number"
                    min={1}
                    value={Math.round(currentSize)}
                    onChange={(e) =>
                      updateActiveObject({ fontSize: Number(e.target.value) })
                    }
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-black"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-zinc-500">Цвет</label>
                  <input
                    type="color"
                    value={currentColor}
                    onChange={(e) =>
                      updateActiveObject({ fill: e.target.value })
                    }
                    className="h-9 w-16 cursor-pointer rounded border border-zinc-300 p-0.5"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateActiveObject({
                        fontWeight: currentWeight === "bold" ? "normal" : "bold",
                      })
                    }
                    className={`rounded-lg p-2 transition cursor-pointer ${
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
                    className={`rounded-lg p-2 transition cursor-pointer ${
                      currentStyle === "italic"
                        ? "bg-black text-white"
                        : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    }`}
                    title="Курсив"
                  >
                    <Italic size={18} />
                  </button>
                </div>
              </div>

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

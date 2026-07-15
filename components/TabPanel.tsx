"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Type, ImagePlus } from "lucide-react";
import type { TabKey } from "./EditorTabs";

interface TabPanelProps {
  activeTab: TabKey;
  onAddText: () => void;
  onAddPhoto: (file: File) => void;
  onDigitsChange: (tens: string, units: string) => void;
}

export function TabPanel({
  activeTab,
  onAddText,
  onAddPhoto,
  onDigitsChange,
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
        <div className="flex flex-col gap-3">
          <p className="text-sm text-zinc-500">
            Добавьте текстовый блок, затем дважды кликните по нему для
            редактирования.
          </p>
          <button
            onClick={() => onAddText()}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            <Type size={18} />
            Добавить текст
          </button>
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

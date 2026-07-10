"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Type, ImagePlus, Save } from "lucide-react";

interface TabPanelProps {
  onAddText: () => void;
  onAddPhoto: (file: File) => void;
  onSave: () => void;
}

export function TabPanel({ onAddText, onAddPhoto, onSave }: TabPanelProps) {
  const [activeTab, setActiveTab] = useState<"text" | "photo">("text");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAddPhoto(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const tabClass = (tab: "text" | "photo") =>
    `flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition ${
      activeTab === tab
        ? "bg-white text-black"
        : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
    }`;

  return (
    <div className="w-full rounded-b-2xl bg-white shadow">
      <div className="flex border-b border-zinc-200">
        <button
          className={tabClass("text")}
          onClick={() => setActiveTab("text")}
        >
          <Type size={18} />
          Текст
        </button>
        <button
          className={tabClass("photo")}
          onClick={() => setActiveTab("photo")}
        >
          <ImagePlus size={18} />
          Фото
        </button>
        <button
          className="flex items-center justify-center gap-2 px-5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
          onClick={onSave}
        >
          <Save size={18} />
          <span className="hidden sm:inline">Сохранить</span>
        </button>
      </div>

      <div className="p-4">
        {activeTab === "text" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-zinc-500">
              Добавьте текстовый блок, затем дважды кликните по нему для редактирования.
            </p>
            <button
              onClick={() => onAddText()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
            >
              <ImagePlus size={18} />
              Загрузить фото
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

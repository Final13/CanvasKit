"use client";

import { Crown, Type, ImagePlus } from "lucide-react";

export type TabKey = "digits" | "text" | "photo";

interface EditorTabsProps {
  /** клик по кнопке — добавить соответствующий блок на канвас */
  onAction: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "digits", label: "Цифры", icon: Crown },
  { key: "text", label: "Текст", icon: Type },
  { key: "photo", label: "Фото", icon: ImagePlus },
];

export function EditorTabs({ onAction }: EditorTabsProps) {
  return (
    <div className="flex w-full border-b border-zinc-200 bg-white">
      {tabs.map(({ key, label, icon: Icon }) => (
        <button
          key={key}
          onClick={() => onAction(key)}
          className="flex flex-1 cursor-pointer items-center justify-center gap-2 bg-white py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-black sm:py-4"
        >
          <Icon size={18} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

"use client";

import { Crown, Type, ImagePlus } from "lucide-react";

export type TabKey = "digits" | "text" | "photo";

interface EditorTabsProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "digits", label: "Цифры", icon: Crown },
  { key: "text", label: "Текст", icon: Type },
  { key: "photo", label: "Фото", icon: ImagePlus },
];

export function EditorTabs({ active, onChange }: EditorTabsProps) {
  return (
    <div className="flex w-full border-b border-zinc-200 bg-white">
      {tabs.map(({ key, label, icon: Icon }) => {
        const isActive = active === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition sm:py-4 ${
              isActive
                ? "bg-white text-black"
                : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

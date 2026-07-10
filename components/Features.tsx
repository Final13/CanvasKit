"use client";

import { Palette, Pencil, Download, Headphones } from "lucide-react";

const features = [
  { icon: Palette, label: "Оригинальный дизайн" },
  { icon: Pencil, label: "Полная персонализация" },
  { icon: Download, label: "Моментальное скачивание" },
  { icon: Headphones, label: "Техническая поддержка" },
];

export function Features() {
  return (
    <div className="mt-8 flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-4 px-4 sm:mt-10 sm:gap-x-10 md:gap-x-14">
      {features.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex min-w-[140px] flex-1 items-center justify-center gap-2 text-zinc-700 sm:min-w-[160px]"
        >
          <Icon size={22} className="shrink-0 text-zinc-800" />
          <span className="whitespace-nowrap text-xs font-medium sm:text-sm">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

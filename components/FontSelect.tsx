"use client";

import { useEffect, useMemo } from "react";
import { injectFonts } from "@/hooks/useFabric";
import { EDITOR_FONTS } from "@/lib/editor-fonts";

interface FontSelectProps {
  value: string;
  onChange: (family: string) => void;
  /** шрифты текущего шаблона — идут в начало списка */
  fonts: { family: string; url?: string }[];
  className?: string;
}

export function FontSelect({ value, onChange, fonts, className }: FontSelectProps) {
  // @font-face для всех шрифтов редактора: файлы подгружаются лениво,
  // когда вариант селекта отрендерится своим шрифтом
  useEffect(() => {
    injectFonts(EDITOR_FONTS);
  }, []);

  const fontFamilies = useMemo(() => {
    const projectFonts = ["Montserrat", "Marck Script"];
    const templateFonts = fonts.filter((f) => f.family).map((f) => f.family);
    const editorFonts = EDITOR_FONTS.map((f) => f.family);
    return [...new Set([...projectFonts, ...templateFonts, ...editorFonts])];
  }, [fonts]);

  const handleChange = async (family: string) => {
    try {
      await document.fonts.load(`12px "${family}"`);
    } catch {
      // ignore
    }
    onChange(family);
  };

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      title="Шрифт"
      style={{ fontFamily: value }}
      className={className}
    >
      {fontFamilies.map((family) => (
        <option key={family} value={family} style={{ fontFamily: family }}>
          {family}
        </option>
      ))}
    </select>
  );
}

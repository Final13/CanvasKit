"use client";

import { useEffect } from "react";

/**
 * Запоминает ширину viewport в cookie canvaskit_vw. Hero-карусель рендерит
 * SSR-кадр с перспективой под эту ширину, поэтому после гидрации слайды
 * не меняют размер. При первом визите cookie ещё нет — используется
 * fallback-ширина, со следующего визита подгонка точная.
 */
export function ViewportWidthCookie() {
  useEffect(() => {
    const write = () => {
      const w = document.documentElement.clientWidth;
      const secure = location.protocol === "https:" ? "; secure" : "";
      document.cookie = `canvaskit_vw=${w}; path=/; max-age=31536000; samesite=lax${secure}`;
    };
    write();
    window.addEventListener("resize", write);
    return () => window.removeEventListener("resize", write);
  }, []);
  return null;
}

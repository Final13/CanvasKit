"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Анимированная party-эмодзи в логотипе (Lottie, 512×512, 60fps, 180 кадров).
 *
 * Производительность:
 * - при первой отрисовке показывается статичный кадр logo.png (нулевой кадр
 *   анимации, поэтому подмена незаметна) — ничего не блокирует first contentful paint;
 * - плеер (lottie-light, SVG-only) и party.json загружаются только после
 *   события window.load (динамический import — отдельный чанк, в основной
 *   бандл не попадает);
 * - анимация зациклена; при prefers-reduced-motion остаётся статичный кадр.
 */
const SIZE = 50;

export function LogoSticker() {
  const containerRef = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let destroyed = false;
    let anim: { destroy(): void } | undefined;

    const start = async () => {
      try {
        const [{ default: lottie }, data] = await Promise.all([
          import("lottie-web/build/player/lottie_light"),
          fetch("/tggif/party.json").then((r) => r.json()),
        ]);
        if (destroyed || !containerRef.current) return;
        anim = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: data,
        });
        setPlaying(true);
      } catch (error) {
        console.error("Logo sticker failed to load:", error);
      }
    };

    if (document.readyState === "complete") {
      start();
    } else {
      window.addEventListener("load", start, { once: true });
    }

    return () => {
      destroyed = true;
      window.removeEventListener("load", start);
      anim?.destroy();
    };
  }, []);

  return (
    <span
      className="relative inline-block shrink-0 leading-none"
      style={{ width: SIZE, height: SIZE, transform: "translateY(3px)" }}
      aria-hidden="true"
    >
      <img
        src="/tggif/logo.png"
        alt=""
        width={SIZE}
        height={SIZE}
        className={playing ? "hidden" : "block"}
      />
      <span
        ref={containerRef}
        className={playing ? "block" : "hidden"}
        style={{ width: SIZE, height: SIZE }}
      />
    </span>
  );
}

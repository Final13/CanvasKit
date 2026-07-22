"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Анимированная party-эмодзи в логотипе (Lottie, источник — LottieFiles).
 *
 * Производительность:
 * - при первой отрисовке показывается статичный кадр logo.png — ничего не
 *   блокирует first contentful paint;
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
        // Исходный холст 1920×1080, эмодзи в центре (~500×730) —
        // кропаем квадрат вокруг него, иначе в маленьком размере будет крошечным.
        const svg = containerRef.current.querySelector("svg");
        svg?.setAttribute("viewBox", "572 168 780 780");
        svg?.setAttribute("preserveAspectRatio", "xMidYMid meet");
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

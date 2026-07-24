"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TemplateCard } from "./TemplateCard";
import type { TemplateMeta } from "@/lib/templates";

interface TemplateSliderProps {
  templates: TemplateMeta[];
}

const GAP = 16;
const AUTOPLAY_INTERVAL = 3000;

export function TemplateSlider({ templates }: TemplateSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      ro.disconnect();
    };
  }, [updateArrows, templates]);

  const scrollBy = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardEl = el.querySelector<HTMLElement>(".snap-start");
    const cardW = cardEl ? cardEl.getBoundingClientRect().width : 200;
    const scrollAmount = cardW + GAP;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  // Автоплей
  useEffect(() => {
    if (isHovered || templates.length <= 1) return;

    autoplayRef.current = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 1) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollBy("right");
      }
    }, AUTOPLAY_INTERVAL);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isHovered, templates, scrollBy]);

  if (templates.length === 0) return null;

  return (
    <div
      className="relative group/slider"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Левая стрелка */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy("left")}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900 hover:shadow-xl opacity-0 group-hover/slider:opacity-100"
          aria-label="Прокрутить влево"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Контейнер со скроллом */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-4 sm:px-6 lg:px-8 -mx-4 sm:-mx-6 lg:-mx-8"
        style={{ scrollbarWidth: "none" }}
      >
        {templates.map((t) => (
          <div
            key={t.slug}
            className="flex-shrink-0 snap-start w-[180px] sm:w-[200px] lg:w-[220px]"
          >
            <TemplateCard template={t} />
          </div>
        ))}
      </div>

      {/* Правая стрелка */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy("right")}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg border border-zinc-200 text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900 hover:shadow-xl opacity-0 group-hover/slider:opacity-100"
          aria-label="Прокрутить вправо"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
}

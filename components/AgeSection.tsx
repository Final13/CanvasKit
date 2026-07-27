"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PreviewSpinner } from "./PreviewSpinner";
import type { TemplateCatalog } from "@/lib/templates";

const ages = [
  { value: "25", slug: "anniversary-25", label: "25 лет" },
  { value: "30", slug: "anniversary-30", label: "30 лет" },
  { value: "45", slug: "anniversary-45", label: "45 лет" },
  { value: "50", slug: "anniversary-50", label: "50 лет" },
  { value: "55", slug: "anniversary-55", label: "55 лет" },
  { value: "60", slug: "anniversary-60", label: "60 лет" },
];

const GAP = 16;
const AUTOPLAY_INTERVAL = 3000;

interface AgeSectionProps {
  catalog: TemplateCatalog;
}

export function AgeSection({ catalog }: AgeSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Для каждого возраста берём самый популярный шаблон с превью
  const ageTemplates = ages.map((age) => {
    const top = catalog.templates
      .filter((t) => t.preview && t.categorySlugs.includes(age.slug))
      .sort((a, b) => (b.seedViews ?? 0) - (a.seedViews ?? 0))
      .slice(0, 1);
    return { ...age, template: top[0] ?? null };
  });

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
  }, [updateArrows]);

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
    if (isHovered || ageTemplates.length <= 1) return;

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
  }, [isHovered, ageTemplates.length, scrollBy]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between border-b border-zinc-200 pb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-900">По возрасту</h2>
        <Link
          href="/category/anniversary"
          className="flex items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
        >
          Смотреть все
          <ChevronRight size={16} />
        </Link>
      </div>

      <div
        className="relative mt-6 group/slider"
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

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2"
          style={{ scrollbarWidth: "none" }}
        >
          {ageTemplates.map(({ value, slug, label, template }) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="flex-shrink-0 snap-start w-[calc((100%_-_16px)/2)] sm:w-[calc((100%_-_32px)/3)] md:w-[calc((100%_-_48px)/4)] lg:w-[calc((100%_-_64px)/5)] group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition hover:shadow-lg"
            >
              {/* Превью шаблона */}
              <div className="relative aspect-[148/210] w-full overflow-hidden bg-zinc-100">
                {template?.preview ? (
                  <>
                    <PreviewSpinner />
                    <Image
                      src={template.preview}
                      alt={label}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 230px"
                    />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                    Нет превью
                  </div>
                )}
                {/* Плашка с возрастом */}
                <div className="absolute bottom-2 left-2 rounded-full bg-fuchsia-500 px-3 py-1 text-sm font-bold text-white shadow">
                  {value}
                </div>
              </div>

              {/* Подпись */}
              <div className="flex flex-1 flex-col p-3">
                <p className="line-clamp-1 text-xs font-medium uppercase tracking-wide text-zinc-400">
                  Юбилей
                </p>
                <p className="mt-1 text-sm font-medium text-zinc-900">{label}</p>
              </div>
            </Link>
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
    </section>
  );
}

"use client";

import { useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { TemplateCard } from "./TemplateCard";
import { SortSelect } from "./SortSelect";
import type { TemplateMeta } from "@/lib/templates";

interface CategoryGridProps {
  templates: TemplateMeta[];
  currentSort: string;
}

/** Скелетоны карточек на время загрузки */
function SkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-zinc-100 bg-white shadow-sm overflow-hidden"
        >
          <div className="aspect-[148/210] w-full bg-zinc-200" />
          <div className="p-3 space-y-2">
            <div className="h-3 w-16 rounded bg-zinc-200" />
            <div className="h-4 w-full rounded bg-zinc-200" />
            <div className="h-4 w-2/3 rounded bg-zinc-200" />
            <div className="h-5 w-14 rounded bg-zinc-200 pt-3" />
            <div className="h-9 w-full rounded-full bg-zinc-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CategoryGrid({ templates, currentSort }: CategoryGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === "new") {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }
    const qs = params.toString();
    startTransition(() => {
      // scroll: false — остаёмся на уровне фильтра, без перекидывания наверх
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {/* Хлебные крошки рендерятся сервером, здесь только SortSelect */}
        <div />
        <SortSelect current={currentSort} onSortChange={handleSortChange} />
      </div>

      {isPending ? (
        <SkeletonGrid count={templates.length || 12} />
      ) : templates.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {templates.map((t) => (
            <TemplateCard key={t.slug} template={t} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-sm text-zinc-400">
          В этой категории пока нет шаблонов.
        </p>
      )}
    </>
  );
}

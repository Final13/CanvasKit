"use client";

import { useMemo } from "react";
import Image from "next/image";
import { getCategoryBySlug, getTemplatesByCategory } from "@/lib/template-helpers";
import type { TemplateCatalog, TemplateMeta } from "@/lib/templates";

interface CategoryBrowserProps {
  catalog: TemplateCatalog;
  activeCategory: string;
  rootCategorySlug: string;
  onCategoryChange: (slug: string) => void;
  onSelectTemplate: (template: TemplateMeta) => void;
}

export function CategoryBrowser({
  catalog,
  activeCategory,
  rootCategorySlug,
  onCategoryChange,
  onSelectTemplate,
}: CategoryBrowserProps) {
  const activeCat = useMemo(
    () => getCategoryBySlug(catalog, activeCategory),
    [catalog, activeCategory]
  );

  const childCategories = useMemo(() => {
    const parentId = activeCat?.id;
    if (!parentId) return [];
    return catalog.categories.filter((c) => c.parent === parentId);
  }, [catalog, activeCat]);

  const templates = useMemo(() => {
    if (activeCategory === rootCategorySlug) return [];
    return getTemplatesByCategory(catalog, activeCategory);
  }, [catalog, activeCategory, rootCategorySlug]);

  const getDescendantSlugs = useMemo(() => {
    const memo = new Map<string, Set<string>>();

    return function collect(slug: string): Set<string> {
      if (memo.has(slug)) return memo.get(slug)!;
      const slugs = new Set<string>([slug]);
      const cat = catalog.categories.find((c) => c.slug === slug);
      if (cat) {
        for (const child of catalog.categories) {
          if (child.parent === cat.id) {
            for (const s of collect(child.slug)) slugs.add(s);
          }
        }
      }
      memo.set(slug, slugs);
      return slugs;
    };
  }, [catalog]);

  const getCategoryPreview = (slug: string): string | null => {
    const slugs = getDescendantSlugs(slug);
    const template = catalog.templates.find(
      (t) => t.preview && t.categorySlugs.some((s) => slugs.has(s))
    );
    return template?.preview ?? null;
  };

  if (childCategories.length > 0) {
    return (
      <div className="w-full max-w-5xl rounded-2xl bg-white p-4 shadow sm:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {childCategories.map((cat) => {
            const preview = getCategoryPreview(cat.slug);
            return (
              <button
                key={cat.slug}
                onClick={() => onCategoryChange(cat.slug)}
                className="group flex cursor-pointer flex-col items-start overflow-hidden rounded-xl border border-zinc-200 bg-white text-left transition hover:shadow-md"
              >
                <div className="relative aspect-[148/210] w-full overflow-hidden bg-zinc-100">
                  {preview ? (
                    <Image
                      src={preview}
                      alt={cat.name}
                      fill
                      className="object-cover transition group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 20vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                      Нет превью
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="line-clamp-2 text-xs font-medium text-zinc-800">
                    {cat.name}
                  </p>
                  <p className="text-[10px] text-zinc-400">
                    {cat.count} шаблонов
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl rounded-2xl bg-white p-4 shadow sm:p-6">
      {templates.length === 0 ? (
        <p className="text-sm text-zinc-500">
          В этой категории пока нет шаблонов.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {templates.map((template) => (
            <button
              key={template.slug}
              onClick={() => onSelectTemplate(template)}
              className="group flex cursor-pointer flex-col items-start overflow-hidden rounded-xl border border-zinc-200 bg-white text-left transition hover:shadow-md"
            >
              <div className="relative aspect-[148/210] w-full overflow-hidden bg-zinc-100">
                {template.preview ? (
                  <Image
                    src={template.preview}
                    alt={template.title}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 20vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                    Нет превью
                  </div>
                )}
              </div>
              <div className="p-2">
                <p className="line-clamp-2 text-xs font-medium text-zinc-800">
                  {template.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

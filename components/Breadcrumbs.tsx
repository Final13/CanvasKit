"use client";

import type { TemplateCatalog, TemplateCategory } from "@/lib/templates";

interface BreadcrumbsProps {
  catalog: TemplateCatalog;
  activeCategorySlug: string;
  onNavigate: (slug: string) => void;
}

function getCategoryPath(
  catalog: TemplateCatalog,
  slug: string
): TemplateCategory[] {
  const bySlug = new Map(catalog.categories.map((c) => [c.slug, c]));
  const byId = new Map(catalog.categories.map((c) => [c.id, c]));

  const active = bySlug.get(slug);
  if (!active) return [];

  const path: TemplateCategory[] = [];
  const visited = new Set<number>();
  let current: TemplateCategory | undefined = active;

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current);
    if (current.parent === 0) break;
    current = byId.get(current.parent);
  }

  return path;
}

export function Breadcrumbs({
  catalog,
  activeCategorySlug,
  onNavigate,
}: BreadcrumbsProps) {
  const path = getCategoryPath(catalog, activeCategorySlug);
  if (path.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-500"
    >
      {path.map((cat, index) => {
        const isLast = index === path.length - 1;
        return (
          <span key={cat.slug} className="flex items-center gap-2">
            {index > 0 && <span className="text-zinc-300">/</span>}
            {isLast ? (
              <span className="font-medium text-zinc-900">{cat.name}</span>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate(cat.slug)}
                className="cursor-pointer hover:text-zinc-900 hover:underline"
              >
                {cat.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}

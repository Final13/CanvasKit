import Link from "next/link";
import type { TemplateCatalog } from "@/lib/templates";
import { getCategoryPath } from "@/lib/template-helpers";

interface BreadcrumbsProps {
  catalog: TemplateCatalog;
  activeCategorySlug: string;
}

export function Breadcrumbs({ catalog, activeCategorySlug }: BreadcrumbsProps) {
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
              <Link
                href={`/category/${cat.slug}`}
                className="hover:text-zinc-900 hover:underline"
              >
                {cat.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

import Link from "next/link";
import type { TemplateCatalog } from "@/lib/templates";
import { getCategoryPath } from "@/lib/template-helpers";

interface BreadcrumbsProps {
  catalog: TemplateCatalog;
  activeCategorySlug: string;
  /**
   * page — крупные крошки в стиле оригинала (страницы каталога);
   * compact — компактный вид по центру (страница шаблона).
   */
  variant?: "page" | "compact";
  /** Делать последний пункт ссылкой (на странице шаблона — выход в подкатегорию). */
  linkLast?: boolean;
}

export function Breadcrumbs({
  catalog,
  activeCategorySlug,
  variant = "page",
  linkLast = false,
}: BreadcrumbsProps) {
  const path = getCategoryPath(catalog, activeCategorySlug);
  if (path.length === 0) return null;

  const compact = variant === "compact";

  return (
    <nav
      aria-label="Breadcrumb"
      className={
        compact
          ? "flex flex-wrap items-center justify-center gap-2 text-sm text-zinc-500"
          : "flex flex-wrap items-center gap-x-1.5 gap-y-1 text-lg font-bold text-zinc-800"
      }
    >
      {path.map((cat, index) => {
        const isLast = index === path.length - 1;
        const asLink = !isLast || linkLast;
        return (
          <span
            key={cat.slug}
            className={`flex items-center ${compact ? "gap-2" : "gap-x-1.5"}`}
          >
            {index > 0 && (
              <span className={compact ? "text-zinc-300" : "text-zinc-800"}>
                /
              </span>
            )}
            {asLink ? (
              <Link
                href={`/category/${cat.slug}`}
                className={
                  compact
                    ? "hover:text-zinc-900 hover:underline"
                    : "font-normal text-zinc-500 transition hover:text-zinc-800"
                }
              >
                {cat.name}
              </Link>
            ) : (
              <span className={compact ? "font-medium text-zinc-900" : undefined}>
                {cat.name}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

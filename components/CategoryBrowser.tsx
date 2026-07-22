import Image from "next/image";
import Link from "next/link";
import type { TemplateCatalog } from "@/lib/templates";
import {
  getCategoryBySlug,
  getDescendantSlugs,
} from "@/lib/template-helpers";

interface CategoryBrowserProps {
  catalog: TemplateCatalog;
  parentSlug: string;
}

export function CategoryBrowser({ catalog, parentSlug }: CategoryBrowserProps) {
  const parent = getCategoryBySlug(catalog, parentSlug);
  if (!parent) return null;

  const childCategories = catalog.categories.filter(
    (c) => c.parent === parent.id
  );
  if (childCategories.length === 0) return null;

  const getCategoryPreview = (slug: string): string | null => {
    const slugs = getDescendantSlugs(catalog, slug);
    const template = catalog.templates.find(
      (t) => t.preview && t.categorySlugs.some((s) => slugs.has(s))
    );
    return template?.preview ?? null;
  };

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {childCategories.map((cat) => {
          const preview = getCategoryPreview(cat.slug);
          return (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex flex-col overflow-hidden rounded-xl border border-zinc-100 bg-white transition hover:shadow-md"
            >
              <div className="relative aspect-[148/210] w-full overflow-hidden bg-zinc-100">
                {preview ? (
                  <Image
                    src={preview}
                    alt={cat.name}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                    Нет превью
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium text-zinc-900">
                  {cat.name}
                </p>
                <p className="text-xs text-zinc-400">{cat.count} шаблонов</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

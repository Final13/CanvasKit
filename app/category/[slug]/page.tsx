import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadCatalog } from "@/lib/templates";
import {
  getCategoryBySlug,
  getChildCategories,
  getCategoryPath,
  getTemplatesByCategoryWithDescendants,
} from "@/lib/template-helpers";
import { TemplateCard } from "@/components/TemplateCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CategoryBrowser } from "@/components/CategoryBrowser";
import { SortSelect } from "@/components/SortSelect";
import { DEFAULT_PRICE } from "@/lib/cart";
import { getTemplateViews } from "@/lib/popularity/popularity.db";
import type { TemplateMeta } from "@/lib/templates";

/**
 * Порядки повторяют evyt (WooCommerce):
 *  - sort=popular   — по счётчику просмотров (template_popularity; фолбэк —
 *    seedViews из index.json), затем по новизне;
 *  - sort=new       — по дате публикации (убыв.), затем по id;
 *  - sort=price-asc — по цене (возр.), при равной цене — по id (возр.);
 *  - sort=price-desc — по цене (убыв.), при равной цене — по id (убыв.).
 * Без параметра — как sort=new.
 */
async function sortTemplates(
  templates: TemplateMeta[],
  sort?: string
): Promise<TemplateMeta[]> {
  const byNew = (a: TemplateMeta, b: TemplateMeta) =>
    (b.date ?? "").localeCompare(a.date ?? "") || b.id - a.id;

  if (sort === "popular") {
    const views = await getTemplateViews(templates.map((t) => t.slug));
    const popularityOf = (t: TemplateMeta) => views.get(t.slug) ?? t.seedViews ?? 0;
    return [...templates].sort(
      (a, b) => popularityOf(b) - popularityOf(a) || byNew(a, b)
    );
  }

  if (sort === "price-asc" || sort === "price-desc") {
    const priceOf = (t: TemplateMeta) => t.price ?? DEFAULT_PRICE;
    return [...templates].sort((a, b) =>
      sort === "price-asc"
        ? priceOf(a) - priceOf(b) || a.id - b.id
        : priceOf(b) - priceOf(a) || b.id - a.id
    );
  }

  return [...templates].sort(byNew);
}

const SORT_VALUES = new Set(["popular", "new", "price-asc", "price-desc"]);

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const catalog = await loadCatalog();
  const category = getCategoryBySlug(catalog, slug);

  if (!category) {
    return {
      title: "Категория не найдена — Event Space",
    };
  }

  return {
    title: `${category.name} — Event Space`,
    description: `Шаблоны приглашений в категории «${category.name}». Выберите дизайн и персонализируйте текст и фото онлайн.`,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const catalog = await loadCatalog();
  const category = getCategoryBySlug(catalog, slug);

  if (!category) {
    notFound();
  }

  const childCategories = getChildCategories(catalog, slug);
  const templates = await sortTemplates(
    getTemplatesByCategoryWithDescendants(catalog, slug),
    sort
  );

  const currentSort = SORT_VALUES.has(sort ?? "") ? (sort as string) : "new";

  const sortTitle =
    sort === "new" ? "Новинки" : sort === "popular" ? "Популярное" : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumbs catalog={catalog} activeCategorySlug={slug} />
        <SortSelect current={currentSort} />
      </div>
      <h1 className="mt-4 text-center text-2xl font-semibold text-zinc-900 sm:text-3xl">
        {sortTitle ? `${category.name} — ${sortTitle}` : category.name}
      </h1>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-zinc-500">
        {templates.length} шаблонов в категории
      </p>

      {childCategories.length > 0 && (
        <div className="mt-8">
          <CategoryBrowser catalog={catalog} parentSlug={slug} />
        </div>
      )}

      {templates.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {templates.map((t) => (
            <TemplateCard key={t.slug} template={t} />
          ))}
        </div>
      ) : (
        <p className="mt-12 text-center text-sm text-zinc-400">
          В этой категории пока нет шаблонов.
        </p>
      )}
    </div>
  );
}

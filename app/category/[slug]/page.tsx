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

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const catalog = await loadCatalog();
  const category = getCategoryBySlug(catalog, slug);

  if (!category) {
    notFound();
  }

  const childCategories = getChildCategories(catalog, slug);
  const templates = getTemplatesByCategoryWithDescendants(catalog, slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs catalog={catalog} activeCategorySlug={slug} />
      <h1 className="mt-4 text-center text-2xl font-semibold text-zinc-900 sm:text-3xl">
        {category.name}
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

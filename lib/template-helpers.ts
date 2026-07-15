import type { TemplateCatalog, TemplateCategory, TemplateMeta } from "./templates";

export function getCategoryBySlug(
  catalog: TemplateCatalog,
  slug: string
): TemplateCategory | undefined {
  return catalog.categories.find((c) => c.slug === slug);
}

export function getTemplatesByCategory(
  catalog: TemplateCatalog,
  categorySlug: string
): TemplateMeta[] {
  return catalog.templates.filter((t) => t.categorySlugs.includes(categorySlug));
}

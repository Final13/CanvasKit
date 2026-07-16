import type {
  TemplateCatalog,
  TemplateCategory,
  TemplateMeta,
} from "./templates";

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

export function getChildCategories(
  catalog: TemplateCatalog,
  categorySlug: string
): TemplateCategory[] {
  const cat = getCategoryBySlug(catalog, categorySlug);
  if (!cat) return [];
  return catalog.categories.filter((c) => c.parent === cat.id);
}

export function getCategoryPath(
  catalog: TemplateCatalog,
  slug: string
): TemplateCategory[] {
  const bySlug = new Map(catalog.categories.map((c) => [c.slug, c]));
  const byId = new Map(catalog.categories.map((c) => [c.id, c]));

  const path: TemplateCategory[] = [];
  const visited = new Set<number>();
  let current: TemplateCategory | undefined = bySlug.get(slug);

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    path.unshift(current);
    if (current.parent === 0) break;
    current = byId.get(current.parent);
  }

  return path;
}

export function getDescendantSlugs(
  catalog: TemplateCatalog,
  categorySlug: string
): Set<string> {
  const slugs = new Set<string>([categorySlug]);
  const cat = getCategoryBySlug(catalog, categorySlug);
  if (!cat) return slugs;

  const collect = (parentId: number) => {
    for (const c of catalog.categories) {
      if (c.parent === parentId) {
        slugs.add(c.slug);
        collect(c.id);
      }
    }
  };
  collect(cat.id);
  return slugs;
}

export function getTemplatesByCategoryWithDescendants(
  catalog: TemplateCatalog,
  categorySlug: string
): TemplateMeta[] {
  const slugs = getDescendantSlugs(catalog, categorySlug);
  return catalog.templates.filter((t) =>
    t.categorySlugs.some((s) => slugs.has(s))
  );
}

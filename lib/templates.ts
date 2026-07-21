import fs from "fs/promises";
import path from "path";

export interface TemplateCategory {
  id: number;
  slug: string;
  name: string;
  parent: number;
  count: number;
}

export interface TemplateMeta {
  id: number;
  slug: string;
  title: string;
  categoryIds: number[];
  categorySlugs: string[];
  categoryNames: string[];
  preview: string | null;
  sourceUrl: string;
  /** Цена в рублях (подтянута с evyt scripts/sync-evyt-meta.mjs). */
  price?: number;
  /** Дата публикации на evyt (ISO), для сортировки «По новизне». */
  date?: string;
  /** Стартовое значение счётчика популярности (сид в template_popularity). */
  seedViews?: number;
}

export interface TemplateCatalog {
  generatedAt: string;
  total: number;
  categories: TemplateCategory[];
  templates: TemplateMeta[];
}

export interface TemplateData {
  version: string;
  metadata: TemplateMeta;
  stage: { width: number; height: number };
  canvas: { width: number; height: number; background: string };
  fonts: { family: string; url?: string }[];
  objects: any[];
}

const INDEX_PATH = path.join(process.cwd(), "public/templates/index.json");

export async function loadCatalog(): Promise<TemplateCatalog> {
  const raw = await fs.readFile(INDEX_PATH, "utf-8");
  return JSON.parse(raw);
}

export function getTemplatesByCategory(
  catalog: TemplateCatalog,
  categorySlug: string
): TemplateMeta[] {
  return catalog.templates.filter((t) => t.categorySlugs.includes(categorySlug));
}

export function getCategoryBySlug(
  catalog: TemplateCatalog,
  slug: string
): TemplateCategory | undefined {
  return catalog.categories.find((c) => c.slug === slug);
}

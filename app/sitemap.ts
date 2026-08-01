import type { MetadataRoute } from "next";
import { loadCatalog } from "@/lib/templates";

// Sitemap генерируется на лету из актуального index.json каталога и
// кешируется максимум час — отдельный крон/скрипт не нужен, новые
// шаблоны и категории попадают в sitemap автоматически.
export const revalidate = 3600;

const BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://evspace.ru"
).replace(/\/+$/, "");

const STATIC_PAGES: {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/contacts", changeFrequency: "monthly", priority: 0.3 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
  { path: "/cookies", changeFrequency: "yearly", priority: 0.2 },
  { path: "/data-consent", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await loadCatalog();

  const urls: MetadataRoute.Sitemap = STATIC_PAGES.map((p) => ({
    url: `${BASE_URL}${p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  for (const category of catalog.categories) {
    urls.push({
      url: `${BASE_URL}/category/${category.slug}`,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const template of catalog.templates) {
    if (!template.preview) continue;
    urls.push({
      url: `${BASE_URL}/template/${template.slug}`,
      lastModified: template.date ? new Date(template.date) : undefined,
      changeFrequency: "weekly",
      priority: 0.6,
    });
  }

  return urls;
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TemplateCard } from "./TemplateCard";
import type { TemplateCatalog } from "@/lib/templates";

interface Tab {
  label: string;
  slug: string;
}

interface CategorySectionProps {
  title: string;
  subtitle?: string;
  tabs: Tab[];
  catalog: TemplateCatalog;
  limit?: number;
  seeAllHref?: string;
}

function getTemplatesForTab(catalog: TemplateCatalog, slug: string, limit: number) {
  const cat = catalog.categories.find((c) => c.slug === slug);
  if (!cat) return [];

  const slugs = new Set<string>([slug]);
  const collect = (parentId: number) => {
    for (const c of catalog.categories) {
      if (c.parent === parentId) {
        slugs.add(c.slug);
        collect(c.id);
      }
    }
  };
  collect(cat.id);

  return catalog.templates
    .filter((t) => t.preview && t.categorySlugs.some((s) => slugs.has(s)))
    .slice(0, limit);
}

export function CategorySection({
  title,
  subtitle,
  tabs,
  catalog,
  limit = 6,
  seeAllHref,
}: CategorySectionProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.slug ?? "");

  const templates = useMemo(
    () => getTemplatesForTab(catalog, activeTab, limit),
    [catalog, activeTab, limit]
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="text-center text-2xl font-semibold text-zinc-900 sm:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm text-zinc-500">
          {subtitle}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {tabs.map((tab) => {
          const active = tab.slug === activeTab;
          return (
            <button
              key={tab.slug}
              type="button"
              onClick={() => setActiveTab(tab.slug)}
              className={`rounded-full border px-6 py-2 text-sm font-semibold uppercase tracking-wide transition ${
                active
                  ? "border-fuchsia-400 bg-fuchsia-100 text-fuchsia-800"
                  : "border-fuchsia-200 text-fuchsia-600 hover:bg-fuchsia-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8">
        <div className="flex items-end justify-between border-b border-zinc-200 pb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-900">
            Популярное
          </h3>
          <Link
            href={seeAllHref ?? `/category/${activeTab}`}
            className="flex items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            Смотреть все
            <ChevronRight size={16} />
          </Link>
        </div>

        {templates.length > 0 ? (
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {templates.map((t) => (
              <TemplateCard key={t.slug} template={t} />
            ))}
          </div>
        ) : (
          <p className="mt-8 text-center text-sm text-zinc-400">
            В этой категории пока нет шаблонов.
          </p>
        )}
      </div>
    </section>
  );
}

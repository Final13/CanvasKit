"use client";

import { useState, useCallback, useMemo } from "react";
import { CategoryBrowser } from "./CategoryBrowser";
import { Breadcrumbs } from "./Breadcrumbs";
import { Editor } from "./Editor";
import type { TemplateCatalog, TemplateData, TemplateMeta } from "@/lib/templates";

interface TemplateEditorPageProps {
  catalog: TemplateCatalog;
}

export function TemplateEditorPage({ catalog }: TemplateEditorPageProps) {
  const rootCategory = useMemo(
    () =>
      catalog.categories.find((c) => c.slug === "invitations") ??
      catalog.categories.find((c) => c.parent === 0) ??
      catalog.categories[0],
    [catalog]
  );
  const rootCategorySlug = rootCategory?.slug ?? "invitations";

  const [activeCategory, setActiveCategory] = useState<string>(rootCategorySlug);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = useCallback(async (meta: TemplateMeta) => {
    setLoading(true);
    try {
      const res = await fetch(`/templates/${meta.slug}/template.json`);
      if (!res.ok) throw new Error("Failed to load template");
      const data: TemplateData = await res.json();
      setSelectedTemplate(data);
    } catch (e) {
      console.error(e);
      alert("Не удалось загрузить шаблон");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleBreadcrumbNavigate = useCallback((slug: string) => {
    setSelectedTemplate(null);
    setActiveCategory(slug);
  }, []);

  return (
    <div className="flex w-full flex-col items-center">
      <div className="w-full max-w-5xl px-4 pb-4 sm:px-6">
        <Breadcrumbs
          catalog={catalog}
          activeCategorySlug={activeCategory}
          activeTemplateName={selectedTemplate?.metadata.title}
          onNavigate={handleBreadcrumbNavigate}
        />
      </div>

      {selectedTemplate ? (
        <Editor key={selectedTemplate.metadata.slug} template={selectedTemplate} />
      ) : (
        <CategoryBrowser
          catalog={catalog}
          activeCategory={activeCategory}
          rootCategorySlug={rootCategorySlug}
          onCategoryChange={setActiveCategory}
          onSelectTemplate={handleSelect}
        />
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="rounded-xl bg-white px-6 py-4 shadow-lg">Загрузка шаблона…</div>
        </div>
      )}
    </div>
  );
}

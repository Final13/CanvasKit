import type { Metadata } from "next";
import { loadCatalog } from "@/lib/templates";
import { TemplateCard } from "@/components/TemplateCard";
import { SearchBar } from "@/components/SearchBar";

export const metadata: Metadata = {
  title: "Поиск — Event Space",
  description: "Поиск шаблонов приглашений по названию.",
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  const catalog = await loadCatalog();
  const results =
    query.length >= 2
      ? catalog.templates.filter((t) => t.title.toLowerCase().includes(query))
      : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-center text-2xl font-semibold text-zinc-900 sm:text-3xl">
        Поиск приглашений
      </h1>
      <div className="mx-auto mt-6 max-w-xl">
        <SearchBar />
      </div>

      {query.length >= 2 && (
        <p className="mt-8 text-center text-sm text-zinc-500">
          По запросу «{q.trim()}» найдено: {results.length}
        </p>
      )}

      {results.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {results.map((t) => (
            <TemplateCard key={t.slug} template={t} />
          ))}
        </div>
      ) : (
        query.length >= 2 && (
          <p className="mt-12 text-center text-sm text-zinc-400">
            Ничего не найдено. Попробуйте изменить запрос.
          </p>
        )
      )}
    </div>
  );
}

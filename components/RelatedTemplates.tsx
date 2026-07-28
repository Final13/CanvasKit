import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { TemplateMeta } from "@/lib/templates";
import { TemplateCard } from "./TemplateCard";

interface RelatedTemplatesProps {
  templates: TemplateMeta[];
  title?: string;
}

export function RelatedTemplates({
  templates,
  title = "Похожие приглашения",
}: RelatedTemplatesProps) {
  if (templates.length === 0) return null;

  const categorySlug = templates[0]?.categorySlugs.find(
    (s) => s !== "invitations"
  ) ?? "invitations";

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between border-b border-zinc-200 pb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-900">
            {title}
          </h2>
          <Link
            href={`/category/${categorySlug}`}
            className="flex items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            Смотреть все
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      {/* Три ряда на каждом брейкпоинте: 3×2 / 3×3 / 3×5 / 3×6.
          Скрытие/показ — только через display:none на обёртке: карточке
          нужен её flex, иначе инлайн-ссылка превью схлопывается в 0×0.
          Сетка — во всю ширину экрана, как слайдер на главной. */}
      <style>{`
        .related-grid > :nth-child(n+7) { display: none; }
        @media (min-width: 640px) {
          .related-grid > :nth-child(n+7) { display: block; }
          .related-grid > :nth-child(n+10) { display: none; }
        }
        @media (min-width: 1024px) {
          .related-grid > :nth-child(n+10) { display: block; }
          .related-grid > :nth-child(n+16) { display: none; }
        }
        @media (min-width: 1280px) {
          .related-grid > :nth-child(n+16) { display: block; }
        }
      `}</style>
      <div className="px-4">
        <div className="related-grid mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {templates.slice(0, 18).map((t) => (
            <div key={t.slug} className="h-full">
              <TemplateCard template={t} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

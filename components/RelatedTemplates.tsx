import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { TemplateMeta } from "@/lib/templates";
import { TemplateSlider } from "./TemplateSlider";

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
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
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

      <div className="mt-5">
        <TemplateSlider templates={templates} />
      </div>
    </section>
  );
}

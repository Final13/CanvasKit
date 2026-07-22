import Image from "next/image";
import Link from "next/link";
import type { TemplateMeta } from "@/lib/templates";
import { DEFAULT_PRICE } from "@/lib/cart";
import { FavoriteToggle } from "@/components/FavoriteToggle";

interface TemplateCardProps {
  template: TemplateMeta;
  price?: number;
}

export function TemplateCard({ template, price }: TemplateCardProps) {
  const displayPrice = price ?? template.price ?? DEFAULT_PRICE;
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition hover:shadow-lg">
      <FavoriteToggle
        slug={template.slug}
        title={template.title}
        preview={template.preview}
      />
      <Link
        href={`/template/${template.slug}`}
        className="relative aspect-[148/210] w-full overflow-hidden bg-zinc-100"
      >
        {template.preview ? (
          <Image
            src={template.preview}
            alt={template.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
            Нет превью
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
          {template.categoryNames?.[0] ?? "Приглашение"}
        </p>
        <Link
          href={`/template/${template.slug}`}
          className="mt-1 line-clamp-2 text-sm font-medium text-zinc-900 transition hover:text-fuchsia-600"
        >
          {template.title}
        </Link>
        <p className="mt-auto pt-3 text-base font-bold text-zinc-900">
          {displayPrice} ₽
        </p>
        <Link
          href={`/template/${template.slug}`}
          className="mt-2 inline-flex items-center justify-center rounded-full bg-lime-200 px-4 py-2 text-sm font-semibold text-lime-900 transition hover:bg-lime-300"
        >
          Выбрать
        </Link>
      </div>
    </div>
  );
}

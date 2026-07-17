"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { useFavorites } from "@/components/FavoritesProvider";
import { FavoriteToggle } from "@/components/FavoriteToggle";
import { DEFAULT_PRICE } from "@/lib/cart";

export function FavoritesList() {
  const { items, ready } = useFavorites();

  if (ready && items.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-12 text-center shadow-sm">
        <Heart size={40} className="mx-auto text-zinc-300" />
        <p className="mt-4 text-zinc-500">В избранном пока пусто.</p>
        <p className="mt-2 text-sm text-zinc-400">
          Нажимайте на сердечко на карточках шаблонов, чтобы сохранить их здесь.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-fuchsia-300 px-6 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-fuchsia-400"
        >
          К каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <div
          key={item.slug}
          className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm transition hover:shadow-lg"
        >
          <FavoriteToggle
            slug={item.slug}
            title={item.title}
            preview={item.preview}
          />
          <Link
            href={`/template/${item.slug}`}
            className="relative aspect-[148/210] w-full overflow-hidden bg-zinc-100"
          >
            {item.preview ? (
              <Image
                src={item.preview}
                alt={item.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                Нет превью
              </div>
            )}
          </Link>
          <div className="flex flex-1 flex-col p-3">
            <Link
              href={`/template/${item.slug}`}
              className="line-clamp-2 text-sm font-medium text-zinc-900 transition hover:text-fuchsia-600"
            >
              {item.title}
            </Link>
            <p className="mt-auto pt-3 text-base font-bold text-zinc-900">
              {DEFAULT_PRICE} ₽
            </p>
            <Link
              href={`/template/${item.slug}`}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-lime-200 px-4 py-2 text-sm font-semibold text-lime-900 transition hover:bg-lime-300"
            >
              Выбрать
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

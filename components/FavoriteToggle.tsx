"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/components/FavoritesProvider";

interface FavoriteToggleProps {
  slug: string;
  title: string;
  preview: string | null;
}

export function FavoriteToggle({ slug, title, preview }: FavoriteToggleProps) {
  const { isFavorite, toggle } = useFavorites();
  const active = isFavorite(slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle({ slug, title, preview });
      }}
      aria-label={active ? "Убрать из избранного" : "В избранное"}
      title={active ? "Убрать из избранного" : "В избранное"}
      className={`absolute right-2 top-2 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow transition hover:scale-110 ${
        active ? "text-fuchsia-500" : "text-zinc-400 hover:text-fuchsia-400"
      }`}
    >
      <Heart size={18} fill={active ? "currentColor" : "none"} />
    </button>
  );
}

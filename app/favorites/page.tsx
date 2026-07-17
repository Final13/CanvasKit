import type { Metadata } from "next";
import { FavoritesList } from "@/components/FavoritesList";

export const metadata: Metadata = {
  title: "Избранное — Event Space",
  description: "Ваши избранные шаблоны приглашений.",
};

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-center text-2xl font-semibold text-zinc-900 sm:text-3xl">
        Избранное
      </h1>
      <div className="mt-8">
        <FavoritesList />
      </div>
    </div>
  );
}

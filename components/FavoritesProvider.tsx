"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  type FavoriteItem,
  subscribeFavorites,
  getFavoritesSnapshot,
  toggleFavorite,
  removeFavorite,
} from "@/lib/favorites";

interface FavoritesContextValue {
  items: FavoriteItem[];
  count: number;
  ready: boolean;
  isFavorite: (slug: string) => boolean;
  toggle: (item: FavoriteItem) => void;
  remove: (slug: string) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const EMPTY: FavoriteItem[] = [];

function getServerSnapshot(): FavoriteItem[] {
  return EMPTY;
}

export function FavoritesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const items = useSyncExternalStore(
    subscribeFavorites,
    getFavoritesSnapshot,
    getServerSnapshot
  );

  // Как и в CartProvider: до маунта снапшот пустой (getServerSnapshot),
  // ready=true только после чтения клиентского состояния из localStorage.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const isFavorite = useCallback(
    (slug: string) => items.some((i) => i.slug === slug),
    [items]
  );

  const toggle = useCallback((item: FavoriteItem) => {
    toggleFavorite(item);
  }, []);

  const remove = useCallback((slug: string) => {
    removeFavorite(slug);
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      ready: hydrated,
      isFavorite,
      toggle,
      remove,
    }),
    [items, hydrated, isFavorite, toggle, remove]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within FavoritesProvider");
  return ctx;
}

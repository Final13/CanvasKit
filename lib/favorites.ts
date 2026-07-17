export interface FavoriteItem {
  slug: string;
  title: string;
  preview: string | null;
}

const STORAGE_KEY = "canvaskit-favorites";

function getFavoritesFromStorage(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FavoriteItem[]) : [];
  } catch {
    return [];
  }
}

function saveFavoritesToStorage(items: FavoriteItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let cachedItems: FavoriteItem[] | null = null;
const listeners = new Set<() => void>();

function readFavorites(): FavoriteItem[] {
  if (cachedItems === null) {
    cachedItems = getFavoritesFromStorage();
  }
  return cachedItems;
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cachedItems = null;
      notifyListeners();
    }
  });
}

export function subscribeFavorites(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getFavoritesSnapshot(): FavoriteItem[] {
  return readFavorites();
}

export function toggleFavorite(item: FavoriteItem): void {
  const current = readFavorites();
  const exists = current.some((i) => i.slug === item.slug);
  const next = exists
    ? current.filter((i) => i.slug !== item.slug)
    : [...current, item];
  cachedItems = next;
  saveFavoritesToStorage(next);
  notifyListeners();
}

export function removeFavorite(slug: string): void {
  const next = readFavorites().filter((i) => i.slug !== slug);
  cachedItems = next;
  saveFavoritesToStorage(next);
  notifyListeners();
}

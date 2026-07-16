export interface CartItem {
  id: string;
  templateSlug: string;
  templateTitle: string;
  previewUrl: string;
  price: number;
  customizationJson: string;
}

export const DEFAULT_PRICE = 149;

export function formatPrice(price: number): string {
  return `${price.toLocaleString("ru-RU")} ₽`;
}

export function generateCartItemId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("canvaskit-cart");
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("canvaskit-cart", JSON.stringify(items));
}

let cachedItems: CartItem[] | null = null;
const listeners = new Set<() => void>();

function readCart(): CartItem[] {
  if (cachedItems === null) {
    cachedItems = getCartFromStorage();
  }
  return cachedItems;
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e: StorageEvent) => {
    if (e.key === "canvaskit-cart") {
      cachedItems = null;
      notifyListeners();
    }
  });
}

export function subscribeCart(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getCartSnapshot(): CartItem[] {
  return readCart();
}

export function addCartItem(item: Omit<CartItem, "id">): void {
  const next = [...readCart(), { ...item, id: generateCartItemId() }];
  cachedItems = next;
  saveCartToStorage(next);
  notifyListeners();
}

export function removeCartItem(id: string): void {
  const next = readCart().filter((i) => i.id !== id);
  cachedItems = next;
  saveCartToStorage(next);
  notifyListeners();
}

export function clearCartItems(): void {
  cachedItems = [];
  saveCartToStorage([]);
  notifyListeners();
}

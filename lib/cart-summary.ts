import { cookies } from "next/headers";

export interface CartSummary {
  count: number;
  total: number;
}

// Читает сводку корзины из cookie (пишется в saveCartToStorage, lib/cart.ts).
// Нужна, чтобы сервер отрендерил кнопку корзины с финальными суммой и
// количеством — без layout shift после гидрации. localStorage сервер не видит.
export async function getCartSummary(): Promise<CartSummary | null> {
  try {
    const store = await cookies();
    const raw = store.get("canvaskit_cart_summary")?.value;
    if (!raw) return null;
    const parsed = JSON.parse(decodeURIComponent(raw)) as Partial<CartSummary>;
    if (
      typeof parsed.count !== "number" ||
      typeof parsed.total !== "number" ||
      !Number.isFinite(parsed.count) ||
      !Number.isFinite(parsed.total)
    ) {
      return null;
    }
    return { count: parsed.count, total: parsed.total };
  } catch {
    return null;
  }
}

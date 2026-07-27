import { cookies } from "next/headers";

/**
 * Ширина viewport из прошлого визита (пишет ViewportWidthCookie).
 * Нужна hero-карусели, чтобы SSR-перспектива совпадала с клиентской.
 */
export async function getViewportWidth(): Promise<number | null> {
  try {
    const store = await cookies();
    const raw = store.get("canvaskit_vw")?.value;
    const w = raw ? Number(raw) : NaN;
    return Number.isFinite(w) && w >= 320 && w <= 7680 ? w : null;
  } catch {
    return null;
  }
}

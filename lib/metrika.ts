/**
 * Отправка целей в Яндекс.Метрику.
 * Счётчик 110908888 подключён в components/Footer.tsx (tag.js, lazyOnload).
 *
 * Цели (ID в Метрике): add_cart — добавил в корзину, redirect_to_cart —
 * перешёл в корзину, push_pay — нажал на оплату, success_pay — успешная оплата.
 */
const COUNTER_ID = 110908888;

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

interface YmStub {
  (...args: unknown[]): void;
  a?: unknown[][];
}

export function reachGoal(target: string): void {
  if (typeof window === "undefined") return;
  try {
    // tag.js грузится лениво и может отсутствовать на момент события —
    // создаём стаб-очередь, как в официальном сниппете Метрики: вызовы
    // копятся в ym.a, а загрузившийся tag.js их доотправляет. Сниппет в
    // Footer (`m[i]=m[i]||...`) подхватит этот стаб и не перезапишет его.
    window.ym =
      window.ym ||
      (function (...args: unknown[]) {
        const stub = window.ym as YmStub;
        stub.a = stub.a || [];
        stub.a.push(args);
      } as YmStub);
    window.ym(COUNTER_ID, "reachGoal", target);
  } catch {
    /* игнорируем: аналитика не должна ломать пользовательский сценарий */
  }
}

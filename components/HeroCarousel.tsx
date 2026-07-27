"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { PreviewSpinner } from "./PreviewSpinner";

export interface HeroCarouselItem {
  slug: string;
  title: string;
  preview: string;
}

const CARD_W = 285;
const CARD_H = 405;
const GAP = 16;
const SPEED = 0.8;
const MIN_SCALE = 0.72;
const MAX_ANGLE = 30;
const RADIUS = 24;
const PERSPECTIVE = 1000;
// Ширина контейнера для SSR-раскладки: паттерн перспективы (скорость
// нарастания угла/масштаба) зависит от неё слабо, а сам центр перспективы
// привязан к центру контейнера через left:50% — точно при любой ширине.
const ASSUMED_CONTAINER_W = 1440;
// Раскладка в SSR стартует левее нуля: точка привязки — центр предположенной
// ширины, и на экране шире ASSUMED_CONTAINER_W ряд должен доставать до
// левого края. Запас покрывает viewport до ~3600 CSS px.
const SSR_START_X = -1080;

// useLayoutEffect на клиенте — раскладка применяется до первой отрисовки;
// на сервере предупреждение React глушим заменой на useEffect.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Масштаб/угол карточки с центром в точке x (координаты контейнера). */
function perspectiveAt(x: number, containerW: number) {
  const originX = containerW / 2;
  const range = originX + CARD_W / 2;
  const t = Math.min(Math.abs(x - originX) / range, 1);
  const scale = MIN_SCALE + (1 - MIN_SCALE) * t;
  const angle = Math.sign(originX - x) * MAX_ANGLE * t;
  const rad = (angle * Math.PI) / 180;
  return { scale, angle, rad };
}

function buildTransform(translateX: number, scale: number, angle: number) {
  return `translateX(${translateX.toFixed(1)}px) perspective(${PERSPECTIVE}px) rotateY(${angle.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
}

/**
 * Начальная раскладка (SSR и стартовое состояние анимации). Итеративно
 * (как tick, до сходимости) упаковывает карточки по визуальной ширине —
 * зазоры равномерные, без щелей между уменьшенными карточками. Ближайшая
 * к центру карточка ставится точно в центр перспективы. translateX
 * отсчитывается от центра контейнера: карточки рендерятся с left:50%,
 * поэтому центр перспективы совпадает с центром контейнера при любой
 * его ширине.
 */
function initialLayout(count: number, containerW: number) {
  const visualW = new Array<number>(count).fill(CARD_W);
  const xs = new Array<number>(count).fill(0);
  for (let pass = 0; pass < 5; pass++) {
    let x = SSR_START_X;
    for (let i = 0; i < count; i++) {
      xs[i] = x + visualW[i] / 2;
      x += visualW[i] + GAP;
    }
    for (let i = 0; i < count; i++) {
      const { scale, rad } = perspectiveAt(xs[i], containerW);
      visualW[i] = CARD_W * scale * Math.cos(rad);
    }
  }
  // ближайшую к центру карточку — ровно в центр перспективы
  let centerIdx = 0;
  for (let i = 1; i < count; i++) {
    if (
      Math.abs(xs[i] - containerW / 2) <
      Math.abs(xs[centerIdx] - containerW / 2)
    ) {
      centerIdx = i;
    }
  }
  const delta = containerW / 2 - xs[centerIdx];
  for (let i = 0; i < count; i++) xs[i] += delta;
  // Доупаковка от центральной карточки: после сдвига visualW изменилась и
  // зазоры разъехались. Итеративно переупаковываем с точным GAP — иначе
  // зазоры первого кадра на ~1px шире, чем в кадрах анимации.
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 0; i < count; i++) {
      const { scale, rad } = perspectiveAt(xs[i], containerW);
      visualW[i] = CARD_W * scale * Math.cos(rad);
    }
    xs[centerIdx] = containerW / 2;
    for (let i = centerIdx - 1; i >= 0; i--) {
      xs[i] = xs[i + 1] - (visualW[i] + visualW[i + 1]) / 2 - GAP;
    }
    for (let i = centerIdx + 1; i < count; i++) {
      xs[i] = xs[i - 1] + (visualW[i] + visualW[i - 1]) / 2 + GAP;
    }
  }
  const transforms = xs.map((x) => {
    const { scale, angle } = perspectiveAt(x, containerW);
    return buildTransform(x - containerW / 2 - CARD_W / 2, scale, angle);
  });
  return { xs, visualW, transforms };
}

/**
 * Бесконечная карусель превью шаблонов без элементов управления.
 * Центральный слайд — ровный прямоугольник, остальные скошены
 * перспективой к центру (rotateY). Визуальный зазор постоянный.
 */
export function HeroCarousel({
  items,
  assumedWidth,
}: {
  items: HeroCarouselItem[];
  /** Ширина viewport из прошлого визита (cookie) для точной SSR-перспективы. */
  assumedWidth?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const assumedW = assumedWidth ?? ASSUMED_CONTAINER_W;

  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || items.length === 0) return;

    const count = items.length;
    const order = items.map((_, i) => i);
    // Стартуем из SSR-раскладки (initialLayout). Её координаты — от центра
    // предположенной ширины (карточки с left:50%); tick работает в
    // координатах контейнера от left:0. Пересчитываем сдвиг, иначе первый
    // кадр после гидрации телепортирует ряд на (W−assumedW)/2 пикселей.
    const init = initialLayout(count, assumedW);
    const coordShift =
      container.getBoundingClientRect().width / 2 - assumedW / 2;
    const xs = init.xs.map((x) => x + coordShift); // центр карточки
    // визуальная ширина карточки — для раскладки без наплывов
    const visualW = [...init.visualW];

    let leadX = count > 0 ? xs[0] - visualW[0] / 2 : 0; // левый край первой карточки

    let raf = 0;
    let paused = false;
    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);

    // В SSR карточки отцентрированы через left:50%; до первого кадра
    // возвращаем left:0 — дальше позиции считает tick в координатах от
    // левого края. Происходит в layout-эффекте, до отрисовки.
    for (const card of cardRefs.current) {
      if (card) card.style.left = "0px";
    }

    const tick = () => {
      if (!paused) {
        // браузер может проскроллить overflow-контейнер при фокусе на ссылке
        if (container.scrollLeft !== 0) container.scrollLeft = 0;

        leadX -= SPEED;

        // рециркуляция по визуальному правому краю карточки
        if (xs[order[0]] + visualW[order[0]] / 2 < -GAP) {
          order.push(order.shift()!);
          // leadX — левый край новой первой карточки (центр минус половина ширины)
          leadX = xs[order[0]] - visualW[order[0]] / 2;
        }

        // раскладка: каждая следующая вплотную к визуальному краю предыдущей
        let x = leadX;
        for (let k = 0; k < count; k++) {
          const idx = order[k];
          xs[idx] = x + visualW[idx] / 2;
          x += visualW[idx] + GAP;
        }

        // масштаб + перспектива к центру: угол 0 в центре, растёт к краям
        const rect = container.getBoundingClientRect();
        for (let i = 0; i < count; i++) {
          const { scale, angle, rad } = perspectiveAt(xs[i], rect.width);

          // ограниченная модель визуальной ширины: перспективная проекция
          // не используется (на дальних карточках она взрывает раскладку)
          visualW[i] = CARD_W * scale * Math.cos(rad);

          const card = cardRefs.current[i];
          if (card) {
            // perspective на самой карточке: точка схода в её центре,
            // ширина проекции не зависит от позиции — зазоры равномерные
            card.style.transform = buildTransform(xs[i] - CARD_W / 2, scale, angle);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      container.removeEventListener("mouseenter", onEnter);
      container.removeEventListener("mouseleave", onLeave);
    };
  }, [items, assumedW]);

  if (items.length === 0) return null;

  // Начальная раскладка с перспективой ещё в SSR: карточки отцентрированы
  // на контейнер через left:50% (центр перспективы точен при любой ширине)
  // и упакованы по визуальной ширине (без щелей). Анимация стартует из
  // этой же раскладки, а эффект до первого кадра сбрасывает left в 0.
  const init = initialLayout(items.length, assumedW);

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ height: CARD_H }}
    >
      {items.map((item, i) => (
        <Link
          key={`${item.slug}-${i}`}
          href={`/template/${item.slug}`}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 block bg-white"
          style={{
            width: CARD_W,
            height: CARD_H,
            left: "50%",
            transform: init.transforms[i],
            transformOrigin: "center center",
            borderRadius: RADIUS,
            overflow: "hidden",
            clipPath: `inset(0 round ${RADIUS}px)`,
            WebkitClipPath: `inset(0 round ${RADIUS}px)`,
          }}
        >
          {/* виден, пока картинка грузится; загрузившаяся перекрывает его */}
          <PreviewSpinner />
          <Image
            src={item.preview}
            alt={item.title}
            width={CARD_W}
            height={CARD_H}
            className="h-full w-full object-cover"
            style={{ borderRadius: RADIUS, transform: "scale(1.15)" }}
            sizes={`${CARD_W}px`}
            loading={i < 6 ? "eager" : "lazy"}
          />
        </Link>
      ))}
    </div>
  );
}

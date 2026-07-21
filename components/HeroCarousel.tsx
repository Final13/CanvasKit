"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

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

/**
 * Бесконечная карусель превью шаблонов без элементов управления.
 * Центральный слайд — ровный прямоугольник, остальные скошены
 * перспективой к центру (rotateY). Визуальный зазор постоянный.
 */
export function HeroCarousel({ items }: { items: HeroCarouselItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || items.length === 0) return;

    const count = items.length;
    const order = items.map((_, i) => i);
    const xs = new Array<number>(count).fill(0); // центр карточки
    // визуальная ширина карточки — для раскладки без наплывов
    const visualW = new Array<number>(count).fill(CARD_W);

    let leadX = 0; // проецируемый левый край первой карточки
    for (let k = 0; k < count; k++) {
      xs[order[k]] = leadX + CARD_W / 2;
      leadX += CARD_W + GAP;
    }
    leadX = 0;

    let raf = 0;
    let paused = false;
    const onEnter = () => (paused = true);
    const onLeave = () => (paused = false);
    container.addEventListener("mouseenter", onEnter);
    container.addEventListener("mouseleave", onLeave);

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
        const originX = rect.width / 2;
        const containerCenter = rect.left + originX;
        const range = originX + CARD_W / 2;
        for (let i = 0; i < count; i++) {
          const t = Math.min(
            Math.abs(rect.left + xs[i] - containerCenter) / range,
            1
          );
          const scale = MIN_SCALE + (1 - MIN_SCALE) * t;
          const angle = Math.sign(containerCenter - (rect.left + xs[i])) * MAX_ANGLE * t;
          const rad = (angle * Math.PI) / 180;

          // ограниченная модель визуальной ширины: перспективная проекция
          // не используется (на дальних карточках она взрывает раскладку)
          visualW[i] = CARD_W * scale * Math.cos(rad);

          const card = cardRefs.current[i];
          if (card) {
            // perspective на самой карточке: точка схода в её центре,
            // ширина проекции не зависит от позиции — зазоры равномерные
            card.style.transform = `translateX(${(xs[i] - CARD_W / 2).toFixed(1)}px) perspective(${PERSPECTIVE}px) rotateY(${angle.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
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
  }, [items]);

  if (items.length === 0) return null;

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
          className="absolute left-0 top-0 block"
          style={{
            width: CARD_W,
            height: CARD_H,
            transformOrigin: "center center",
            borderRadius: RADIUS,
            overflow: "hidden",
            clipPath: `inset(0 round ${RADIUS}px)`,
            WebkitClipPath: `inset(0 round ${RADIUS}px)`,
          }}
        >
          <Image
            src={item.preview}
            alt={item.title}
            width={CARD_W}
            height={CARD_H}
            className="h-full w-full object-cover"
            style={{ borderRadius: RADIUS, transform: "scale(1.15)" }}
            sizes={`${CARD_W}px`}
          />
        </Link>
      ))}
    </div>
  );
}

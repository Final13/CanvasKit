import Link from "next/link";
import Image from "next/image";
import { preload } from "react-dom";
import { ArrowRight } from "lucide-react";
import { HeroCarousel, type HeroCarouselItem } from "./HeroCarousel";
import { getViewportWidth } from "@/lib/viewport";

interface HeroSectionProps {
  items: HeroCarouselItem[];
}

export async function HeroSection({ items }: HeroSectionProps) {
  // Ширина экрана из прошлого визита — SSR-перспектива карусели под неё,
  // после гидрации слайды не дёргаются.
  const viewportWidth = await getViewportWidth();
  // Фон hero — LCP-элемент страницы (CSS background): preload scanner его не
  // видит, без подсказки запрос стартует поздно и с обычным приоритетом.
  preload("/images/hero/hero-bg.webp", { as: "image", fetchPriority: "high" });
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage: "url(/images/hero/hero-bg.webp)",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "min(calc(100vw * 0.53), 901px)",
      }}
    >
      <div className="relative z-[2] mx-auto flex max-w-3xl flex-col items-center px-4 pt-6 text-center sm:pt-8">
        <span className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-zinc-700 shadow-sm">
          Ваш идеальный праздник начинается здесь
        </span>
        <h1 className="mt-4 text-[clamp(1.4rem,5.5vw,3rem)] font-bold leading-tight text-zinc-900">
          <span className="inline-block sm:whitespace-nowrap">Конструктор приглашений</span>
          <span className="relative inline-block sm:whitespace-nowrap">
            <Image
              src="/images/hero/top-left.webp"
              alt=""
              aria-hidden
              width={112}
              height={112}
              className="pointer-events-none absolute right-full top-full -mr-6 hidden -translate-y-0 min-[700px]:block"
              style={{ width: "clamp(34px, 6.5vw, 95px)", height: "auto" }}
            />
            на день рождения и юбилей
            <Image
              src="/images/hero/top-right.webp"
              alt=""
              aria-hidden
              width={113}
              height={67}
              className="pointer-events-none absolute bottom-full left-full -ml-6 mb-10 hidden sm:block lg:-ml-12"
              style={{ width: "clamp(30px, 5.5vw, 79px)", height: "auto" }}
            />
          </span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-700 sm:text-base">
          Создайте стильное и запоминающееся приглашение на день рождения или
          юбилей всего за пару минут. Наш онлайн-конструктор — ваш незаменимый
          помощник! 😊
        </p>
      </div>

      <div className="relative z-[2] mt-0">
        <HeroCarousel items={items} assumedWidth={viewportWidth ?? undefined} />
      </div>

      <div className="relative z-[2] flex flex-wrap justify-center gap-3 pb-6 pt-1">
        <Link
          href="/category/kids"
          className="relative inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-bold uppercase tracking-wide text-zinc-900 transition hover:bg-lime-400"
        >
          <Image
            src="/images/hero/bottom-left.webp"
            alt=""
            aria-hidden
            width={52}
            height={105}
            className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2"
            style={{ width: "clamp(16px, 2.5vw, 38px)", height: "auto" }}
          />
          Детям
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/category/birthday"
          className="relative inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-bold uppercase tracking-wide text-zinc-900 transition hover:bg-lime-400"
        >
          Взрослым
          <ArrowRight size={16} />
          <Image
            src="/images/hero/bottom-right.webp"
            alt=""
            aria-hidden
            width={47}
            height={47}
            className="pointer-events-none absolute left-full top-1/2 ml-2 mt-2"
            style={{ width: "clamp(24px, 4vw, 58px)", height: "auto" }}
          />
        </Link>
      </div>
    </section>
  );
}

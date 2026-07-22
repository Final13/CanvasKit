import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroCarousel, type HeroCarouselItem } from "./HeroCarousel";

interface HeroSectionProps {
  items: HeroCarouselItem[];
}

export function HeroSection({ items }: HeroSectionProps) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage: "url(/images/hero-bg.webp)",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "min(calc(100vw * 0.53), 901px)",
      }}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-6 text-center sm:pt-8">
        <span className="rounded-full bg-white px-4 py-1.5 text-xs font-medium text-zinc-700 shadow-sm">
          Ваш идеальный праздник начинается здесь
        </span>
        <h1 className="mt-4 text-[clamp(1.4rem,5.5vw,3rem)] font-bold leading-tight text-zinc-900">
          <span className="block whitespace-nowrap">Конструктор приглашений</span>
          <span className="block whitespace-nowrap">на день рождения и юбилей</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-700 sm:text-base">
          Создайте стильное и запоминающееся приглашение на день рождения или
          юбилей всего за пару минут. Наш онлайн-конструктор — ваш незаменимый
          помощник! 😊
        </p>
      </div>

      <div className="mt-0">
        <HeroCarousel items={items} />
      </div>

      <div className="flex flex-wrap justify-center gap-3 pb-6 pt-1">
        <Link
          href="/category/kids"
          className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-bold uppercase tracking-wide text-zinc-900 transition hover:bg-lime-400"
        >
          Детям
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/category/birthday"
          className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3 text-sm font-bold uppercase tracking-wide text-zinc-900 transition hover:bg-lime-400"
        >
          Взрослым
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}

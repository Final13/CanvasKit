import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  previews: string[];
}

export function HeroSection({ previews }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-fuchsia-200 via-purple-200 to-pink-200">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-16 sm:px-6 lg:flex-row lg:px-8 lg:py-24">
        <div className="flex-1 text-center lg:pr-12 lg:text-left">
          <h1 className="text-3xl font-normal leading-tight text-zinc-900 sm:text-4xl md:text-5xl lg:text-[3.25rem]">
            Конструктор приглашений
            <br />
            <span className="font-semibold">на день рождения и юбилей</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-zinc-700 lg:mx-0">
            Создайте стильное и запоминающееся приглашение на день рождения
            или юбилей всего за пару минут. Наш онлайн-конструктор — ваш
            незаменимый помощник! 😊
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              href="/category/kids"
              className="inline-flex items-center gap-2 rounded-full bg-lime-200 px-6 py-3 text-sm font-bold uppercase tracking-wide text-lime-900 transition hover:bg-lime-300"
            >
              Детям
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/category/birthday"
              className="inline-flex items-center gap-2 rounded-full bg-lime-200 px-6 py-3 text-sm font-bold uppercase tracking-wide text-lime-900 transition hover:bg-lime-300"
            >
              Взрослым
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="relative mt-12 flex flex-1 justify-center lg:mt-0">
          <div className="relative h-[320px] w-[320px] sm:h-[420px] sm:w-[420px]">
            {previews.slice(0, 3).map((src, i) => (
              <div
                key={src + i}
                className={`absolute w-[45%] rounded-2xl shadow-2xl ring-4 ring-white/50 ${
                  i === 0
                    ? "left-[5%] top-[10%] rotate-[-12deg]"
                    : i === 1
                    ? "right-[5%] top-[5%] rotate-[8deg] z-10"
                    : "bottom-[5%] left-[25%] rotate-[4deg] z-20"
                }`}
                style={{ aspectRatio: "148/210" }}
              >
                <Image
                  src={src}
                  alt="Пример приглашения"
                  fill
                  className="rounded-2xl object-cover"
                  sizes="(max-width: 640px) 45vw, 200px"
                  priority={i === 0}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-zinc-50 to-transparent" />
    </section>
  );
}

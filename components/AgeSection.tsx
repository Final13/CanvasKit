import Link from "next/link";
import { ChevronRight } from "lucide-react";

const ages = [
  { value: "25", slug: "anniversary-25" },
  { value: "30", slug: "anniversary-30" },
  { value: "45", slug: "anniversary-45" },
  { value: "50", slug: "anniversary-50" },
  { value: "55", slug: "anniversary-55" },
  { value: "60", slug: "anniversary-60" },
];

const gradients = [
  "from-pink-400 to-rose-300",
  "from-violet-500 to-fuchsia-400",
  "from-fuchsia-500 to-purple-400",
  "from-red-500 to-rose-400",
  "from-teal-400 to-emerald-300",
  "from-orange-500 to-amber-400",
];

export function AgeSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between border-b border-zinc-200 pb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-900">
          По возрасту
        </h2>
        <Link
          href="/category/anniversary"
          className="flex items-center gap-1 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
        >
          Смотреть все
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {ages.map(({ value, slug }, i) => (
          <Link
            key={slug}
            href={`/category/${slug}`}
            className="group flex flex-col items-center rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-lg"
          >
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${gradients[i]} text-4xl font-black text-white shadow-lg transition group-hover:scale-105`}
            >
              {value}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Юбилей
            </p>
            <p className="text-lg font-semibold text-zinc-900">{value} лет</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

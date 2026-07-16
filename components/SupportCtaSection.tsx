import Link from "next/link";
import { MessageCircleQuestion, MonitorSmartphone, ArrowRight } from "lucide-react";

export function SupportCtaSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-0 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-lg md:grid-cols-2">
        <div className="flex items-start gap-4 p-6 md:p-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-800">
            <MessageCircleQuestion size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">
              У вас есть вопрос?
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Мы собрали наиболее популярные вопросы наших пользователей,
              которые помогут вам.
            </p>
            <Link
              href="/contacts"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-lime-200 px-5 py-2 text-sm font-bold uppercase tracking-wide text-lime-900 transition hover:bg-lime-300"
            >
              Ваши вопросы
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="flex items-start gap-4 border-t border-zinc-100 p-6 md:border-t-0 md:border-l md:p-8">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-zinc-800">
            <MonitorSmartphone size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-900">Мы на связи</h3>
            <p className="mt-1 text-sm text-zinc-500">
              Если у вас есть дополнительные вопросы, мы будем рады на них
              ответить.
            </p>
            <Link
              href="/contacts"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-lime-200 px-5 py-2 text-sm font-bold uppercase tracking-wide text-lime-900 transition hover:bg-lime-300"
            >
              Написать нам
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

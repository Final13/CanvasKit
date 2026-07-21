"use client";

import Link from "next/link";
import Image from "next/image";
import { X, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/cart";

function Stepper({ active }: { active: 1 | 2 | 3 }) {
  const steps = [
    { label: "Корзина", num: 1 },
    { label: "Информация о заказе", num: 2 },
    { label: "Завершение заказа", num: 3 },
  ];

  return (
    <div className="mb-10 flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-zinc-400">
      {steps.map((step, index) => (
        <div key={step.num} className="flex items-center gap-2">
          <span
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
              active >= step.num
                ? "bg-fuchsia-400 text-white"
                : "bg-zinc-100 text-zinc-400"
            }`}
          >
            {step.num}
          </span>
          <span
            className={active >= step.num ? "text-zinc-900" : "text-zinc-400"}
          >
            {step.label}
          </span>
          {index < steps.length - 1 && (
            <span className="mx-1 text-zinc-300">&gt;</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function CartPage() {
  const { items, removeItem, total, ready } = useCart();

  if (!ready) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-center text-zinc-500">Загрузка корзины…</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <Stepper active={1} />
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 shadow-sm">
          <ShoppingBag size={48} className="text-zinc-300" />
          <h1 className="mt-4 text-xl font-semibold text-zinc-900">
            Корзина пуста
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Добавьте приглашение, чтобы продолжить оформление.
          </p>
          <Link
            href="/"
            className="mt-6 rounded-full bg-lime-200 px-6 py-2.5 text-sm font-semibold text-lime-900 transition hover:bg-lime-300"
          >
            Выбрать приглашение
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Stepper active={1} />

      <h1 className="mb-8 text-center text-2xl font-semibold text-zinc-900">
        Корзина
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="hidden border-b border-zinc-200 pb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 sm:grid sm:grid-cols-12">
            <span className="col-span-7">Товар</span>
            <span className="col-span-5 text-right">Цена</span>
          </div>

          <ul className="divide-y divide-zinc-100">
            {items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-12 items-center gap-4 py-5"
              >
                <div className="col-span-12 flex items-center gap-4 sm:col-span-7">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-red-500 text-red-500 opacity-75 transition hover:opacity-100"
                    aria-label="Удалить"
                  >
                    <X size={14} />
                  </button>
                  <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    {item.previewUrl ? (
                      <Image
                        src={item.previewUrl}
                        alt={item.templateTitle}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                        нет фото
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {item.templateTitle}
                    </p>
                    <Link
                      href={`/template/${item.templateSlug}`}
                      className="mt-1 inline-block text-xs italic text-zinc-500 underline decoration-zinc-300 underline-offset-2 transition hover:text-fuchsia-600"
                    >
                      Нажмите здесь для повторного редактирования
                    </Link>
                  </div>
                </div>

                <div className="col-span-12 text-right sm:col-span-5">
                  <p className="text-base font-semibold text-zinc-900">
                    {formatPrice(item.price)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
            >
              ← Продолжить покупки
            </Link>
            <button
              type="button"
              className="rounded-full bg-lime-100 px-5 py-2.5 text-sm font-semibold text-lime-900 transition hover:bg-lime-200"
            >
              Обновить корзину
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
              Сумма корзины
            </h2>
            <div className="mt-4 flex items-center justify-between border-b border-zinc-100 pb-4">
              <span className="text-zinc-700">Итого</span>
              <span className="text-lg font-semibold text-zinc-900">
                {formatPrice(total)}
              </span>
            </div>
            <Link
              href="/checkout"
              className="mt-5 block w-full rounded-full bg-fuchsia-300 py-3 text-center text-sm font-semibold text-zinc-900 transition hover:bg-fuchsia-400"
            >
              Оформить заказ
            </Link>

            <div className="mt-6">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <span>🏷</span>
                <span>Купон</span>
              </div>
              <input
                type="text"
                placeholder="Код купона"
                className="mt-2 w-full rounded-xl border border-zinc-200 px-4 py-2.5 text-sm outline-none focus:border-fuchsia-400"
              />
              <button
                type="button"
                className="mt-2 w-full rounded-full border border-zinc-200 bg-white py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Применить купон
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

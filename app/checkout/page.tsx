"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/cart";

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}

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

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, ready, clearCart } = useCart();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setEmail(data.user.email ?? "");
          setName(data.user.name ?? "");
        }
      })
      .catch(() => {});
  }, []);

  const canCheckout = ready && items.length > 0;

  useEffect(() => {
    if (ready && items.length === 0) {
      router.replace("/cart");
    }
  }, [ready, items.length, router]);

  const totalLabel = useMemo(() => formatPrice(total), [total]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCheckout) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            templateSlug: item.templateSlug,
            templateTitle: item.templateTitle,
            previewUrl: item.previewUrl,
            price: item.price,
            customizationJson: item.customizationJson,
          })),
          customerName: name,
          customerEmail: email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.code === "EMAIL_REGISTERED") {
          setError(
            `${data.message} Вы можете войти, не покидая страницу: откройте меню аккаунта.`
          );
          return;
        }
        throw new Error(data.error || "Не удалось оформить заказ");
      }

      clearCart();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.push(`/checkout/success?orderId=${data.orderId}`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Произошла ошибка. Попробуйте ещё раз."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-center text-zinc-500">Загрузка…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Stepper active={2} />

      <h1 className="mb-8 text-center text-2xl font-semibold text-zinc-900">
        Оформление заказа
      </h1>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {!user && (
            <div className="mb-6 text-sm text-zinc-700">
              <p>
                <Link
                  href="/my-account?redirect=/checkout"
                  className="text-fuchsia-600 underline underline-offset-2 hover:text-fuchsia-700"
                >
                  Уже покупали? Нажмите для входа
                </Link>
              </p>
              <p className="mt-1">
                <button
                  type="button"
                  className="text-fuchsia-600 underline underline-offset-2 hover:text-fuchsia-700"
                >
                  Есть купон? Нажмите, чтобы ввести код
                </button>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold uppercase tracking-wide text-zinc-900">
                Детали оплаты
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Введите имя и добавьте адрес электронной почты. Этих данных будет
                достаточно, чтобы совершить заказ. Файлы для скачивания будут
                доступны сразу после оплаты! Аккаунт создаётся автоматически 😊
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-zinc-900"
                  >
                    Имя <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Введите ваше имя"
                    className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-fuchsia-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-zinc-900"
                  >
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Добавьте электронную почту"
                    className="mt-1 w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition focus:border-fuchsia-400"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold uppercase tracking-wide text-zinc-900">
                Способ оплаты
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Оплата производится через платёжный сервис ЮKassa. После
                подтверждения заказа вы будете перенаправлены на защищённую
                страницу оплаты.
              </p>
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-zinc-50 px-4 py-3">
                <span className="rounded bg-white px-2 py-1 text-xs font-bold text-zinc-700 shadow-sm">
                  ЮKASSA
                </span>
                <span className="text-sm text-zinc-600">
                  Банковские карты, СБП, СберБанк, Т-Банк
                </span>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !canCheckout}
              className="w-full rounded-full bg-fuchsia-300 py-3.5 text-sm font-semibold text-zinc-900 transition hover:bg-fuchsia-400 disabled:opacity-60"
            >
              {loading ? "Оформление…" : "Подтвердить заказ"}
            </button>

            <p className="text-xs leading-relaxed text-zinc-500">
              Оформляя заказ, вы подтверждаете, что ознакомились и согласны с
              условиями Лицензионного договора (Оферты), даёте согласие на
              обработку персональных данных в соответствии с Политикой в
              отношении обработки персональных данных.
            </p>
          </form>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-lime-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold uppercase tracking-wide text-zinc-900">
              Ваш заказ
            </h2>

            <div className="mt-4 hidden border-b border-zinc-100 pb-2 text-sm font-semibold uppercase tracking-wider text-zinc-500 sm:grid sm:grid-cols-2">
              <span>Товар</span>
              <span className="text-right">Подытог</span>
            </div>

            <ul className="divide-y divide-zinc-100">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 py-4">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    {item.previewUrl ? (
                      <Image
                        src={item.previewUrl}
                        alt={item.templateTitle}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
                        нет
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-2">
                    <p className="text-sm text-zinc-700">{item.templateTitle}</p>
                    <p className="shrink-0 text-sm font-semibold text-zinc-900">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
              <span className="font-semibold text-zinc-900">Итого</span>
              <span className="text-lg font-semibold text-zinc-900">
                {totalLabel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

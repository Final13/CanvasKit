import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Заказ оформлен — Event Space",
  description:
    "Спасибо за покупку! После оплаты файлы будут доступны в личном кабинете.",
};

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { orderId } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center shadow-sm">
        <div className="flex justify-center">
          <CheckCircle size={56} className="text-lime-500" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-zinc-900">
          Заказ оформлен!
        </h1>
        <p className="mt-3 text-zinc-600">
          Спасибо за покупку. После подтверждения оплаты файлы будут доступны в
          личном кабинете.
        </p>
        {orderId && (
          <p className="mt-2 text-sm text-zinc-500">
            Номер заказа: <span className="font-medium text-zinc-900">{orderId.slice(0, 8)}</span>
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/my-account/orders"
            className="rounded-full bg-fuchsia-300 px-6 py-2.5 text-sm font-semibold text-zinc-900 transition hover:bg-fuchsia-400"
          >
            Мои заказы
          </Link>
          <Link
            href="/"
            className="rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

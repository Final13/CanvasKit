import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { ClearCartOnSuccess } from "@/components/ClearCartOnSuccess";
import { DownloadOrder } from "@/components/DownloadOrder";

export const metadata: Metadata = {
  title: "Заказ оформлен — Event Space",
  description: "Спасибо за покупку! После оплаты файлы будут доступны в личном кабинете.",
};

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <ClearCartOnSuccess />
      <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center shadow-sm">
        <div className="flex justify-center">
          <CheckCircle size={56} className="text-lime-500" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold text-zinc-900">Заказ оформлен!</h1>
        <p className="mt-3 text-zinc-600">
          Спасибо за покупку. Ваше приглашение готово к скачиванию.
        </p>
        {orderId && (
          <p className="mt-2 text-sm text-zinc-500">
            Номер заказа: <span className="font-medium text-zinc-900">{orderId.slice(0, 8)}</span>
          </p>
        )}

        {/* Кнопка скачивания — доступна сразу, без входа в ЛК */}
        {orderId && <DownloadOrder orderId={orderId} />}

        <p className="mt-6 text-sm text-zinc-500">
          Все ваши заказы можно посмотреть на странице{" "}
          <Link
            href="/my-account/orders"
            className="font-medium text-fuchsia-600 underline underline-offset-2 hover:text-fuchsia-700"
          >
            Ваши заказы
          </Link>{" "}
          в личном кабинете.
        </p>

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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/cart";

export interface OrderDetailsItem {
  id: string;
  templateTitle: string;
  price: number;
}

export interface OrderDetailsData {
  id: string;
  status: "pending" | "paid" | "cancelled";
  total: number;
  createdAt: string;
  customerName: string | null;
  customerEmail: string | null;
  paymentMethodLabel: string;
}

interface OrderDetailsProps {
  order: OrderDetailsData;
  items: OrderDetailsItem[];
}

function statusLabel(status: OrderDetailsData["status"]) {
  switch (status) {
    case "pending":
      return "Ожидается оплата";
    case "paid":
      return "Оплачен";
    case "cancelled":
      return "Отменён";
    default:
      return status;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function OrderDetails({ order, items }: OrderDetailsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/pay`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
      <p className="text-sm text-zinc-600">
        Заказ №{" "}
        <span className="rounded bg-lime-200 px-1.5 py-0.5 font-semibold text-lime-900">
          {order.id.slice(0, 8)}
        </span>{" "}
        был оформлен{" "}
        <span className="rounded bg-lime-200 px-1.5 py-0.5 font-semibold text-lime-900">
          {formatDate(order.createdAt)}
        </span>{" "}
        и находится в статусе{" "}
        <span className="rounded bg-lime-200 px-1.5 py-0.5 font-semibold text-lime-900">
          {statusLabel(order.status)}
        </span>
        .
      </p>

      <h2 className="mt-8 text-lg font-semibold text-zinc-900">
        Информация о заказе
      </h2>
      <table className="mt-3 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <th className="py-2 pr-4">Товар</th>
            <th className="py-2 text-right">Итого</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-zinc-100">
              <td className="py-3 pr-4 text-zinc-700">{item.templateTitle}</td>
              <td className="py-3 text-right font-medium text-zinc-900">
                {formatPrice(Number(item.price))}
              </td>
            </tr>
          ))}
          <tr className="border-b border-zinc-100">
            <td className="py-3 pr-4 font-semibold text-zinc-900">
              Способ оплаты:
            </td>
            <td className="py-3 text-right text-zinc-600">
              {order.paymentMethodLabel}
            </td>
          </tr>
          <tr className="border-b border-zinc-100">
            <td className="py-3 pr-4 font-semibold text-zinc-900">Итого:</td>
            <td className="py-3 text-right font-semibold text-zinc-900">
              {formatPrice(Number(order.total))}
            </td>
          </tr>
          {order.status === "pending" && (
            <tr>
              <td className="py-3 pr-4 font-semibold text-zinc-900">
                Действия:
              </td>
              <td className="py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handlePay}
                    disabled={loading}
                    className="cursor-pointer rounded-full bg-lime-200 px-5 py-1.5 text-xs font-semibold text-lime-900 transition hover:bg-lime-300 disabled:opacity-60"
                  >
                    Оплатить
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="cursor-pointer rounded-full bg-lime-200 px-5 py-1.5 text-xs font-semibold text-lime-900 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                  >
                    Отмена
                  </button>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="mt-8 text-lg font-semibold text-zinc-900">
        Детали оплаты
      </h2>
      <div className="mt-3 text-sm text-zinc-700">
        {order.customerName && <p className="italic">{order.customerName}</p>}
        {order.customerEmail && <p className="italic">{order.customerEmail}</p>}
      </div>
    </div>
  );
}

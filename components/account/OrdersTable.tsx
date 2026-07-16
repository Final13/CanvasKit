"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/cart";
import type { Order } from "@/lib/orders/order.db";

interface OrdersTableProps {
  orders: Order[];
}

function statusLabel(status: Order["status"]) {
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

function formatDate(date: Date | string) {
  const d = new Date(date);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handlePay = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/orders/${id}/pay`, { method: "POST" });
      const data = await res.json();
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        router.refresh();
      }
    } finally {
      setLoadingId(null);
    }
  };

  const handleCancel = async (id: string) => {
    setLoadingId(id);
    try {
      await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center shadow-sm">
        <p className="text-zinc-500">У вас пока нет заказов.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-100 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-100 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          <tr>
            <th className="px-4 py-3">Заказ</th>
            <th className="px-4 py-3">Дата</th>
            <th className="px-4 py-3">Статус</th>
            <th className="px-4 py-3">Итого</th>
            <th className="px-4 py-3 text-right">Действия</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {orders.map((order) => (
            <tr key={order.id}>
              <td className="px-4 py-4 font-medium text-zinc-900">
                №{order.id.slice(0, 8)}
              </td>
              <td className="px-4 py-4 text-zinc-600">
                {formatDate(order.created_at)}
              </td>
              <td className="px-4 py-4 text-zinc-600">
                {statusLabel(order.status)}
              </td>
              <td className="px-4 py-4 font-medium text-zinc-900">
                {formatPrice(Number(order.total))} за 1 товар
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap justify-end gap-2">
                  {order.status === "pending" && (
                    <button
                      onClick={() => handlePay(order.id)}
                      disabled={loadingId === order.id}
                      className="rounded-full bg-lime-200 px-4 py-1.5 text-xs font-semibold text-lime-900 transition hover:bg-lime-300 disabled:opacity-60"
                    >
                      Оплатить
                    </button>
                  )}
                  <button className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200">
                    Просмотр
                  </button>
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={loadingId === order.id}
                      className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-700 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                    >
                      Отмена
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

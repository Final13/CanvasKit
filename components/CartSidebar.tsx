"use client";

import Link from "next/link";
import { X, Trash2 } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/cart";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { items, total, removeItem } = useCart();

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">Корзина</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-500 hover:bg-zinc-100"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <p className="text-center text-zinc-500">Корзина пуста</p>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 rounded-2xl border border-zinc-100 p-3"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    {item.previewUrl ? (
                      <img
                        src={item.previewUrl}
                        alt={item.templateTitle}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                        нет фото
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <p className="text-sm font-medium text-zinc-900">
                      {item.templateTitle}
                    </p>
                    <p className="text-xs text-zinc-500">
                      1 × {formatPrice(item.price)}
                    </p>
                    <p className="text-sm font-semibold text-zinc-900">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="flex h-8 w-8 items-center justify-center self-start rounded-lg text-zinc-400 hover:bg-red-50 hover:text-red-500"
                    aria-label="Удалить"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-zinc-100 p-6">
          <div className="mb-4 flex items-center justify-between text-lg font-semibold">
            <span>Итого к оплате:</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="space-y-2">
            <Link
              href="/cart"
              onClick={onClose}
              className="block w-full rounded-xl bg-lime-200 py-3 text-center text-sm font-semibold text-lime-900 transition hover:bg-lime-300"
            >
              Просмотр корзины
            </Link>
            <Link
              href="/checkout"
              onClick={onClose}
              className="block w-full rounded-xl bg-fuchsia-400 py-3 text-center text-sm font-semibold text-white transition hover:bg-fuchsia-500"
            >
              Оформление заказа
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Download, Loader2, Pencil } from "lucide-react";
import { downloadDesignPng, type DesignSource } from "@/lib/download-design";

export interface PurchasedTemplate {
  id: string;
  orderId: string;
  templateSlug: string;
  templateTitle: string;
  previewUrl: string | null;
  customizationJson: string | null;
}

export interface PurchasedOrder {
  id: string;
  createdAt: string;
  items: PurchasedTemplate[];
}

interface PurchasedTemplatesProps {
  orders: PurchasedOrder[];
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PurchasedTemplates({ orders }: PurchasedTemplatesProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (item: PurchasedTemplate) => {
    setDownloadingId(item.id);
    setError(null);
    try {
      const design: DesignSource = {
        templateSlug: item.templateSlug,
        configJson: item.customizationJson,
      };
      await downloadDesignPng(design, `${item.templateSlug}.png`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось скачать файл. Попробуйте позже.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center shadow-sm">
        <p className="text-zinc-500">У вас пока нет оплаченных заказов.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {orders.map((order) => (
        <div key={order.id} className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 pb-4">
            <p className="text-sm font-semibold text-zinc-900">Заказ №{order.id.slice(0, 8)}</p>
            <p className="text-sm text-zinc-500">{formatDate(order.createdAt)}</p>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50"
              >
                <div className="relative aspect-[148/210] w-full overflow-hidden bg-zinc-100">
                  {item.previewUrl ? (
                    <Image
                      src={item.previewUrl}
                      alt={item.templateTitle}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                      Нет превью
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <p className="line-clamp-2 text-sm font-medium text-zinc-900">
                    {item.templateTitle}
                  </p>
                  <div className="mt-auto space-y-2 pt-3">
                    <Link
                      href={`/template/${item.templateSlug}?order=${item.orderId}&item=${item.id}`}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-fuchsia-300 px-4 py-2 text-xs font-semibold text-zinc-900 transition hover:bg-fuchsia-400 w-full"
                    >
                      <Pencil size={14} />
                      Редактировать
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDownload(item)}
                      disabled={downloadingId === item.id}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-lime-200 px-4 py-2 text-xs font-semibold text-lime-900 transition hover:bg-lime-300 disabled:opacity-60 w-full"
                    >
                      {downloadingId === item.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Download size={14} />
                      )}
                      {downloadingId === item.id ? "Скачивание…" : "Скачать"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

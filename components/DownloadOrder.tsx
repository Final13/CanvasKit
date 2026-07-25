"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { downloadDesignPng, type DesignSource } from "@/lib/download-design";

interface OrderItemDto {
  id: string;
  templateSlug: string;
  templateTitle: string;
  customizationJson: string | null;
}

interface OrderData {
  id: string;
  status: string;
  items: OrderItemDto[];
}

interface DownloadOrderProps {
  orderId: string;
}

export function DownloadOrder({ orderId }: DownloadOrderProps) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setOrder(data))
      .catch(() => {});
  }, [orderId]);

  const handleDownload = async () => {
    if (!order || order.items.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      for (const item of order.items) {
        const design: DesignSource = {
          templateSlug: item.templateSlug,
          configJson: item.customizationJson,
        };
        await downloadDesignPng(design, `${item.templateSlug}.png`);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось скачать файл. Попробуйте позже."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!order || order.items.length === 0) return null;

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-full bg-lime-200 px-6 py-2.5 text-sm font-semibold text-lime-900 transition hover:bg-lime-300 disabled:opacity-60"
      >
        <Download size={16} />
        {loading ? "Скачивание…" : "Скачать приглашение"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}

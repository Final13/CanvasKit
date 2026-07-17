"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, ShoppingCart } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { DEFAULT_PRICE } from "@/lib/cart";
import { downloadDesignPng } from "@/lib/download-design";

export interface SavedDesignItem {
  id: string;
  templateSlug: string;
  name: string;
  preview: string | null;
  configJson: string | null;
  createdAt: string | null;
}

interface SavedDesignsProps {
  designs: SavedDesignItem[];
  purchasedSlugs: string[];
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function SavedDesigns({ designs, purchasedSlugs }: SavedDesignsProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (designs.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center shadow-sm">
        <p className="text-zinc-500">Сохранённые дизайны появятся здесь.</p>
        <p className="mt-2 text-sm text-zinc-400">
          Откройте шаблон в редакторе и нажмите кнопку сохранения.
        </p>
      </div>
    );
  }

  const handleDownload = async (design: SavedDesignItem) => {
    setLoadingId(design.id);
    setError("");
    try {
      await downloadDesignPng(
        { templateSlug: design.templateSlug, configJson: design.configJson },
        `${design.name}.png`
      );
    } catch (e: any) {
      setError(e.message || "Не удалось скачать файл");
    } finally {
      setLoadingId(null);
    }
  };

  const handleBuy = (design: SavedDesignItem) => {
    addItem({
      templateSlug: design.templateSlug,
      templateTitle: design.name,
      previewUrl:
        design.preview ?? `/templates/${design.templateSlug}/preview.webp`,
      price: DEFAULT_PRICE,
      customizationJson: design.configJson ?? "",
    });
    router.push("/cart");
  };

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {designs.map((design) => {
          const purchased = purchasedSlugs.includes(design.templateSlug);
          return (
            <div
              key={design.id}
              className="overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-sm"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-zinc-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    design.preview ??
                    `/templates/${design.templateSlug}/preview.webp`
                  }
                  alt={design.name}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="p-4">
                <p className="font-medium text-zinc-900">{design.name}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  {formatDate(design.createdAt)}
                  {purchased && (
                    <span className="ml-2 rounded-full bg-lime-100 px-2 py-0.5 text-[11px] font-semibold text-lime-800">
                      Куплено
                    </span>
                  )}
                </p>
                <div className="mt-3 flex gap-2">
                  {purchased ? (
                    <button
                      onClick={() => handleDownload(design)}
                      disabled={loadingId === design.id}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-lime-950 transition hover:bg-lime-300 disabled:opacity-60"
                    >
                      <Download size={16} />
                      {loadingId === design.id ? "Подготовка…" : "Скачать"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuy(design)}
                      className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-fuchsia-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
                    >
                      <ShoppingCart size={16} />
                      Купить
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { renderDesignImage } from "@/lib/download-design";
import type { SavedDesignItem } from "./SavedDesigns";

interface ConvertDesignsProps {
  designs: SavedDesignItem[];
}

export function ConvertDesigns({ designs }: ConvertDesignsProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (designs.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center shadow-sm">
        <p className="text-zinc-500">
          Здесь появятся ваши купленные сохранённые дизайны для конвертации в
          PDF.
        </p>
      </div>
    );
  }

  const handleConvert = async (design: SavedDesignItem) => {
    setLoadingId(design.id);
    setError("");
    try {
      const { dataUrl, width, height } = await renderDesignImage(
        { templateSlug: design.templateSlug, configJson: design.configJson },
        "jpeg"
      );
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: width > height ? "landscape" : "portrait",
        unit: "px",
        format: [width, height],
        hotfixes: ["px_scaling"],
      });
      doc.addImage(dataUrl, "JPEG", 0, 0, width, height);
      doc.save(`${design.name}.pdf`);
    } catch (e: any) {
      setError(e.message || "Не удалось конвертировать файл");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {designs.map((design) => (
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
              <button
                onClick={() => handleConvert(design)}
                disabled={loadingId === design.id}
                className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-lime-400 px-4 py-2 text-sm font-semibold text-lime-950 transition hover:bg-lime-300 disabled:opacity-60"
              >
                <FileDown size={16} />
                {loadingId === design.id ? "Конвертация…" : "Скачать PDF"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

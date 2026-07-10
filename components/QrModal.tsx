"use client";

import { useState } from "react";
import { generateQR } from "@/lib/qr";
import { X } from "lucide-react";

interface QrModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (dataUrl: string) => void;
}

export function QrModal({ open, onClose, onInsert }: QrModalProps) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const dataUrl = await generateQR(text);
      onInsert(dataUrl);
      setText("");
      onClose();
    } catch (e: any) {
      setError(e.message || "Ошибка генерации QR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Добавить QR-код</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mb-3 text-sm text-zinc-500">
          Вставьте ссылку или текст, которые будут закодированы в QR.
        </p>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="https://example.com"
          className="mb-3 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-black"
        />
        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={loading || !text.trim()}
          className="w-full rounded-xl bg-black py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Генерация..." : "Вставить QR-код"}
        </button>
      </div>
    </div>
  );
}

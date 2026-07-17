"use client";

import { useState } from "react";
import { X } from "lucide-react";

export type SaveTarget = "account" | "local";

interface SaveDesignModalProps {
  open: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
  defaultName: string;
  onSave: (name: string, email?: string) => Promise<SaveTarget>;
}

export function SaveDesignModal({
  open,
  onClose,
  isAuthenticated,
  defaultName,
  onSave,
}: SaveDesignModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedTo, setSavedTo] = useState<SaveTarget | null>(null);

  // Сброс состояния при каждом открытии модалки (adjust state during render)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setName("");
      setEmail("");
      setError("");
      setSavedTo(null);
      setLoading(false);
    }
  }

  if (!open) return null;

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const target = await onSave(name.trim() || defaultName, email.trim() || undefined);
      setSavedTo(target);
    } catch (e: any) {
      setError(e.message || "Не удалось сохранить дизайн");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 pt-10 shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <X size={20} />
        </button>

        {savedTo ? (
          <p className="py-4 text-center text-sm text-zinc-700">
            {savedTo === "account"
              ? "Дизайн сохранён в личном кабинете — вкладка «Сохранённые дизайны»."
              : "Дизайн сохранён на этом устройстве. Войдите или укажите email, чтобы сохранить его в личном кабинете."}
          </p>
        ) : (
          <>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Необязательно: Введите название"
              className="mb-3 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-lime-500"
            />
            {!isAuthenticated && (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email — чтобы сохранить в личном кабинете"
                  className="mb-2 w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm outline-none focus:border-lime-500"
                />
                <p className="mb-3 text-xs text-zinc-500">
                  Без email дизайн сохранится только на этом устройстве. Если
                  указать email, создадим аккаунт автоматически.
                </p>
              </>
            )}
            {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
            <div className="flex justify-center">
              <button
                onClick={handleSave}
                disabled={loading}
                className="cursor-pointer rounded-xl bg-lime-500 px-8 py-3 text-sm font-semibold uppercase text-white transition hover:bg-lime-600 disabled:opacity-50"
              >
                {loading ? "Сохранение…" : "Сохранить дизайн"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

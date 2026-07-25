"use client";

import { X } from "lucide-react";

interface UnsavedChangesModalProps {
  open: boolean;
  onSave: () => void;
  onLeave: () => void;
  onStay: () => void;
}

export function UnsavedChangesModal({
  open,
  onSave,
  onLeave,
  onStay,
}: UnsavedChangesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 pt-10 shadow-xl">
        <button
          onClick={onStay}
          className="absolute right-4 top-4 cursor-pointer rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-semibold text-zinc-900">
          Несохранённые изменения
        </h3>
        <p className="mt-2 text-sm text-zinc-600">
          У вас есть несохранённые изменения в дизайне. Сохранить перед уходом?
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={onSave}
            className="w-full cursor-pointer rounded-xl bg-lime-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-lime-600"
          >
            Сохранить и выйти
          </button>
          <button
            onClick={onLeave}
            className="w-full cursor-pointer rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
          >
            Выйти без сохранения
          </button>
          <button
            onClick={onStay}
            className="w-full cursor-pointer rounded-xl bg-zinc-100 px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-200"
          >
            Остаться
          </button>
        </div>
      </div>
    </div>
  );
}

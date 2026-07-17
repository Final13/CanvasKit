"use client";

import { Undo2, Redo2, QrCode, Save } from "lucide-react";

interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onQR: () => void;
  onSave: () => void;
}

export function Toolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onQR,
  onSave,
}: ToolbarProps) {
  const btn =
    "flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-30 sm:h-11 sm:w-11";

  return (
    <div className="flex w-full items-center gap-1 bg-black px-4 py-3 sm:gap-2">
      <button
        onClick={onReset}
        className="mr-auto cursor-pointer rounded-xl px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        Заново
      </button>
      <button className={btn} onClick={onUndo} disabled={!canUndo} title="Назад">
        <Undo2 size={20} />
      </button>
      <button className={btn} onClick={onRedo} disabled={!canRedo} title="Вперед">
        <Redo2 size={20} />
      </button>
      <button className={btn} onClick={onQR} title="QR-код">
        <QrCode size={20} />
      </button>
      <button className={btn} onClick={onSave} title="Сохранить дизайн">
        <Save size={20} />
      </button>
    </div>
  );
}

"use client";

import { Undo2, Redo2, RotateCcw, QrCode, Save } from "lucide-react";

interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onQR: () => void;
  onDownload: () => void;
}

export function Toolbar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
  onQR,
  onDownload,
}: ToolbarProps) {
  const btn =
    "flex h-10 w-10 items-center justify-center rounded-xl text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-30 sm:h-11 sm:w-11";

  return (
    <div className="flex w-full items-center justify-center gap-1 bg-black px-4 py-3 sm:gap-2">
      <button className={btn} onClick={onUndo} disabled={!canUndo} title="Назад">
        <Undo2 size={20} />
      </button>
      <button className={btn} onClick={onRedo} disabled={!canRedo} title="Вперед">
        <Redo2 size={20} />
      </button>
      <button className={btn} onClick={onReset} title="Сбросить">
        <RotateCcw size={20} />
      </button>
      <button className={btn} onClick={onQR} title="QR-код">
        <QrCode size={20} />
      </button>
      <button
        className={btn}
        onClick={onDownload}
        title="Скачать PNG"
      >
        <Save size={20} />
      </button>
    </div>
  );
}

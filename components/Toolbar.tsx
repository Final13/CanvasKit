"use client";

import {
  Undo2,
  Redo2,
  RotateCcw,
  QrCode,
  Save,
  Download,
  Trash2,
} from "lucide-react";

interface ToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
  onQR: () => void;
  onSave: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export function Toolbar({
  canUndo,
  canRedo,
  hasSelection,
  onUndo,
  onRedo,
  onReset,
  onQR,
  onSave,
  onDownload,
  onDelete,
}: ToolbarProps) {
  const btn =
    "flex h-10 w-10 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-30";

  return (
    <div className="flex w-full items-center justify-between gap-2 rounded-t-2xl bg-black px-4 py-3">
      <div className="flex items-center gap-1">
        <button className={btn} onClick={onUndo} disabled={!canUndo} title="Назад">
          <Undo2 size={20} />
        </button>
        <button className={btn} onClick={onRedo} disabled={!canRedo} title="Вперед">
          <Redo2 size={20} />
        </button>
        <button className={btn} onClick={onReset} title="Сбросить">
          <RotateCcw size={20} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button className={btn} onClick={onQR} title="QR-код">
          <QrCode size={20} />
        </button>
        <button className={btn} onClick={onSave} title="Сохранить">
          <Save size={20} />
        </button>
        <button
          className={btn}
          onClick={onDelete}
          disabled={!hasSelection}
          title="Удалить выбранное"
        >
          <Trash2 size={20} />
        </button>
        <button
          className="ml-2 flex h-10 items-center gap-2 rounded-full bg-lime-300 px-4 font-semibold text-black transition hover:bg-lime-400"
          onClick={onDownload}
        >
          <Download size={18} />
          <span className="hidden text-sm sm:inline">Скачать PNG</span>
        </button>
      </div>
    </div>
  );
}

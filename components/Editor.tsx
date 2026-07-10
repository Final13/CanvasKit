"use client";

import { useRef, useEffect, useState } from "react";
import { useFabric } from "@/hooks/useFabric";
import { Toolbar } from "./Toolbar";
import { TabPanel } from "./TabPanel";
import { QrModal } from "./QrModal";

export function Editor() {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const [qrOpen, setQrOpen] = useState(false);

  const {
    ready,
    activeObject,
    canUndo,
    canRedo,
    addText,
    addImageFromFile,
    addQR,
    deleteSelected,
    undo,
    redo,
    reset,
    saveJSON,
    downloadPNG,
  } = useFabric(canvasElRef);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // avoid deleting while editing text
        const target = e.target as HTMLElement;
        if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
        deleteSelected();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [deleteSelected, undo, redo]);

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <Toolbar
        canUndo={canUndo}
        canRedo={canRedo}
        hasSelection={!!activeObject}
        onUndo={undo}
        onRedo={redo}
        onReset={reset}
        onQR={() => setQrOpen(true)}
        onSave={saveJSON}
        onDownload={downloadPNG}
        onDelete={deleteSelected}
      />

      <div className="relative w-full max-w-[420px] aspect-[148/210] overflow-hidden rounded-none bg-black shadow-2xl">
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
            Загрузка редактора…
          </div>
        )}
        <canvas
          ref={canvasElRef}
          className="block h-full w-full"
          style={{ touchAction: "none" }}
        />
      </div>

      <TabPanel
        onAddText={addText}
        onAddPhoto={addImageFromFile}
        onSave={saveJSON}
      />

      <QrModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        onInsert={(dataUrl) => {
          addQR(dataUrl);
          setQrOpen(false);
        }}
      />
    </div>
  );
}

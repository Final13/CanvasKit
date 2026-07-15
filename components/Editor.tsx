"use client";

import { useRef, useEffect, useState } from "react";
import { useFabric } from "@/hooks/useFabric";
import { Toolbar } from "./Toolbar";
import { EditorTabs, type TabKey } from "./EditorTabs";
import { TabPanel } from "./TabPanel";
import { QrModal } from "./QrModal";
import type { TemplateData } from "@/lib/templates";

interface EditorProps {
  template: TemplateData;
}

export function Editor({ template }: EditorProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("text");

  const {
    ready,
    canUndo,
    canRedo,
    addText,
    addImageFromFile,
    addQR,
    deleteSelected,
    undo,
    redo,
    reset,
    downloadPNG,
    activeObject,
    activeObjectTick,
    updateActiveObject,
  } = useFabric(canvasElRef, template);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        const target = e.target as HTMLElement;
        if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA")
          return;
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
    <div className="flex w-full max-w-sm flex-col items-center sm:max-w-md md:max-w-lg">
      <div className="w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
        <Toolbar
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          onReset={reset}
          onQR={() => setQrOpen(true)}
          onDownload={downloadPNG}
        />

        <EditorTabs active={activeTab} onChange={setActiveTab} />

        <div className="relative w-full aspect-[148/210] overflow-hidden bg-black">
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
          activeTab={activeTab}
          onAddText={addText}
          onAddPhoto={addImageFromFile}
          onDigitsChange={() => {}}
          activeObject={activeObject}
          updateActiveObject={updateActiveObject}
          fonts={template.fonts}
        />
      </div>

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

"use client";

import { useRef, useEffect, useState } from "react";
import { useFabric } from "@/hooks/useFabric";
import { Toolbar } from "./Toolbar";
import { EditorTabs, type TabKey } from "./EditorTabs";
import { TabPanel } from "./TabPanel";
import { QrModal } from "./QrModal";
import { SaveDesignModal, type SaveTarget } from "./SaveDesignModal";
import type { TemplateData } from "@/lib/templates";
import { useCart } from "@/components/CartProvider";
import { CartSidebar } from "@/components/CartSidebar";
import { DEFAULT_PRICE, formatPrice } from "@/lib/cart";
import {
  getDesignDraft,
  saveDesignDraft,
  clearDesignDraft,
} from "@/lib/design-draft";

interface EditorProps {
  template: TemplateData;
  isAuthenticated?: boolean;
}

export function Editor({ template, isAuthenticated = false }: EditorProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const [qrOpen, setQrOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("text");
  const { addItem } = useCart();

  const slug = template.metadata.slug;
  const [draft] = useState(() => getDesignDraft(slug));

  const {
    ready,
    canUndo,
    canRedo,
    addText,
    addImageFromFile,
    addQR,
    updateDigits,
    updateDigitColor,
    deleteSelected,
    undo,
    redo,
    reset,
    getPreviewDataUrl,
    getCanvasJson,
    activeObject,
    updateActiveObject,
  } = useFabric(canvasElRef, template, draft?.json ?? null);

  const handleAddToCart = () => {
    const customizationJson = getCanvasJson();
    if (!customizationJson) return;
    addItem({
      templateSlug: slug,
      templateTitle: template.metadata.title,
      previewUrl: `/templates/${slug}/preview.webp`,
      price: DEFAULT_PRICE,
      customizationJson,
    });
    setCartOpen(true);
  };

  const handleReset = () => {
    clearDesignDraft(slug);
    reset();
  };

  const handleSaveDesign = async (
    name: string,
    email?: string
  ): Promise<SaveTarget> => {
    const customizationJson = getCanvasJson();
    if (!customizationJson) throw new Error("Редактор ещё загружается");

    saveDesignDraft(slug, name, customizationJson);

    if (!isAuthenticated && !email) return "local";

    const res = await fetch("/api/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateSlug: slug,
        name,
        preview: getPreviewDataUrl() ?? undefined,
        configJson: customizationJson,
        email,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || "Ошибка сохранения");
    }
    return "account";
  };

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
          onReset={handleReset}
          onQR={() => setQrOpen(true)}
          onSave={() => setSaveOpen(true)}
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
          onDigitsChange={updateDigits}
          onDigitColorChange={updateDigitColor}
          activeObject={activeObject}
          updateActiveObject={updateActiveObject}
          fonts={template.fonts}
        />
      </div>

      <div className="mt-6 w-full max-w-sm sm:max-w-md md:max-w-lg">
        <div className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500">Цена за приглашение</p>
              <p className="text-2xl font-bold text-zinc-900">
                {formatPrice(DEFAULT_PRICE)}
              </p>
            </div>
            <button
              onClick={handleAddToCart}
              className="cursor-pointer rounded-xl bg-fuchsia-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
            >
              В корзину
            </button>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Редактировать приглашение и вносить свои данные можно до оформления
            заказа. После оплаты файлы будут доступны в личном кабинете.
          </p>
        </div>
      </div>

      <QrModal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        onInsert={(dataUrl) => {
          addQR(dataUrl);
          setQrOpen(false);
        }}
      />

      <SaveDesignModal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        isAuthenticated={isAuthenticated}
        defaultName={template.metadata.title}
        onSave={handleSaveDesign}
      />

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

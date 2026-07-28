"use client";

import Image from "next/image";
import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  BadgeCheck,
  PenLine,
  Zap,
  Headset,
  Gift,
  TriangleAlert,
} from "lucide-react";
import { useFabric } from "@/hooks/useFabric";
import { Toolbar } from "./Toolbar";
import { EditorTabs, type TabKey } from "./EditorTabs";
import { QrModal } from "./QrModal";
import { ObjectControlsPanel } from "./ObjectControlsPanel";
import { PAYMENT_METHODS } from "./PaymentMethods";
import { SaveDesignModal, type SaveTarget } from "./SaveDesignModal";
import { UnsavedChangesModal } from "./UnsavedChangesModal";
import type { TemplateData } from "@/lib/templates";
import { useCart } from "@/components/CartProvider";
import { CartSidebar } from "@/components/CartSidebar";
import { DEFAULT_PRICE, formatPrice, getCartFromStorage } from "@/lib/cart";
import { getDesignDraft, saveDesignDraft, clearDesignDraft } from "@/lib/design-draft";

interface EditorProps {
  template: TemplateData;
  isAuthenticated?: boolean;
}

// дефолты для кнопки «Цифры» (нижняя панель с выбором возраста убрана)
const DIGIT_AGE = 30;
const DIGIT_COLOR = "gold";

// фичи под редактором (как на evyt)
const EDITOR_FEATURES = [
  { icon: BadgeCheck, label: "Оригинальный дизайн" },
  { icon: PenLine, label: "Полная персонализация" },
  { icon: Zap, label: "Моментальное скачивание" },
  { icon: Headset, label: "Техническая поддержка" },
];

// Водяной знак поверх канваса редактора (как на evyt): скриншот бесполезен,
// а оплаченный PNG рендерится отдельно и остаётся чистым.
// Оверлей HTML-ом — в toDataURL канваса не попадает.
const WATERMARK_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="180">` +
  `<text x="130" y="95" font-family="Arial, sans-serif" font-size="24" font-weight="600" text-anchor="middle" ` +
  `transform="rotate(-25 130 90)" fill="rgba(255,255,255,0.35)" stroke="rgba(0,0,0,0.2)" stroke-width="0.6">evspc.com</text></svg>`;
const WATERMARK_BG = `url("data:image/svg+xml,${encodeURIComponent(WATERMARK_SVG)}")`;

export function Editor({ template, isAuthenticated = false }: EditorProps) {
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [qrOpen, setQrOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [saveOpen, setSaveOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [unsavedModalOpen, setUnsavedModalOpen] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [digitColor, setDigitColor] = useState(DIGIT_COLOR);
  const { addItem, updateItem } = useCart();
  const searchParams = useSearchParams();
  // Режим редактирования товара корзины: /template/slug?edit=<cartItemId>.
  // Канва грузится из customizationJson этого товара, а кнопка «В корзину»
  // заменяется на «Сохранить» (обновляет товар, а не добавляет новый).
  const editId = searchParams.get("edit");

  const slug = template.metadata.slug;
  const [draft] = useState(() => getDesignDraft(slug));
  const [editJson] = useState(() => {
    if (!editId) return null;
    return (
      getCartFromStorage().find((i) => i.id === editId)?.customizationJson ??
      null
    );
  });
  // База для dirty-проверки — последний ЗАХВАЧЕННЫЙ снапшот canvas:
  // загруженный черновик, дизайн из корзины (режим edit), сохранение,
  // сброс или добавление в корзину.
  const savedJsonRef = useRef<string | null>(
    editJson ?? draft?.json ?? null
  );

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
    activeObjectTick,
    selectionRect,
    updateActiveObject,
    saveHistory,
    flipActiveObject,
  } = useFabric(canvasElRef, template, editJson ?? draft?.json ?? null);

  // Верхние кнопки (Цифры/Текст/Фото) — добавление блока на канвас.
  // Хуки добавления сами переносят фокус на новый объект.
  const handleEditorAction = (tab: TabKey) => {
    if (tab === "text") {
      addText();
    } else if (tab === "digits") {
      updateDigits(DIGIT_AGE, digitColor);
    } else if (tab === "photo") {
      fileInputRef.current?.click();
    }
  };

  const handleAddToCart = async () => {
    const customizationJson = getCanvasJson();
    if (!customizationJson) return;
    addItem({
      templateSlug: slug,
      templateTitle: template.metadata.title,
      // превью — рендер текущего канваса с правками (как на evyt), а не дефолт шаблона
      previewUrl: (await getPreviewDataUrl(480)) ?? `/templates/${slug}/preview.webp`,
      price: template.metadata.price ?? DEFAULT_PRICE,
      customizationJson,
    });
    setCartOpen(true);
    savedJsonRef.current = customizationJson;
    setHasUnsavedChanges(false);
  };

  // Режим edit: сохраняем правки в тот же товар корзины и уходим в корзину
  const handleSaveEdit = async () => {
    const customizationJson = getCanvasJson();
    if (!customizationJson || !editId) return;
    const preview = await getPreviewDataUrl(480);
    updateItem(editId, {
      customizationJson,
      ...(preview ? { previewUrl: preview } : {}),
    });
    savedJsonRef.current = customizationJson;
    setHasUnsavedChanges(false);
    router.push("/cart");
  };

  const handleReset = async () => {
    clearDesignDraft(slug);
    await reset();
    savedJsonRef.current = getCanvasJson();
    setHasUnsavedChanges(false);
  };

  const handleSaveDesign = async (name: string, email?: string): Promise<SaveTarget> => {
    const customizationJson = getCanvasJson();
    if (!customizationJson) throw new Error("Редактор ещё загружается");

    saveDesignDraft(slug, name, customizationJson);
    savedJsonRef.current = customizationJson;

    if (!isAuthenticated && !email) return "local";

    const res = await fetch("/api/designs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        templateSlug: slug,
        name,
        preview: (await getPreviewDataUrl()) ?? undefined,
        configJson: customizationJson,
        email,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || "Ошибка сохранения");
    }
    setHasUnsavedChanges(false);
    return "account";
  };

  // Отслеживаем изменения в canvas относительно последнего захваченного
  // снапшота (savedJsonRef)
  useEffect(() => {
    if (!ready) return;
    const checkChanges = () => {
      const current = getCanvasJson();
      if (current && current !== savedJsonRef.current) {
        setHasUnsavedChanges(true);
      }
    };
    const interval = setInterval(checkChanges, 2000);
    return () => clearInterval(interval);
  }, [ready, getCanvasJson]);

  // Блокировка навигации при несохранённых изменениях
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    // Перехват popstate (back/forward кнопки браузера)
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      // Возвращаем пользователя обратно на текущую страницу
      // (search сохраняем, иначе теряется ?edit= и режим редактирования)
      window.history.pushState(null, "", pathname + window.location.search);
      setUnsavedModalOpen(true);
      setPendingUrl(null); // popstate — не знаем целевой URL
    };

    // Перехват кликов по ссылкам
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("http") || href.startsWith("#")) return;

      // Внутренняя ссылка — проверяем несохранённые изменения
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.stopPropagation();
        setPendingUrl(href);
        setUnsavedModalOpen(true);
      }
    };

    // Подменяем history state чтобы перехватить back
    window.history.pushState(null, "", pathname + window.location.search);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleClick, true);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleClick, true);
    };
  }, [hasUnsavedChanges, pathname]);

  // beforeunload для закрытия вкладки/обновления
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "У вас есть несохранённые изменения. Сохранить дизайн?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleSaveAndLeave = useCallback(async () => {
    try {
      await handleSaveDesign(template.metadata.title);
      setUnsavedModalOpen(false);
      if (pendingUrl) {
        router.push(pendingUrl);
      }
    } catch {
      // ошибка сохранения — остаёмся
    }
  }, [pendingUrl, router, template.metadata.title]);

  const handleLeaveWithoutSave = useCallback(() => {
    setHasUnsavedChanges(false);
    setUnsavedModalOpen(false);
    if (pendingUrl) {
      router.push(pendingUrl);
    } else {
      window.history.back();
    }
  }, [pendingUrl, router]);

  const handleStay = useCallback(() => {
    setUnsavedModalOpen(false);
    setPendingUrl(null);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
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
    <>
      <div className="mx-auto flex w-full max-w-sm flex-col items-center sm:max-w-md md:max-w-lg">
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

        <EditorTabs onAction={handleEditorAction} />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) addImageFromFile(file);
            e.target.value = "";
          }}
        />

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
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-[5]"
            style={{ backgroundImage: WATERMARK_BG }}
          />
          <ObjectControlsPanel
            activeObject={activeObject}
            tick={activeObjectTick}
            rect={selectionRect}
            updateActiveObject={updateActiveObject}
            saveHistory={saveHistory}
            flipActiveObject={flipActiveObject}
            digitColor={digitColor}
            onDigitColorChange={(color) => {
              setDigitColor(color);
              updateDigitColor(DIGIT_AGE, color);
            }}
            fonts={template.fonts}
          />
        </div>
      </div>
      </div>

      <section className="mt-10 w-full">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {EDITOR_FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 py-1">
              <Icon size={20} className="shrink-0 text-zinc-700" />
              <span className="text-xs font-medium text-zinc-800 sm:text-sm">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_340px]">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-900">
              <Gift size={16} />
              Что вы получите
            </h2>
            <ul className="mt-3 space-y-1.5 text-sm text-zinc-700">
              <li>Приглашение: А5 (14,8 × 21 см)</li>
              <li>Формат: электронный (PNG)</li>
              <li>
                Конвертация в PDF доступна в личном кабинете после оформления
                заказа.
              </li>
            </ul>

            <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-zinc-900">
              Описание
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600">
              «{template.metadata.title}» — готовый шаблон приглашения, который
              можно персонализировать онлайн за пару минут. Укажите детали
              мероприятия, настройте текст и фото в редакторе — готовый файл
              будет доступен для скачивания сразу после оплаты. Созданное
              приглашение можно сразу отправить гостям.
            </p>
          </div>

          <div className="h-fit rounded-2xl bg-white p-6 shadow-lg">
            <p className="text-sm text-zinc-500">Цена за приглашение</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">
              {formatPrice(template.metadata.price ?? DEFAULT_PRICE)}
            </p>
            {editId ? (
              <button
                onClick={handleSaveEdit}
                className="mt-4 w-full cursor-pointer rounded-xl bg-fuchsia-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
              >
                Сохранить
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="mt-4 w-full cursor-pointer rounded-xl bg-fuchsia-400 px-6 py-3 text-sm font-semibold text-white transition hover:bg-fuchsia-500"
              >
                В корзину
              </button>
            )}
            <p className="mt-3 flex items-start gap-1.5 text-xs text-zinc-500">
              <TriangleAlert size={14} className="mt-0.5 shrink-0" />
              Перед оплатой проверьте и внесите свои данные в приглашение.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 opacity-70">
              {PAYMENT_METHODS.map((m) => (
                <Image
                  key={m.type}
                  src={m.iconSrc}
                  alt={m.label}
                  title={m.label}
                  width={40}
                  height={24}
                  className="h-5 w-auto"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

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

      <UnsavedChangesModal
        open={unsavedModalOpen}
        onSave={handleSaveAndLeave}
        onLeave={handleLeaveWithoutSave}
        onStay={handleStay}
      />

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

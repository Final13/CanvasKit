/**
 * Клиентский рендер сохранённого дизайна (JSON fabric-холста) в изображение.
 * Размеры холста и шрифты берутся из публичного template.json шаблона.
 */
import { getFabric } from "@/lib/fabric";
import { injectFonts, loadFonts } from "@/hooks/useFabric";
import type { TemplateData } from "@/lib/templates";

export interface DesignSource {
  templateSlug: string;
  configJson: string | null;
}

export interface RenderedDesign {
  dataUrl: string;
  width: number;
  height: number;
}

const templateCache = new Map<string, Promise<TemplateData | null>>();

function loadTemplateJson(slug: string): Promise<TemplateData | null> {
  let cached = templateCache.get(slug);
  if (!cached) {
    cached = fetch(`/templates/${slug}/template.json`)
      .then((res) => (res.ok ? (res.json() as Promise<TemplateData>) : null))
      .catch(() => null);
    templateCache.set(slug, cached);
  }
  return cached;
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function renderDesignImage(
  design: DesignSource,
  format: "png" | "jpeg" = "png"
): Promise<RenderedDesign> {
  const fabric = await getFabric();
  const template = await loadTemplateJson(design.templateSlug);

  if (template?.fonts?.length) {
    injectFonts(template.fonts);
    await loadFonts(template.fonts);
  }

  let canvasJson: unknown = null;
  if (design.configJson) {
    try {
      canvasJson = JSON.parse(design.configJson);
    } catch {
      canvasJson = null;
    }
  }
  if (!canvasJson && template) {
    canvasJson = {
      version: "5.3.0",
      objects: template.objects,
      background: template.canvas.background || "",
    };
  }
  if (!canvasJson) {
    throw new Error("Нет данных дизайна");
  }

  const width = template?.canvas?.width ?? 1748;
  const height = template?.canvas?.height ?? 2480;

  const canvasEl = document.createElement("canvas");
  const canvas = new fabric.StaticCanvas(canvasEl, {
    width,
    height,
    enableRetinaScaling: false,
  });

  try {
    await new Promise<void>((resolve) => {
      canvas.loadFromJSON(canvasJson, () => {
        canvas.renderAll();
        resolve();
      });
    });
    const dataUrl = canvas.toDataURL(
      format === "jpeg"
        ? { format: "jpeg", quality: 0.92, multiplier: 1 }
        : { format: "png", multiplier: 1 }
    );
    return { dataUrl, width, height };
  } finally {
    canvas.dispose();
  }
}

export async function downloadDesignPng(
  design: DesignSource,
  filename: string
): Promise<void> {
  const { dataUrl } = await renderDesignImage(design, "png");
  downloadDataUrl(dataUrl, filename);
}

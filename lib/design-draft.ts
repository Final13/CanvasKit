/**
 * Черновик дизайна шаблона в localStorage — подгружается при возврате в редактор.
 */

export interface DesignDraft {
  name: string;
  json: string;
  updatedAt: number;
}

function draftKey(templateSlug: string): string {
  return `canvaskit-design-draft-${templateSlug}`;
}

export function getDesignDraft(templateSlug: string): DesignDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(draftKey(templateSlug));
    return raw ? (JSON.parse(raw) as DesignDraft) : null;
  } catch {
    return null;
  }
}

export function saveDesignDraft(
  templateSlug: string,
  name: string,
  json: string
): void {
  if (typeof window === "undefined") return;
  try {
    const draft: DesignDraft = { name, json, updatedAt: Date.now() };
    localStorage.setItem(draftKey(templateSlug), JSON.stringify(draft));
  } catch {
    // localStorage переполнен — игнорируем, дизайн останется только в БД
  }
}

export function clearDesignDraft(templateSlug: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(draftKey(templateSlug));
}

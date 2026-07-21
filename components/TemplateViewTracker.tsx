"use client";

import { useEffect } from "react";

/** Один просмотр на шаблон за сессию вкладки (не считаем повторные заходы). */
const tracked = new Set<string>();

export function TemplateViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    if (tracked.has(slug)) return;
    tracked.add(slug);
    fetch("/api/templates/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);

  return null;
}

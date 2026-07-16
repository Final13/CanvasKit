"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "evspc-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(STORAGE_KEY);
      if (!accepted) setVisible(true);
    } catch {
      // ignore
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-zinc-100 bg-white p-4 shadow-2xl sm:bottom-6 sm:left-6 sm:right-auto">
      <div className="flex items-center gap-3">
        <span className="text-lg">🍪</span>
        <p className="text-sm text-zinc-700">
          Мы используем{" "}
          <Link href="/cookies" className="text-fuchsia-600 underline">
            cookie
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="ml-auto shrink-0 rounded-full bg-fuchsia-200 px-4 py-1.5 text-sm font-semibold text-fuchsia-900 transition hover:bg-fuchsia-300"
        >
          OK
        </button>
      </div>
    </div>
  );
}

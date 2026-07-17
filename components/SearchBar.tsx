"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchResult {
  slug: string;
  title: string;
  preview: string | null;
}

interface SearchBarProps {
  autoFocus?: boolean;
  onNavigate?: () => void;
}

export function SearchBar({ autoFocus, onNavigate }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setTotal(data.total ?? 0);
        setOpen(true);
      } catch {
        // сеть недоступна — просто не показываем подсказки
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleChange = (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setTotal(0);
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    onNavigate?.();
    router.push(href);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length >= 2) go(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 focus-within:border-fuchsia-400">
          <Search size={18} className="shrink-0 text-zinc-400" />
          <input
            type="text"
            value={query}
            autoFocus={autoFocus}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
            placeholder="Поиск приглашений…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
      </form>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-zinc-100 bg-white shadow-xl">
          <ul className="max-h-80 overflow-y-auto py-2">
            {results.map((r) => (
              <li key={r.slug}>
                <button
                  type="button"
                  onClick={() => go(`/template/${r.slug}`)}
                  className="flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left transition hover:bg-zinc-50"
                >
                  {r.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.preview}
                      alt=""
                      className="h-12 w-9 shrink-0 rounded object-cover"
                    />
                  ) : (
                    <span className="h-12 w-9 shrink-0 rounded bg-zinc-100" />
                  )}
                  <span className="line-clamp-2 text-sm text-zinc-800">
                    {r.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {total > results.length && (
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
              }}
              className="block border-t border-zinc-100 px-3 py-2.5 text-center text-sm font-medium text-fuchsia-600 transition hover:bg-fuchsia-50"
            >
              Все результаты ({total})
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

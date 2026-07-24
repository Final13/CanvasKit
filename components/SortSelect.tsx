"use client";

import { usePathname, useRouter } from "next/navigation";

export const SORT_OPTIONS = [
  { value: "popular", label: "По популярности" },
  { value: "new", label: "По новизне" },
  { value: "price-asc", label: "По возрастанию цены" },
  { value: "price-desc", label: "По убыванию цены" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

interface SortSelectProps {
  current: string;
  onSortChange?: (value: string) => void;
}

export function SortSelect({ current, onSortChange }: SortSelectProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onSortChange) {
      onSortChange(e.target.value);
    } else {
      router.push(`${pathname}?sort=${e.target.value}`);
    }
  };

  return (
    <select
      aria-label="Сортировка шаблонов"
      value={current}
      onChange={handleChange}
      className="cursor-pointer rounded-lg border border-zinc-200 bg-white py-2 pl-3 pr-8 text-sm text-zinc-900 shadow-sm outline-none transition hover:border-zinc-300 focus:border-fuchsia-400"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

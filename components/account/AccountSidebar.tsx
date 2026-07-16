"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, FileText, Heart, ImageIcon } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

interface AccountSidebarProps {
  name: string | null;
  email: string;
}

const nav = [
  { label: "Заказы", href: "/my-account/orders", icon: FileText },
  { label: "Сохранённые дизайны", href: "/my-account/saved", icon: Heart },
  { label: "Изменить аккаунт", href: "/my-account/edit", icon: User },
  { label: "PNG в PDF", href: "/my-account/convert", icon: ImageIcon },
];

export function AccountSidebar({ name, email }: AccountSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4 border-b border-zinc-100 pb-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-200 text-zinc-500">
          <User size={32} />
        </div>
        <div>
          <p className="text-base font-semibold text-zinc-900">
            {name || email}
          </p>
          <p className="text-sm text-zinc-500">{email}</p>
          <LogoutButton className="mt-2 text-xs font-medium text-zinc-500 underline underline-offset-2 hover:text-red-500" />
        </div>
      </div>

      <nav className="mt-4 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                active
                  ? "bg-fuchsia-50 text-fuchsia-700"
                  : "text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

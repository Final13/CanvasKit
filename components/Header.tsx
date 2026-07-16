"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingCart,
  User,
  ChevronDown,
  PartyPopper,
  Cake,
  Sparkles,
  LogOut,
} from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/cart";
import { CartSidebar } from "@/components/CartSidebar";

const birthdayMenu = {
  title: "День рождения",
  href: "/category/birthday",
  groups: [
    {
      title: "Детям",
      items: [
        { label: "Девочке", href: "/category/girl" },
        { label: "Мальчику", href: "/category/boy" },
        { label: "Все детские", href: "/category/kids" },
      ],
    },
    {
      title: "Взрослым",
      items: [
        { label: "Женщине", href: "/category/woman" },
        { label: "Мужчине", href: "/category/man" },
        { label: "Все", href: "/category/birthday" },
      ],
    },
  ],
};

const anniversaryMenu = {
  title: "Юбилей",
  href: "/category/anniversary",
  groups: [
    {
      title: "По полу",
      items: [
        { label: "Женщине", href: "/category/womans" },
        { label: "Мужчине", href: "/category/mans" },
        { label: "Все", href: "/category/anniversary" },
      ],
    },
    {
      title: "По возрасту",
      items: [
        { label: "25 лет", href: "/category/anniversary-25" },
        { label: "30 лет", href: "/category/anniversary-30" },
        { label: "50 лет", href: "/category/anniversary-50" },
        { label: "60 лет", href: "/category/anniversary-60" },
        { label: "Смотреть все", href: "/category/anniversary" },
      ],
    },
  ],
};

const themesMenu = {
  title: "Все темы",
  href: "/category/invitations",
  items: [
    { label: "Гендер-пати", href: "/category/gender-party" },
    { label: "Концерт", href: "/category/concert" },
    { label: "В стиле 90-х", href: "/category/90s-style" },
    { label: "Девичник", href: "/category/bachelorette" },
    { label: "Русский стиль", href: "/category/russian" },
    { label: "Спектакль", href: "/category/performance" },
    { label: "Супергерои", href: "/category/superheroes" },
    { label: "Алиса в Стране чудес", href: "/category/alice-in-wonderland" },
    { label: "Смотреть все", href: "/category/invitations" },
  ],
};

function Dropdown({
  trigger,
  children,
  open,
  onHover,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open: boolean;
  onHover: (v: boolean) => void;
}) {
  return (
    <div
      className="relative"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {trigger}
      {open && (
        <div className="absolute top-full left-0 z-40 min-w-[260px] rounded-2xl border border-zinc-100 bg-white p-4 shadow-xl">
          {children}
        </div>
      )}
    </div>
  );
}

interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
}

export function Header() {
  const [openMobile, setOpenMobile] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const { count, total, ready } = useCart();
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-400 to-violet-500 text-white">
              <PartyPopper size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">
              Event Space
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            <Dropdown
              open={openDropdown === "birthday"}
              onHover={(v) => setOpenDropdown(v ? "birthday" : null)}
              trigger={
                <Link
                  href={birthdayMenu.href}
                  className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <Cake size={16} className="text-fuchsia-500" />
                  {birthdayMenu.title}
                  <ChevronDown size={14} />
                </Link>
              }
            >
              <div className="grid grid-cols-2 gap-4">
                {birthdayMenu.groups.map((g) => (
                  <div key={g.title}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      {g.title}
                    </p>
                    <ul className="space-y-1">
                      {g.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="block rounded-lg px-2 py-1.5 text-sm text-zinc-700 transition hover:bg-fuchsia-50 hover:text-fuchsia-700"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Dropdown>

            <Dropdown
              open={openDropdown === "anniversary"}
              onHover={(v) => setOpenDropdown(v ? "anniversary" : null)}
              trigger={
                <Link
                  href={anniversaryMenu.href}
                  className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <Sparkles size={16} className="text-violet-500" />
                  {anniversaryMenu.title}
                  <ChevronDown size={14} />
                </Link>
              }
            >
              <div className="grid grid-cols-2 gap-4">
                {anniversaryMenu.groups.map((g) => (
                  <div key={g.title}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      {g.title}
                    </p>
                    <ul className="space-y-1">
                      {g.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className="block rounded-lg px-2 py-1.5 text-sm text-zinc-700 transition hover:bg-violet-50 hover:text-violet-700"
                          >
                            {item.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Dropdown>

            <Dropdown
              open={openDropdown === "themes"}
              onHover={(v) => setOpenDropdown(v ? "themes" : null)}
              trigger={
                <Link
                  href={themesMenu.href}
                  className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <Sparkles size={16} className="text-amber-500" />
                  {themesMenu.title}
                  <ChevronDown size={14} />
                </Link>
              }
            >
              <ul className="space-y-1">
                {themesMenu.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="block rounded-lg px-2 py-1.5 text-sm text-zinc-700 transition hover:bg-amber-50 hover:text-amber-700"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Dropdown>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
              aria-label="Поиск"
            >
              <Search size={20} />
            </button>
            <Link
              href="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
              aria-label="Избранное"
            >
              <Heart size={20} />
            </Link>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/my-account"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                >
                  <User size={18} />
                  <span className="max-w-[120px] truncate">
                    {user.name || user.email}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-red-50 hover:text-red-500"
                  aria-label="Выйти"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                href="/my-account"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-zinc-50 hover:text-zinc-900"
                aria-label="Вход"
              >
                <User size={20} />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-lime-200 px-4 py-2 text-sm font-semibold text-lime-900 transition hover:bg-lime-300"
            >
              <ShoppingCart size={18} />
              <span>{ready ? formatPrice(total) : "0 ₽"}</span>
              {ready && count > 0 && (
                <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-lime-900">
                  {count}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 lg:hidden"
            onClick={() => setOpenMobile(!openMobile)}
            aria-label="Меню"
          >
            {openMobile ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {openMobile && (
          <div className="border-t border-zinc-100 bg-white px-4 py-4 lg:hidden">
            <div className="mb-4 flex items-center justify-between">
              {user ? (
                <Link
                  href="/my-account"
                  className="flex items-center gap-2 text-sm font-medium text-zinc-700"
                  onClick={() => setOpenMobile(false)}
                >
                  <User size={18} />
                  {user.name || user.email}
                </Link>
              ) : (
                <Link
                  href="/my-account"
                  className="flex items-center gap-2 text-sm font-medium text-zinc-700"
                  onClick={() => setOpenMobile(false)}
                >
                  <User size={18} />
                  Вход
                </Link>
              )}
              <button
                onClick={() => setCartOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-lime-200 px-3 py-1.5 text-sm font-semibold text-lime-900"
              >
                <ShoppingCart size={16} />
                {ready ? formatPrice(total) : "0 ₽"}
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                День рождения
              </p>
              {birthdayMenu.groups.flatMap((g) => g.items).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  onClick={() => setOpenMobile(false)}
                >
                  {item.label}
                </Link>
              ))}
              <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Юбилей
              </p>
              {anniversaryMenu.groups.flatMap((g) => g.items).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  onClick={() => setOpenMobile(false)}
                >
                  {item.label}
                </Link>
              ))}
              <p className="pt-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Темы
              </p>
              {themesMenu.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                  onClick={() => setOpenMobile(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

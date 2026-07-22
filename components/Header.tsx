"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  Heart,
  ShoppingCart,
  User,
  ChevronDown,
  Gift,
  Sparkles,
  Layers,
  LogOut,
} from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useFavorites } from "@/components/FavoritesProvider";
import { formatPrice } from "@/lib/cart";
import { CartSidebar } from "@/components/CartSidebar";
import { SearchBar } from "@/components/SearchBar";
import { LogoSticker } from "@/components/LogoSticker";

interface MenuItem {
  label: string;
  href: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const birthdayMenu: { title: string; href: string; groups: MenuGroup[] } = {
  title: "День рождения",
  href: "/category/birthday",
  groups: [
    {
      title: "Детям",
      items: [
        { label: "Новинки", href: "/category/kids?sort=new" },
        { label: "Девочке", href: "/category/girl" },
        { label: "Мальчику", href: "/category/boy" },
        { label: "Популярное", href: "/category/kids?sort=popular" },
        { label: "По возрасту", href: "/category/balloons" },
      ],
    },
    {
      title: "Женщине",
      items: [
        { label: "Новинки", href: "/category/woman?sort=new" },
        { label: "Популярное", href: "/category/woman?sort=popular" },
        { label: "По возрасту", href: "/category/woman" },
        { label: "Все дизайны", href: "/category/woman" },
      ],
    },
    {
      title: "Мужчине",
      items: [
        { label: "Новинки", href: "/category/man?sort=new" },
        { label: "Популярное", href: "/category/man?sort=popular" },
        { label: "По возрасту", href: "/category/man" },
        { label: "Все дизайны", href: "/category/man" },
      ],
    },
  ],
};

const anniversaryMenu: { title: string; href: string; groups: MenuGroup[] } = {
  title: "Юбилей",
  href: "/category/anniversary",
  groups: [
    {
      title: "Женщине",
      items: [
        { label: "Новинки", href: "/category/womans?sort=new" },
        { label: "Популярное", href: "/category/womans?sort=popular" },
        { label: "По возрасту", href: "/category/anniversary" },
        { label: "Все дизайны", href: "/category/womans" },
      ],
    },
    {
      title: "Мужчине",
      items: [
        { label: "Новинки", href: "/category/mans?sort=new" },
        { label: "Популярное", href: "/category/mans?sort=popular" },
        { label: "По возрасту", href: "/category/anniversary" },
        { label: "Все дизайны", href: "/category/mans" },
      ],
    },
  ],
};

const themesMenu: { title: string; href: string; items: MenuItem[] } = {
  title: "Все темы",
  href: "/category/invitations",
  items: [
    { label: "Гендер-пати", href: "/category/gender-party" },
    { label: "Концерт", href: "/category/concert" },
    { label: "В стиле 90-х", href: "/category/90s-style" },
    { label: "Девичник", href: "/category/bachelorette" },
    { label: "Русский стиль", href: "/category/russian" },
    { label: "Спектакль", href: "/category/performance" },
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
        <div className="absolute left-0 top-full z-40 w-max min-w-[220px] max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-100 bg-white p-6 pt-5 shadow-xl">
          {children}
        </div>
      )}
    </div>
  );
}

function GroupsDropdownContent({ groups }: { groups: MenuGroup[] }) {
  return (
    <div className="flex divide-x divide-zinc-100">
      {groups.map((group, i) => (
        <div
          key={group.title}
          className={`shrink-0 ${i === 0 ? "pr-6" : "px-6"}`}
        >
          <p className="mb-4 text-[13px] font-bold uppercase tracking-wider text-zinc-900">
            {group.title}
          </p>
          <ul className="space-y-3.5">
            {group.items.map((item) => (
              <li key={item.label + item.href}>
                <Link
                  href={item.href}
                  className="whitespace-nowrap text-[15px] leading-none text-zinc-600 transition hover:text-zinc-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const { count, total, ready } = useCart();
  const { count: favoritesCount } = useFavorites();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const triggerClass = (key: string) =>
    `flex items-center gap-1.5 border-b-2 px-1 pb-1.5 pt-1 text-[13px] font-semibold uppercase tracking-wider transition ${
      openDropdown === key
        ? "border-lime-400 text-zinc-900"
        : "border-transparent text-zinc-800 hover:border-lime-400 hover:text-zinc-900"
    }`;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-1.5">
            <LogoSticker />
            <Image
              src="/images/logo.svg"
              alt="EvSpace"
              width={101}
              height={30}
              priority
            />
          </Link>

          <nav className="hidden items-center gap-5 lg:flex">
            <Dropdown
              open={openDropdown === "birthday"}
              onHover={(v) => setOpenDropdown(v ? "birthday" : null)}
              trigger={
                <Link href={birthdayMenu.href} className={triggerClass("birthday")}>
                  <Gift size={15} strokeWidth={2.25} />
                  {birthdayMenu.title}
                  <ChevronDown size={13} />
                </Link>
              }
            >
              <GroupsDropdownContent groups={birthdayMenu.groups} />
            </Dropdown>

            <Dropdown
              open={openDropdown === "anniversary"}
              onHover={(v) => setOpenDropdown(v ? "anniversary" : null)}
              trigger={
                <Link
                  href={anniversaryMenu.href}
                  className={triggerClass("anniversary")}
                >
                  <Sparkles size={15} strokeWidth={2.25} />
                  {anniversaryMenu.title}
                  <ChevronDown size={13} />
                </Link>
              }
            >
              <GroupsDropdownContent groups={anniversaryMenu.groups} />
            </Dropdown>

            <Dropdown
              open={openDropdown === "themes"}
              onHover={(v) => setOpenDropdown(v ? "themes" : null)}
              trigger={
                <Link href={themesMenu.href} className={triggerClass("themes")}>
                  <Layers size={15} strokeWidth={2.25} />
                  {themesMenu.title}
                  <ChevronDown size={13} />
                </Link>
              }
            >
              <ul className="space-y-3.5">
                {themesMenu.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="whitespace-nowrap text-[15px] leading-none text-zinc-600 transition hover:text-zinc-900"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Dropdown>

            <Link
              href="/favorites"
              className="relative flex items-center px-1 pb-1.5 pt-1 text-zinc-800 transition hover:text-zinc-950"
              aria-label="Избранное"
            >
              <Heart size={19} fill="currentColor" />
              {favoritesCount > 0 && (
                <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-fuchsia-400 px-1 text-[10px] font-bold text-white">
                  {favoritesCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setSearchOpen((v) => !v)}
              className="flex items-center px-1 pb-1.5 pt-1 text-zinc-800 transition hover:text-zinc-950"
              aria-label="Поиск"
            >
              <Search size={19} />
            </button>
          </nav>

          <div className="ml-auto hidden items-center gap-5 lg:flex">
            <Link
              href="/my-account"
              className="flex items-center gap-1.5 border-b-2 border-lime-400 px-1 pb-1.5 pt-1 text-[13px] font-semibold uppercase tracking-wider text-zinc-800 transition hover:text-zinc-950"
            >
              Мой аккаунт
              <User size={16} />
            </Link>
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center text-zinc-400 transition hover:text-red-500"
                aria-label="Выйти"
                title="Выйти"
              >
                <LogOut size={17} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 rounded-lg bg-lime-300 px-4 py-2.5 text-sm font-bold text-zinc-900 transition hover:bg-lime-400"
            >
              <span>{ready ? formatPrice(total) : "0 ₽"}</span>
              <ShoppingCart size={18} />
              {ready && count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-fuchsia-400 text-[11px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl text-zinc-600 lg:hidden"
            onClick={() => setOpenMobile(!openMobile)}
            aria-label="Меню"
          >
            {openMobile ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {searchOpen && (
          <div className="border-t border-zinc-100 bg-white px-4 py-3 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-xl">
              <SearchBar autoFocus onNavigate={() => setSearchOpen(false)} />
            </div>
          </div>
        )}

        {openMobile && (
          <div className="border-t border-zinc-100 bg-white px-4 py-4 lg:hidden">
            <div className="mb-4">
              <SearchBar onNavigate={() => setOpenMobile(false)} />
            </div>
            <div className="mb-4 flex items-center justify-between">
              <Link
                href="/favorites"
                className="flex items-center gap-2 text-sm font-medium text-zinc-700"
                onClick={() => setOpenMobile(false)}
              >
                <Heart size={18} />
                Избранное{favoritesCount > 0 ? ` (${favoritesCount})` : ""}
              </Link>
            </div>
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
                className="flex items-center gap-2 rounded-lg bg-lime-300 px-3 py-1.5 text-sm font-bold text-zinc-900"
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
                  key={item.label + item.href}
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
                  key={item.label + item.href}
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

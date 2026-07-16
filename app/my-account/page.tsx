import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/user.db";
import { AuthForms } from "@/components/account/AuthForms";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Мой аккаунт — Event Space",
  description:
    "Вход и регистрация в личном кабинете Event Space. Управляйте заказами и сохранёнными дизайнами.",
};

interface MyAccountPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function MyAccountPage({ searchParams }: MyAccountPageProps) {
  const { redirect: redirectParam } = await searchParams;
  const session = await getSession();

  if (!session.userId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <AuthForms />
      </div>
    );
  }

  const user = await findUserById(session.userId);
  if (!user) {
    await session.destroy();
    redirect("/my-account");
  }

  if (redirectParam) {
    redirect(redirectParam);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-center text-2xl font-semibold text-zinc-900">
        Мой аккаунт
      </h1>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <AccountSidebar name={user.name} email={user.email} />
        </div>
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              Добро пожаловать, {user.name || user.email}!
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Здесь вы можете управлять заказами, сохранёнными дизайнами и
              настройками аккаунта.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                href="/my-account/orders"
                className="rounded-xl bg-fuchsia-50 p-4 transition hover:bg-fuchsia-100"
              >
                <p className="font-semibold text-fuchsia-900">Мои заказы</p>
                <p className="mt-1 text-xs text-fuchsia-700">
                  Просмотр статуса и оплата
                </p>
              </Link>
              <Link
                href="/"
                className="rounded-xl bg-lime-50 p-4 transition hover:bg-lime-100"
              >
                <p className="font-semibold text-lime-900">Каталог</p>
                <p className="mt-1 text-xs text-lime-700">Выбрать приглашение</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/user.db";
import { AccountSidebar } from "@/components/account/AccountSidebar";

export const metadata: Metadata = {
  title: "Сохранённые дизайны — Event Space",
  description: "Ваши сохранённые шаблоны приглашений.",
};

export default async function SavedDesignsPage() {
  const session = await getSession();
  if (!session.userId) redirect("/my-account?redirect=/my-account/saved");

  const user = await findUserById(session.userId);
  if (!user) {
    await session.destroy();
    redirect("/my-account");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-center text-2xl font-semibold text-zinc-900">
        Сохранённые дизайны
      </h1>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <AccountSidebar name={user.name} email={user.email} />
        </div>
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-zinc-100 bg-white p-8 text-center shadow-sm">
            <p className="text-zinc-500">Сохранённые дизайны появятся здесь.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

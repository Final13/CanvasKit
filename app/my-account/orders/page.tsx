import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/user.db";
import { getOrdersByUserId } from "@/lib/orders/order.db";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { OrdersTable } from "@/components/account/OrdersTable";

export const metadata: Metadata = {
  title: "Мои заказы — Event Space",
  description:
    "История заказов, статусы оплаты и доступ к купленным приглашениям.",
};

export default async function OrdersPage() {
  const session = await getSession();

  if (!session.userId) {
    redirect("/my-account?redirect=/my-account/orders");
  }

  const [user, orders] = await Promise.all([
    findUserById(session.userId),
    getOrdersByUserId(session.userId),
  ]);

  if (!user) {
    await session.destroy();
    redirect("/my-account");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-center text-2xl font-semibold text-zinc-900">
        Заказы
      </h1>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <AccountSidebar name={user.name} email={user.email} />
        </div>
        <div className="lg:col-span-8">
          <OrdersTable orders={orders} />
        </div>
      </div>
    </div>
  );
}

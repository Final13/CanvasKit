import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/user.db";
import { getOrderWithItems } from "@/lib/orders/order.db";
import { getLatestYookassaPaymentByOrderId } from "@/lib/payments/yookassa.db";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { OrderDetails } from "@/components/account/OrderDetails";

export const metadata: Metadata = {
  title: "Заказ — Event Space",
  description: "Детали заказа в личном кабинете Event Space.",
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_card: "Банковская карта",
  sbp: "СБП",
  sberbank: "SberPay",
  tinkoff_bank: "Т-Банк",
};

function extractPaymentMethodLabel(payloadJson: string | null): string {
  if (!payloadJson) return "—";
  try {
    const payload = JSON.parse(payloadJson);
    const type = payload?.payment_method?.type as string | undefined;
    return (type && PAYMENT_METHOD_LABELS[type]) || type || "—";
  } catch {
    return "—";
  }
}

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { id } = await params;
  const session = await getSession();
  if (!session.userId) redirect(`/my-account?redirect=/my-account/orders/${id}`);

  const [user, orderData, payment] = await Promise.all([
    findUserById(session.userId),
    getOrderWithItems(id),
    getLatestYookassaPaymentByOrderId(id),
  ]);

  if (!user) {
    await session.destroy();
    redirect("/my-account");
  }

  if (!orderData || orderData.order.user_id !== session.userId) {
    notFound();
  }

  const { order, items } = orderData;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-center text-2xl font-semibold text-zinc-900">
        Заказ № {order.id.slice(0, 8)}
      </h1>
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <AccountSidebar name={user.name} email={user.email} />
        </div>
        <div className="lg:col-span-8">
          <OrderDetails
            order={{
              id: order.id,
              status: order.status,
              total: order.total,
              createdAt: new Date(order.created_at).toISOString(),
              customerName: order.customer_name ?? user.name,
              customerEmail: order.customer_email ?? user.email,
              paymentMethodLabel: extractPaymentMethodLabel(
                payment?.payload_json ?? null
              ),
            }}
            items={items.map((item) => ({
              id: item.id,
              templateTitle: item.template_title,
              price: item.price,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

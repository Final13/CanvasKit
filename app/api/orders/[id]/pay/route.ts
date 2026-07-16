import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getOrderById, setOrderPaymentId } from "@/lib/orders/order.db";
import {
  createYookassaPayment,
  isYookassaConfigured,
} from "@/lib/payments/yookassa";
import { createYookassaPaymentRecord } from "@/lib/payments/yookassa.db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const session = await getSession();

    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.user_id !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status === "paid") {
      return NextResponse.json(
        { error: "Order already paid" },
        { status: 400 }
      );
    }

    if (order.status === "cancelled") {
      return NextResponse.json(
        { error: "Order is cancelled" },
        { status: 400 }
      );
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      req.nextUrl.origin;
    const returnUrl = `${origin}/checkout/success?orderId=${order.id}`;

    if (!isYookassaConfigured()) {
      return NextResponse.json(
        { error: "Payment provider is not configured" },
        { status: 503 }
      );
    }

    const payment = await createYookassaPayment({
      amount: Number(order.total),
      description: `Оплата заказа №${order.id.slice(0, 8)}`,
      orderId: order.id,
      returnUrl,
      customerEmail: order.customer_email ?? undefined,
      paymentMethodType: "bank_card",
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Failed to create payment" },
        { status: 500 }
      );
    }

    await createYookassaPaymentRecord({
      orderId: order.id,
      yookassaPaymentId: payment.id,
      amount: Number(order.total),
      status: payment.status,
      payloadJson: JSON.stringify(payment),
    });

    await setOrderPaymentId(order.id, payment.id);

    const confirmation = payment.confirmation as
      | { type: string; confirmation_url?: string }
      | undefined;

    return NextResponse.json({
      success: true,
      paymentUrl: confirmation?.confirmation_url ?? null,
    });
  } catch (error) {
    console.error("Pay order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

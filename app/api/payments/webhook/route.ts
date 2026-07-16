import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/orders/order.db";
import {
  getYookassaPaymentByYookassaId,
  updateYookassaPaymentStatus,
} from "@/lib/payments/yookassa.db";
import { fetchYookassaPayment } from "@/lib/payments/yookassa";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const event = payload.event as string | undefined;
    const object = payload.object as Record<string, unknown> | undefined;

    if (!event || !object || typeof object.id !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const yookassaPaymentId = object.id;

    if (
      event === "payment.succeeded" ||
      event === "payment.waiting_for_capture" ||
      event === "payment.canceled"
    ) {
      let status = event === "payment.canceled" ? "canceled" : "succeeded";
      let orderId: string | null = null;

      const record = await getYookassaPaymentByYookassaId(yookassaPaymentId);
      if (record) {
        orderId = record.order_id;
      }

      const metadata = object.metadata as Record<string, unknown> | undefined;
      if (!orderId && metadata && typeof metadata.orderId === "string") {
        orderId = metadata.orderId;
      }

      const freshPayment = await fetchYookassaPayment(yookassaPaymentId);
      if (freshPayment) {
        status = freshPayment.status;
      }

      if (record) {
        await updateYookassaPaymentStatus(
          yookassaPaymentId,
          status,
          JSON.stringify(object)
        );
      }

      if (orderId) {
        if (status === "succeeded" || status === "waiting_for_capture") {
          await updateOrderStatus(orderId, "paid");
        } else if (status === "canceled") {
          await updateOrderStatus(orderId, "cancelled");
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

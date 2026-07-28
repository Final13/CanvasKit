import { NextRequest, NextResponse, after } from "next/server";
import { updateOrderStatus, getOrderWithItems } from "@/lib/orders/order.db";
import {
  getYookassaPaymentByYookassaId,
  updateYookassaPaymentStatus,
} from "@/lib/payments/yookassa.db";
import { fetchYookassaPayment } from "@/lib/payments/yookassa";
import { sendPurchaseDeliveredEmail } from "@/lib/email";

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

      // Верификация статуса по API; при недоступности/ошибке API
      // не роняем вебхук — берём статус из события (ЮKassa подписывает его).
      try {
        const freshPayment = await fetchYookassaPayment(yookassaPaymentId);
        if (freshPayment) {
          status = freshPayment.status;
        }
      } catch (fetchError) {
        console.error("YooKassa getPayment failed, using event status:", fetchError);
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

          // Письмо с PNG купленных дизайнов — после ответа вебхуку,
          // чтобы медленный SMTP не задерживал подтверждение ЮKassa.
          const paidOrderId = orderId;
          const origin =
            process.env.NEXT_PUBLIC_APP_URL ||
            req.headers.get("origin") ||
            req.nextUrl.origin;
          after(async () => {
            try {
              const full = await getOrderWithItems(paidOrderId);
              if (!full?.order.customer_email) return;
              const attachments = full.items
                .filter((item) => item.png_data?.startsWith("data:image/"))
                .map((item, index) => ({
                  filename: `${item.template_slug}${full.items.length > 1 ? `-${index + 1}` : ""}.png`,
                  contentBase64: item.png_data!.split(",")[1] ?? "",
                }))
                .filter((a) => a.contentBase64.length > 0);
              await sendPurchaseDeliveredEmail({
                to: full.order.customer_email,
                name: full.order.customer_name,
                orderId: paidOrderId,
                siteUrl: origin,
                attachments,
              });
              console.info(
                `Purchase email sent for order ${paidOrderId} (${attachments.length} attachments)`
              );
            } catch (emailError) {
              console.error("Failed to send purchase email:", emailError);
            }
          });
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

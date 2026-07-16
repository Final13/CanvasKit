import { NextRequest, NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";
import { createUser, findUserByEmail } from "@/lib/auth/user.db";
import { createOrder } from "@/lib/orders/order.db";
import {
  createYookassaPayment,
  isYookassaConfigured,
} from "@/lib/payments/yookassa";
import { createYookassaPaymentRecord } from "@/lib/payments/yookassa.db";
import { sendWelcomeEmail, sendOrderConfirmationEmail } from "@/lib/email";
import { DEFAULT_PRICE } from "@/lib/cart";
import crypto from "crypto";

interface OrderItemDto {
  templateSlug: string;
  templateTitle: string;
  previewUrl?: string;
  price?: number;
  customizationJson?: string;
}

function generatePassword(): string {
  return crypto.randomBytes(12).toString("hex");
}

function formatAmount(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      customerName,
      customerEmail,
      paymentMethodType = "bank_card",
    }: {
      items: OrderItemDto[];
      customerName?: string;
      customerEmail?: string;
      paymentMethodType?:
        | "bank_card"
        | "sbp"
        | "sberbank"
        | "tinkoff_bank";
    } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    const normalizedItems = items.map((item) => ({
      template_slug: item.templateSlug,
      template_title: item.templateTitle || "Приглашение",
      preview_url: item.previewUrl ?? null,
      price: formatAmount(item.price ?? DEFAULT_PRICE),
      customization_json: item.customizationJson ?? null,
    }));

    const total = formatAmount(
      normalizedItems.reduce((sum, item) => sum + item.price, 0)
    );

    const session = await getSession();
    let userId = session.userId;
    let isNewUser = false;
    let generatedPassword: string | undefined;

    if (!userId && customerEmail) {
      const existing = await findUserByEmail(customerEmail);
      if (existing) {
        return NextResponse.json(
          {
            error: "Email already registered",
            code: "EMAIL_REGISTERED",
            message:
              "Этот email уже зарегистрирован. Войдите в аккаунт перед оформлением заказа.",
          },
          { status: 409 }
        );
      }

      generatedPassword = generatePassword();
      const hashed = await hashPassword(generatedPassword);
      userId = await createUser({
        email: customerEmail,
        password: hashed,
        name: customerName,
      });
      isNewUser = true;
      await setSession({ id: userId, email: customerEmail, name: customerName });
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const orderId = crypto.randomUUID();

    await createOrder({
      id: orderId,
      userId,
      total,
      customerName,
      customerEmail,
      items: normalizedItems,
    });

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      req.nextUrl.origin;
    const returnUrl = `${origin}/checkout/success?orderId=${orderId}`;

    let paymentUrl: string | null = null;

    if (isYookassaConfigured()) {
      const payment = await createYookassaPayment({
        amount: total,
        description: `Заказ №${orderId.slice(0, 8)}`,
        orderId,
        returnUrl,
        customerEmail,
        paymentMethodType,
      });

      if (payment) {
        const confirmation = payment.confirmation as
          | { type: string; confirmation_url?: string }
          | undefined;
        paymentUrl = confirmation?.confirmation_url ?? null;

        await createYookassaPaymentRecord({
          orderId,
          yookassaPaymentId: payment.id,
          amount: total,
          status: payment.status,
          payloadJson: JSON.stringify(payment),
        });
      }
    }

    if (isNewUser && customerEmail && generatedPassword) {
      try {
        await sendWelcomeEmail({
          to: customerEmail,
          name: customerName,
          login: customerEmail,
          password: generatedPassword,
          siteUrl: origin,
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
    }

    if (customerEmail) {
      try {
        await sendOrderConfirmationEmail({
          to: customerEmail,
          name: customerName,
          orderId,
          total,
          siteUrl: origin,
        });
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      paymentUrl,
      returnUrl: paymentUrl ?? returnUrl,
    });
  } catch (error) {
    console.error("Create order error:", error);
    console.error(
      "Create order error details:",
      typeof error,
      JSON.stringify(error),
      error instanceof Error ? error.stack : "no stack"
    );
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

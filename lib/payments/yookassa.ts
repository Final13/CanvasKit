import { YooCheckout, type ICreatePayment } from "@a2seven/yoo-checkout";

/**
 * Тестовый режим (тестовые карты ЮKassa) используется на Vercel и в dev,
 * боевые ключи — только на продакшен-сервере (PM2, NODE_ENV=production).
 */
export function isYookassaTestMode(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV !== "production";
}

function getConfig() {
  const testMode = isYookassaTestMode();
  const shopId = testMode
    ? process.env.YOOKASSA_TEST_SHOP_ID
    : process.env.YOOKASSA_SHOP_ID;
  const secretKey = testMode
    ? process.env.YOOKASSA_TEST_SECRET_KEY
    : process.env.YOOKASSA_SECRET_KEY;
  return { shopId, secretKey, testMode };
}

export function isYookassaConfigured(): boolean {
  const { shopId, secretKey } = getConfig();
  return Boolean(shopId && secretKey);
}

function getCheckout(): YooCheckout | null {
  const { shopId, secretKey, testMode } = getConfig();
  if (!shopId || !secretKey) {
    console.warn(
      testMode
        ? "YooKassa test mode: set YOOKASSA_TEST_SHOP_ID / YOOKASSA_TEST_SECRET_KEY"
        : "YooKassa is not configured"
    );
    return null;
  }
  return new YooCheckout({ shopId, secretKey });
}

function formatAmount(value: number): string {
  return value.toFixed(2);
}

export interface CreatePaymentInput {
  amount: number;
  description: string;
  orderId: string;
  returnUrl: string;
  customerEmail?: string;
  paymentMethodType:
    | "bank_card"
    | "sbp"
    | "sberbank"
    | "tinkoff_bank";
}

export async function createYookassaPayment(input: CreatePaymentInput) {
  const checkout = getCheckout();
  if (!checkout) return null;

  const idempotenceKey = crypto.randomUUID();

  const payload: ICreatePayment = {
    amount: {
      value: formatAmount(input.amount),
      currency: "RUB",
    },
    description: input.description,
    payment_method_data: {
      type: input.paymentMethodType,
    },
    confirmation: {
      type: "redirect",
      return_url: input.returnUrl,
    },
    capture: true,
    metadata: {
      orderId: input.orderId,
    },
  };

  if (input.customerEmail) {
    payload.receipt = {
      customer: { email: input.customerEmail },
      items: [
        {
          description: input.description,
          quantity: "1",
          amount: {
            value: formatAmount(input.amount),
            currency: "RUB",
          },
          vat_code: 1,
          payment_subject: "service",
          payment_mode: "full_payment",
        },
      ],
    };
  }

  try {
    return await checkout.createPayment(payload, idempotenceKey);
  } catch (error) {
    const axiosError = error as {
      response?: { data?: { description?: string; message?: string } };
      message?: string;
    };
    console.error(
      "YooKassa createPayment error:",
      axiosError.response?.data ?? axiosError.message ?? error
    );
    throw new Error(
      axiosError.response?.data?.description ||
        axiosError.message ||
        "Ошибка при создании платежа в ЮKassa"
    );
  }
}

export async function fetchYookassaPayment(paymentId: string) {
  const checkout = getCheckout();
  if (!checkout) return null;
  return checkout.getPayment(paymentId);
}

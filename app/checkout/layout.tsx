import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Оформление заказа — Event Space",
  description:
    "Укажите контактные данные, выберите способ оплаты и завершите покупку персонализированного приглашения.",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

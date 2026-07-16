import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Корзина — Event Space",
  description:
    "Просмотрите выбранные приглашения, измените состав заказа и перейдите к оформлению.",
};

export default function CartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

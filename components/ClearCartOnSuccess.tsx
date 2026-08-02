"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";
import { reachGoal } from "@/lib/metrika";

/** Очищает корзину при монтировании — вызывается на странице успешной оплаты. */
export function ClearCartOnSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    reachGoal("success_pay");
  }, [clearCart]);

  return null;
}

"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";

/** Очищает корзину при монтировании — вызывается на странице успешной оплаты. */
export function ClearCartOnSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return null;
}

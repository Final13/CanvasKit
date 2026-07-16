"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useSyncExternalStore,
} from "react";
import {
  type CartItem,
  subscribeCart,
  getCartSnapshot,
  addCartItem,
  removeCartItem,
  clearCartItems,
} from "@/lib/cart";

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const EMPTY_CART: CartItem[] = [];

function getServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getServerSnapshot
  );

  const addItem = useCallback((item: Omit<CartItem, "id">) => {
    addCartItem(item);
  }, []);

  const removeItem = useCallback((id: string) => {
    removeCartItem(id);
  }, []);

  const clearCart = useCallback(() => {
    clearCartItems();
  }, []);

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      total: items.reduce((sum, i) => sum + i.price, 0),
      ready: true,
      addItem,
      removeItem,
      clearCart,
    }),
    [items, addItem, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

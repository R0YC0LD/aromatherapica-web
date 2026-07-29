"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  type Cart,
  type CartItem,
  addToCart as addItem,
  cartCount,
  cartTotal,
  emptyCart,
  parseCart,
  removeFromCart,
  serializeCart,
  updateCartQuantity,
  CART_COOKIE_NAME,
} from "@/lib/cart/types";

interface CartContextValue {
  cart: Cart;
  count: number;
  total: number;
  add: (item: CartItem) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function persist(cart: Cart) {
  try {
    localStorage.setItem(CART_COOKIE_NAME, serializeCart(cart));
    document.cookie = `${CART_COOKIE_NAME}=${encodeURIComponent(serializeCart(cart))};path=/;max-age=${60 * 60 * 24 * 30};samesite=lax`;
  } catch {
    /* ignore */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_COOKIE_NAME);
      setCart(parseCart(raw));
    } catch {
      setCart(emptyCart());
    }
    setReady(true);
  }, []);

  const update = useCallback((next: Cart) => {
    setCart(next);
    persist(next);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count: cartCount(cart),
      total: cartTotal(cart),
      add: (item) => update(addItem(cart, item)),
      setQuantity: (variantId, quantity) => update(updateCartQuantity(cart, variantId, quantity)),
      remove: (variantId) => update(removeFromCart(cart, variantId)),
      clear: () => update(emptyCart()),
    }),
    [cart, update],
  );

  if (!ready) {
    return <CartContext.Provider value={{ ...value, cart: emptyCart(), count: 0, total: 0 }}>{children}</CartContext.Provider>;
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

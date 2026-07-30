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
  drawerOpen: boolean;
  lastAdded: CartItem | null;
  add: (item: CartItem, options?: { openDrawer?: boolean }) => void;
  setQuantity: (variantId: number, quantity: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);

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

  const openCartDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeCartDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count: cartCount(cart),
      total: cartTotal(cart),
      drawerOpen,
      lastAdded,
      add: (item, options) => {
        const wasEmpty = cart.items.length === 0;
        update(addItem(cart, item));
        setLastAdded(item);
        // Auto-open only for the first item in an empty cart (or explicit true).
        if (options?.openDrawer === true || (options?.openDrawer !== false && wasEmpty)) {
          setDrawerOpen(true);
        }
      },
      setQuantity: (variantId, quantity) => update(updateCartQuantity(cart, variantId, quantity)),
      remove: (variantId) => update(removeFromCart(cart, variantId)),
      clear: () => {
        update(emptyCart());
        setLastAdded(null);
      },
      openCartDrawer,
      closeCartDrawer,
    }),
    [cart, update, drawerOpen, lastAdded, openCartDrawer, closeCartDrawer],
  );

  if (!ready) {
    return (
      <CartContext.Provider
        value={{
          ...value,
          cart: emptyCart(),
          count: 0,
          total: 0,
          drawerOpen: false,
          lastAdded: null,
        }}
      >
        {children}
      </CartContext.Provider>
    );
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

"use client";

import { useCart } from "@/components/CartProvider";

export function CartBadge() {
  const { count } = useCart();
  return <span className="count-badge">{count}</span>;
}

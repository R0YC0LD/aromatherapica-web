"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/components/CartProvider";

export function CartBadge() {
  const { count, lastAdded } = useCart();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (!lastAdded) return;
    setPulse(true);
    const t = window.setTimeout(() => setPulse(false), 650);
    return () => window.clearTimeout(t);
  }, [lastAdded]);

  if (count <= 0) return null;
  return <span className={`count-badge${pulse ? " is-pulse" : ""}`}>{count}</span>;
}

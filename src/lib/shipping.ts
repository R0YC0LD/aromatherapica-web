/** Always free — Ticimax kargo çeki ile karşılanır; müşteriden kargo ücreti alınmaz. */
export const FREE_SHIPPING_THRESHOLD = 0;
export const DEFAULT_SHIPPING_COST = 0;

export function shippingCost(_subtotal: number): number {
  return 0;
}

export function orderTotal(subtotal: number): number {
  return Math.max(0, subtotal);
}

export function getShippingProgress(subtotal: number): {
  threshold: number;
  remaining: number;
  progress: number;
  qualified: boolean;
} {
  return {
    threshold: 0,
    remaining: 0,
    progress: 1,
    qualified: subtotal > 0,
  };
}

export function shippingProgressMessage(_subtotal: number): string {
  return "Kargo ücretsizdir — Ticimax kargo çeki ile karşılanır.";
}

export function freeShippingAnnouncement(): string {
  return "Tüm siparişlerde ücretsiz kargo";
}

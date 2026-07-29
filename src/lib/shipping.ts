export const FREE_SHIPPING_THRESHOLD = 100_000;
export const DEFAULT_SHIPPING_COST = 99;

export function shippingCost(subtotal: number): number {
  if (!Number.isFinite(subtotal) || subtotal <= 0) return DEFAULT_SHIPPING_COST;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_COST;
}

export function orderTotal(subtotal: number): number {
  return Math.max(0, subtotal) + shippingCost(subtotal);
}

export function getShippingProgress(subtotal: number): {
  threshold: number;
  remaining: number;
  progress: number;
  qualified: boolean;
} {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - Math.max(0, subtotal));
  const progress = Math.min(1, Math.max(0, subtotal) / FREE_SHIPPING_THRESHOLD);
  return {
    threshold: FREE_SHIPPING_THRESHOLD,
    remaining,
    progress,
    qualified: remaining === 0 && subtotal > 0,
  };
}

export function shippingProgressMessage(subtotal: number): string {
  const { remaining, qualified } = getShippingProgress(subtotal);
  if (qualified) return "Tebrikler — 100.000 TL ücretsiz kargo hakkınız aktif.";
  return `Ücretsiz kargo için ${remaining.toLocaleString("tr-TR")} TL daha ekleyin.`;
}

export function freeShippingAnnouncement(): string {
  return "100.000 TL üzeri ücretsiz kargo";
}

export type ShippingConfig = {
  /** 0 = her zaman ücretsiz; >0 = bu tutar ve üzeri ücretsiz */
  threshold: number;
  /** Eşik altındayken alınan kargo ücreti (TL) */
  fee: number;
};

export const DEFAULT_SHIPPING_CONFIG: ShippingConfig = {
  threshold: 0,
  fee: 99,
};

/** @deprecated use DEFAULT_SHIPPING_CONFIG.threshold */
export const FREE_SHIPPING_THRESHOLD = DEFAULT_SHIPPING_CONFIG.threshold;
/** @deprecated use DEFAULT_SHIPPING_CONFIG.fee */
export const DEFAULT_SHIPPING_COST = DEFAULT_SHIPPING_CONFIG.fee;

function normalizeConfig(config?: Partial<ShippingConfig>): ShippingConfig {
  const threshold = Number(config?.threshold);
  const fee = Number(config?.fee);
  return {
    threshold: Number.isFinite(threshold) && threshold > 0 ? threshold : 0,
    fee: Number.isFinite(fee) && fee > 0 ? fee : 0,
  };
}

export function shippingCost(subtotal: number, config?: Partial<ShippingConfig>): number {
  const { threshold, fee } = normalizeConfig(config);
  if (threshold <= 0) return 0;
  if (!Number.isFinite(subtotal) || subtotal <= 0) return fee;
  return subtotal >= threshold ? 0 : fee;
}

export function orderTotal(subtotal: number, config?: Partial<ShippingConfig>): number {
  return Math.max(0, subtotal) + shippingCost(subtotal, config);
}

export function getShippingProgress(
  subtotal: number,
  config?: Partial<ShippingConfig>,
): {
  threshold: number;
  remaining: number;
  progress: number;
  qualified: boolean;
  alwaysFree: boolean;
} {
  const { threshold } = normalizeConfig(config);
  if (threshold <= 0) {
    return {
      threshold: 0,
      remaining: 0,
      progress: 1,
      qualified: true,
      alwaysFree: true,
    };
  }
  const safe = Math.max(0, subtotal);
  const remaining = Math.max(0, threshold - safe);
  return {
    threshold,
    remaining,
    progress: Math.min(1, safe / threshold),
    qualified: remaining === 0 && safe > 0,
    alwaysFree: false,
  };
}

export function shippingProgressMessage(subtotal: number, config?: Partial<ShippingConfig>): string {
  const { threshold, fee } = normalizeConfig(config);
  if (threshold <= 0) {
    return "Kargo ücretsizdir.";
  }
  const { remaining, qualified } = getShippingProgress(subtotal, { threshold, fee });
  if (qualified) {
    return `Tebrikler — ${threshold.toLocaleString("tr-TR")} TL ücretsiz kargo hakkınız aktif.`;
  }
  return `Ücretsiz kargo için ${remaining.toLocaleString("tr-TR")} TL daha ekleyin.`;
}

export function freeShippingAnnouncement(config?: Partial<ShippingConfig>): string {
  const { threshold } = normalizeConfig(config);
  if (threshold <= 0) return "Tüm siparişlerde ücretsiz kargo";
  return `${threshold.toLocaleString("tr-TR")} TL üzeri ücretsiz kargo`;
}

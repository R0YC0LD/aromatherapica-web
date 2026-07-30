/** Ticimax storefront commerce helpers (static Pages hybrid). */

export const DEFAULT_TICIMAX_STORE = "https://aromatherapica.com";

export function resolveTicimaxStoreUrl(configured?: string | null): string {
  const raw = String(configured || DEFAULT_TICIMAX_STORE).trim();
  return raw.replace(/\/$/, "") || DEFAULT_TICIMAX_STORE;
}

/** Prefer live Ticimax product URL when known; else slug-id pattern used by store. */
export function ticimaxProductUrl(
  product: { slug: string; id?: number; ticimaxUrl?: string | null; ticimaxSlug?: string | null },
  storeUrl?: string | null,
): string {
  if (product.ticimaxUrl && /^https?:\/\//i.test(product.ticimaxUrl)) {
    return product.ticimaxUrl;
  }
  const base = resolveTicimaxStoreUrl(storeUrl);
  const slug = product.ticimaxSlug || product.slug;
  if (product.id) return `${base}/${slug}-${product.id}`;
  return `${base}/${slug}`;
}

export function ticimaxCartUrl(storeUrl?: string | null): string {
  return `${resolveTicimaxStoreUrl(storeUrl)}/Sepetim`;
}

export function ticimaxCheckoutUrl(storeUrl?: string | null): string {
  return `${resolveTicimaxStoreUrl(storeUrl)}/checkout`;
}

export function ticimaxSearchUrl(query: string, storeUrl?: string | null): string {
  const q = encodeURIComponent(query.trim());
  return `${resolveTicimaxStoreUrl(storeUrl)}/Ara?text=${q}`;
}

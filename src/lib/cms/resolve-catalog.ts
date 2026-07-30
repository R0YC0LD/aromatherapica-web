import type { CustomProduct, CmsState, ProductOverride } from "@/lib/cms/types";
import { applyProductOverride } from "@/lib/cms/merge";
import { slugify } from "@/lib/format";
import type { NormalizedProduct } from "@/lib/ticimax/types";

export type CatalogRow = {
  id: number;
  variantId?: number | null;
  slug: string;
  name: string;
  categoryId: number | null;
  categoryName: string | null;
  brandName?: string | null;
  price: number;
  salePrice: number | null;
  stock: number;
  active: boolean;
  imageUrl: string | null;
  description?: string | null;
  shortDesc?: string | null;
  sku?: string | null;
  /** Live Ticimax product URL e.g. https://aromatherapica.com/slug-123 */
  ticimaxUrl?: string | null;
};

export function customToNormalized(p: CustomProduct): NormalizedProduct {
  const image = p.imageUrl || undefined;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || undefined,
    categoryId: p.categoryId ?? undefined,
    categoryName: p.categoryName,
    brandName: p.brandName || "Aromatherapica",
    active: p.active,
    price: p.price,
    salePrice: p.salePrice ?? undefined,
    stock: p.stock,
    images: image ? [image] : [],
    seoDescription: p.shortDesc || undefined,
    variants: [
      {
        id: p.id,
        productId: p.id,
        sku: p.sku || undefined,
        price: p.price,
        salePrice: p.salePrice ?? undefined,
        stock: p.stock,
        active: p.active,
        options: [],
        imageUrl: image,
      },
    ],
  };
}

export function catalogRowToNormalized(p: CatalogRow): NormalizedProduct {
  const image = p.imageUrl || undefined;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || undefined,
    categoryId: p.categoryId ?? undefined,
    categoryName: p.categoryName || undefined,
    brandName: p.brandName || undefined,
    active: p.active,
    price: p.price,
    salePrice: p.salePrice ?? undefined,
    stock: p.stock,
    images: image ? [image] : [],
    seoDescription: p.shortDesc || undefined,
    ticimaxUrl: p.ticimaxUrl || undefined,
    variants: [
      {
        id: p.variantId || p.id,
        productId: p.id,
        sku: p.sku || undefined,
        price: p.price,
        salePrice: p.salePrice ?? undefined,
        stock: p.stock,
        active: p.active,
        options: [],
        imageUrl: image,
      },
    ],
  };
}

/** Merge base catalog + CMS overrides/custom/deleted into storefront products. */
export function resolveStorefrontCatalog(
  base: CatalogRow[],
  state: Pick<CmsState, "products" | "customProducts" | "deletedProductIds">,
): NormalizedProduct[] {
  const deleted = new Set((state.deletedProductIds || []).map(Number));
  const overrides = state.products || {};
  const customs = Object.values(state.customProducts || {});

  const fromBase = base
    .filter((p) => !deleted.has(p.id))
    .map((row) => applyProductOverride(catalogRowToNormalized(row), overrides[String(row.id)]));

  const fromCustom = customs
    .filter((p) => !deleted.has(p.id))
    .map((p) => {
      const override = overrides[String(p.id)];
      return applyProductOverride(customToNormalized(p), override);
    });

  // Prefer custom over base if id collision
  const map = new Map<number, NormalizedProduct>();
  for (const p of fromBase) map.set(p.id, p);
  for (const p of fromCustom) map.set(p.id, p);
  return Array.from(map.values());
}

export function makeCustomProductId(): number {
  return 900000 + (Date.now() % 100000);
}

export function makeUniqueSlug(name: string, existing: Set<string>): string {
  const base = slugify(name) || `urun-${Date.now()}`;
  let slug = base;
  let i = 2;
  while (existing.has(slug)) {
    slug = `${base}-${i}`;
    i += 1;
  }
  return slug;
}

export function emptyCustomProduct(partial?: Partial<CustomProduct>): CustomProduct {
  const now = new Date().toISOString();
  return {
    id: makeCustomProductId(),
    slug: `yeni-urun-${Date.now()}`,
    name: "Yeni ürün",
    categoryId: null,
    categoryName: "Genel",
    brandName: "Aromatherapica",
    price: 0,
    salePrice: null,
    stock: 0,
    active: true,
    imageUrl: null,
    description: "",
    shortDesc: "",
    sku: "",
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export type { ProductOverride };

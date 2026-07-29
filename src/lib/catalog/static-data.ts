import fs from "node:fs";
import path from "node:path";
import type { NormalizedCategory, NormalizedProduct } from "@/lib/ticimax/types";
import { buildCategoryTree } from "@/lib/ticimax/mappers";
import { slugify } from "@/lib/format";
import { getMarketingCategorySlugs, productMatchesCategorySlug } from "@/lib/cms/category-map";

export type StaticProduct = {
  id: number;
  variantId: number | null;
  slug: string;
  name: string;
  categoryId: number | null;
  categoryName: string | null;
  brandName: string | null;
  price: number;
  salePrice: number | null;
  stock: number;
  active: boolean;
  imageUrl: string | null;
  description: string | null;
  shortDesc: string | null;
  sku: string | null;
  barcode: string | null;
  vatRate: number | null;
};

export type StaticCategory = {
  id: number;
  parentId: number;
  slug: string;
  name: string;
  sortOrder: number;
  active: boolean;
};

type CatalogFile = {
  products: StaticProduct[];
  categories: StaticCategory[];
};

let cached: CatalogFile | null = null;

export function isStaticExport(): boolean {
  return (
    process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" ||
    process.env.STATIC_EXPORT === "true" ||
    process.env.GITHUB_PAGES === "true"
  );
}

function loadCatalogFile(): CatalogFile {
  if (cached) return cached;

  const candidates = [
    path.join(/*turbopackIgnore: true*/ process.cwd(), "public", "data", "catalog.json"),
    path.join(/*turbopackIgnore: true*/ process.cwd(), "data", "seed-catalog.json"),
  ];

  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const raw = JSON.parse(fs.readFileSync(file, "utf8")) as CatalogFile & {
      products?: Array<Record<string, unknown>>;
      categories?: Array<Record<string, unknown>>;
    };

    // Support both public catalog shape and prisma seed shape
    if (raw.products?.[0] && "ticimaxId" in (raw.products[0] as object)) {
      cached = {
        products: (raw.products as Array<Record<string, unknown>>).map((p) => ({
          id: Number(p.ticimaxId),
          variantId: p.variantId == null ? null : Number(p.variantId),
          slug: String(p.slug),
          name: String(p.name),
          categoryId: p.categoryId == null ? null : Number(p.categoryId),
          categoryName: (p.categoryName as string) || null,
          brandName: (p.brandName as string) || null,
          price: Number(p.price || 0),
          salePrice: p.salePrice == null ? null : Number(p.salePrice),
          stock: Number(p.stock || 0),
          active: Boolean(p.active),
          imageUrl: (p.customImageUrl as string) || (p.imageUrl as string) || null,
          description: (p.customDescription as string) || (p.description as string) || null,
          shortDesc: (p.shortDesc as string) || null,
          sku: (p.sku as string) || null,
          barcode: (p.barcode as string) || null,
          vatRate: p.vatRate == null ? null : Number(p.vatRate),
        })),
        categories: (raw.categories as Array<Record<string, unknown>>).map((c) => ({
          id: Number(c.ticimaxId),
          parentId: Number(c.parentId || 0),
          slug: String(c.slug),
          name: String(c.name),
          sortOrder: Number(c.sortOrder || 0),
          active: Boolean(c.active),
        })),
      };
    } else {
      cached = raw as CatalogFile;
    }
    return cached;
  }

  cached = { products: [], categories: [] };
  return cached;
}

export function toNormalizedProduct(p: StaticProduct): NormalizedProduct {
  const variantId = p.variantId || p.id;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || p.shortDesc || undefined,
    categoryId: p.categoryId ?? undefined,
    categoryName: p.categoryName ?? undefined,
    brandName: p.brandName ?? undefined,
    active: p.active,
    price: p.price,
    salePrice: p.salePrice ?? undefined,
    stock: p.stock,
    vatRate: p.vatRate ?? undefined,
    images: p.imageUrl ? [p.imageUrl] : [],
    variants: [
      {
        id: variantId,
        productId: p.id,
        sku: p.sku || undefined,
        barcode: p.barcode || undefined,
        price: p.price,
        salePrice: p.salePrice ?? undefined,
        stock: p.stock,
        vatRate: p.vatRate ?? undefined,
        active: p.active,
        options: [],
        imageUrl: p.imageUrl || undefined,
      },
    ],
    seoTitle: p.name,
    seoDescription: (p.shortDesc || p.description || "").slice(0, 160) || undefined,
  };
}

export function getStaticCategories(): NormalizedCategory[] {
  const { categories } = loadCatalogFile();
  return buildCategoryTree(
    categories
      .filter((c) => c.active)
      .map((c) => ({
        id: c.id,
        parentId: c.parentId,
        name: c.name,
        slug: c.slug || slugify(c.name),
        active: c.active,
        sortOrder: c.sortOrder,
      })),
  );
}

export function getStaticProducts(options?: {
  categoryId?: number;
  categorySlug?: string;
  sort?: "price_asc" | "price_desc" | "name" | "newest";
  q?: string;
  page?: number;
  pageSize?: number;
}): NormalizedProduct[] {
  const { products, categories } = loadCatalogFile();
  let list = products.filter((p) => p.active);

  if (options?.categoryId) {
    const root = categories.find((c) => c.id === options.categoryId);
    const childIds = new Set(
      categories.filter((c) => c.parentId === options.categoryId).map((c) => c.id),
    );
    if (root) childIds.add(root.id);
    list = list.filter((p) => {
      if (p.categoryId != null && childIds.has(p.categoryId)) return true;
      return productMatchesCategorySlug(p, root?.slug || "", categories);
    });
  } else if (options?.categorySlug && options.categorySlug !== "tum-urunler") {
    list = list.filter((p) => productMatchesCategorySlug(p, options.categorySlug!, categories));
  }

  if (options?.q) {
    const q = options.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.shortDesc || "").toLowerCase().includes(q) ||
        (p.categoryName || "").toLowerCase().includes(q),
    );
  }

  if (options?.sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
  else if (options?.sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
  else if (options?.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name, "tr"));
  else list = [...list].sort((a, b) => b.id - a.id);

  const page = options?.page ?? 0;
  const pageSize = options?.pageSize ?? 48;
  return list.slice(page * pageSize, page * pageSize + pageSize).map(toNormalizedProduct);
}

export function getStaticProductBySlug(slug: string): NormalizedProduct | null {
  const { products } = loadCatalogFile();
  const found =
    products.find((p) => p.slug === slug) ||
    products.find((p) => String(p.id) === slug);
  return found ? toNormalizedProduct(found) : null;
}

export function getStaticProductById(id: number): NormalizedProduct | null {
  const { products } = loadCatalogFile();
  const found = products.find((p) => p.id === id);
  return found ? toNormalizedProduct(found) : null;
}

export function getAllStaticProductSlugs(): string[] {
  return loadCatalogFile()
    .products.filter((p) => p.active)
    .map((p) => p.slug);
}

export function getAllStaticCategorySlugs(): string[] {
  const slugs = loadCatalogFile()
    .categories.filter((c) => c.active)
    .map((c) => c.slug);
  const marketing = getMarketingCategorySlugs();
  return Array.from(new Set(["tum-urunler", ...slugs, ...marketing]));
}

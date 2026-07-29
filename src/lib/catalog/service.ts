import { prisma } from "@/lib/db";
import { isTicimaxConfigured } from "@/lib/env";
import { appCache, CACHE_TTL } from "@/lib/cache/memory-cache";
import { buildCategoryTree } from "@/lib/ticimax/mappers";
import { fetchCategories, fetchProductById, fetchProducts } from "@/lib/ticimax/products";
import { slugify } from "@/lib/format";
import type { NormalizedCategory, NormalizedProduct } from "@/lib/ticimax/types";

export interface CatalogResult<T> {
  data: T;
  source: "cache" | "ticimax" | "empty";
  configured: boolean;
  message?: string;
}

type ProductRow = {
  ticimaxId: number;
  variantId: number | null;
  slug: string;
  name: string;
  categoryId: number | null;
  categoryName: string | null;
  brandId: number | null;
  brandName: string | null;
  price: number;
  salePrice: number | null;
  stock: number;
  active: boolean;
  imageUrl: string | null;
  customImageUrl: string | null;
  description: string | null;
  shortDesc: string | null;
  customDescription: string | null;
  sku: string | null;
  barcode: string | null;
  vatRate: number | null;
  raw: string;
};

export function productFromCacheRow(row: ProductRow): NormalizedProduct {
  const image = row.customImageUrl || row.imageUrl;
  const description = row.customDescription || row.description || row.shortDesc || undefined;
  let parsed: Partial<NormalizedProduct> = {};
  try {
    parsed = JSON.parse(row.raw) as NormalizedProduct;
  } catch {
    /* ignore */
  }

  const variants =
    parsed.variants && parsed.variants.length > 0
      ? parsed.variants
      : [
          {
            id: row.variantId || row.ticimaxId,
            productId: row.ticimaxId,
            sku: row.sku || undefined,
            barcode: row.barcode || undefined,
            price: row.price,
            salePrice: row.salePrice ?? undefined,
            stock: row.stock,
            vatRate: row.vatRate ?? undefined,
            active: row.active,
            options: [],
            imageUrl: image || undefined,
          },
        ];

  return {
    id: row.ticimaxId,
    name: row.name,
    slug: row.slug,
    description,
    categoryId: row.categoryId ?? undefined,
    categoryName: row.categoryName || parsed.categoryName,
    brandId: row.brandId ?? undefined,
    brandName: row.brandName || parsed.brandName,
    active: row.active,
    price: row.price,
    salePrice: row.salePrice ?? undefined,
    stock: row.stock,
    vatRate: row.vatRate ?? undefined,
    images: image ? [image] : parsed.images || [],
    variants,
    seoTitle: parsed.seoTitle,
    seoDescription: parsed.seoDescription || row.shortDesc || undefined,
  };
}

export async function getCategories(): Promise<CatalogResult<NormalizedCategory[]>> {
  const configured = isTicimaxConfigured();
  const cacheKey = "categories:tree";
  const mem = appCache.get<NormalizedCategory[]>(cacheKey);
  if (mem) return { data: mem, source: "cache", configured };

  const rows = await prisma.categoryCache.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } });
  if (rows.length > 0) {
    const flat = rows.map((r) => ({
      id: r.ticimaxId,
      parentId: r.parentId,
      name: r.name,
      slug: r.slug,
      active: r.active,
      sortOrder: r.sortOrder,
      seoTitle: r.seoTitle ?? undefined,
      seoDescription: r.seoDesc ?? undefined,
    }));
    const tree = buildCategoryTree(flat);
    appCache.set(cacheKey, tree, CACHE_TTL.categories);
    return { data: tree, source: "cache", configured };
  }

  if (!configured) {
    return {
      data: [],
      source: "empty",
      configured: false,
      message: "Henüz kategori yok. Excel import veya Ticimax senkronizasyonu çalıştırın.",
    };
  }

  try {
    const tree = await fetchCategories();
    appCache.set(cacheKey, tree, CACHE_TTL.categories);
    return { data: tree, source: "ticimax", configured };
  } catch (error) {
    return {
      data: [],
      source: "empty",
      configured,
      message: error instanceof Error ? error.message : "Kategoriler alınamadı",
    };
  }
}

export async function getProducts(options?: {
  categoryId?: number;
  categorySlug?: string;
  sort?: "price_asc" | "price_desc" | "name" | "newest";
  q?: string;
  page?: number;
  pageSize?: number;
}): Promise<CatalogResult<NormalizedProduct[]>> {
  const configured = isTicimaxConfigured();
  const page = options?.page ?? 0;
  const pageSize = options?.pageSize ?? 48;

  let categoryId = options?.categoryId;
  let categoryName: string | undefined;

  if (!categoryId && options?.categorySlug && options.categorySlug !== "tum-urunler") {
    const cat = await prisma.categoryCache.findUnique({ where: { slug: options.categorySlug } });
    categoryId = cat?.ticimaxId;
    categoryName = cat?.name;
    if (!cat) {
      // try match by slugified name on product categoryName
      categoryName = options.categorySlug.replace(/-/g, " ");
    }
  }

  const cached = await prisma.productCache.findMany({
    where: {
      active: true,
      ...(categoryId ? { categoryId } : categoryName ? { categoryName: { contains: categoryName } } : {}),
      ...(options?.q ? { OR: [{ name: { contains: options.q } }, { shortDesc: { contains: options.q } }] } : {}),
    },
    take: pageSize,
    skip: page * pageSize,
    orderBy:
      options?.sort === "price_asc"
        ? { price: "asc" }
        : options?.sort === "price_desc"
          ? { price: "desc" }
          : options?.sort === "name"
            ? { name: "asc" }
            : { syncedAt: "desc" },
  });

  if (cached.length > 0) {
    return { data: cached.map(productFromCacheRow), source: "cache", configured };
  }

  // Fallback: if we have any products but category filter missed, try slug match on name
  const anyCount = await prisma.productCache.count({ where: { active: true } });
  if (anyCount > 0 && options?.categorySlug && options.categorySlug !== "tum-urunler") {
    const all = await prisma.productCache.findMany({ where: { active: true }, take: 500 });
    const needle = options.categorySlug.toLowerCase();
    const filtered = all
      .map(productFromCacheRow)
      .filter((p) => slugify(p.categoryName || "").includes(needle) || slugify(p.categoryName || "") === needle);
    if (filtered.length > 0) {
      return { data: filtered.slice(0, pageSize), source: "cache", configured };
    }
  }

  if (anyCount === 0 && !configured) {
    return {
      data: [],
      source: "empty",
      configured: false,
      message: "Ürün bulunamadı. Excel import veya Ticimax senkronizasyonu çalıştırın.",
    };
  }

  if (!configured) {
    return { data: [], source: "empty", configured: false, message: "Bu kategoride ürün yok." };
  }

  try {
    let products = await fetchProducts({
      categoryId,
      activeOnly: true,
      page,
      pageSize,
      sortBy: options?.sort === "name" ? "UrunAdi" : "ID",
      sortDir: options?.sort === "price_asc" ? "ASC" : "DESC",
    });
    if (options?.q) {
      const q = options.q.toLowerCase();
      products = products.filter((p) => p.name.toLowerCase().includes(q));
    }
    return { data: products, source: "ticimax", configured };
  } catch (error) {
    return {
      data: [],
      source: "empty",
      configured,
      message: error instanceof Error ? error.message : "Ürünler alınamadı",
    };
  }
}

export async function getProductBySlug(slug: string): Promise<CatalogResult<NormalizedProduct | null>> {
  const configured = isTicimaxConfigured();
  const cached = await prisma.productCache.findUnique({ where: { slug } });
  if (cached) return { data: productFromCacheRow(cached), source: "cache", configured };

  const asId = Number(slug);
  if (Number.isFinite(asId) && asId > 0) {
    const byId = await prisma.productCache.findUnique({ where: { ticimaxId: asId } });
    if (byId) return { data: productFromCacheRow(byId), source: "cache", configured };
  }

  if (!configured) {
    return { data: null, source: "empty", configured: false, message: "Ürün bulunamadı" };
  }

  try {
    if (Number.isFinite(asId) && asId > 0) {
      const product = await fetchProductById(asId);
      return { data: product, source: product ? "ticimax" : "empty", configured };
    }
    const products = await fetchProducts({ activeOnly: true, pageSize: 200 });
    const found = products.find((p) => p.slug === slug) ?? null;
    return { data: found, source: found ? "ticimax" : "empty", configured };
  } catch (error) {
    return {
      data: null,
      source: "empty",
      configured,
      message: error instanceof Error ? error.message : "Ürün alınamadı",
    };
  }
}

export async function getProductById(id: number): Promise<NormalizedProduct | null> {
  const cached = await prisma.productCache.findUnique({ where: { ticimaxId: id } });
  if (cached) return productFromCacheRow(cached);
  if (!isTicimaxConfigured()) return null;
  return fetchProductById(id);
}

import { prisma } from "@/lib/db";
import { isTicimaxConfigured } from "@/lib/env";
import { appCache, CACHE_TTL } from "@/lib/cache/memory-cache";
import { buildCategoryTree, mapProduct } from "@/lib/ticimax/mappers";
import { fetchCategories, fetchProductById, fetchProducts } from "@/lib/ticimax/products";
import type { NormalizedCategory, NormalizedProduct } from "@/lib/ticimax/types";

export interface CatalogResult<T> {
  data: T;
  source: "cache" | "ticimax" | "empty";
  configured: boolean;
  message?: string;
}

function productFromCacheRow(row: {
  ticimaxId: number;
  slug: string;
  name: string;
  categoryId: number | null;
  brandId: number | null;
  price: number;
  salePrice: number | null;
  stock: number;
  active: boolean;
  imageUrl: string | null;
  raw: string;
}): NormalizedProduct {
  try {
    const parsed = JSON.parse(row.raw) as NormalizedProduct;
    if (parsed?.id) return parsed;
  } catch {
    /* fall through */
  }
  return {
    id: row.ticimaxId,
    name: row.name,
    slug: row.slug,
    categoryId: row.categoryId ?? undefined,
    brandId: row.brandId ?? undefined,
    active: row.active,
    price: row.price,
    salePrice: row.salePrice ?? undefined,
    stock: row.stock,
    images: row.imageUrl ? [row.imageUrl] : [],
    variants: [],
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
      message: "Ticimax yapılandırması eksik. TICIMAX_BASE_URL ve TICIMAX_UYE_KODU ayarlayın.",
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
  if (!categoryId && options?.categorySlug) {
    const cat = await prisma.categoryCache.findUnique({ where: { slug: options.categorySlug } });
    categoryId = cat?.ticimaxId;
  }

  const cached = await prisma.productCache.findMany({
    where: {
      active: true,
      ...(categoryId ? { categoryId } : {}),
      ...(options?.q
        ? { name: { contains: options.q } }
        : {}),
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
    return {
      data: cached.map(productFromCacheRow),
      source: "cache",
      configured,
    };
  }

  if (!configured) {
    return {
      data: [],
      source: "empty",
      configured: false,
      message: "Ticimax yapılandırması eksik veya henüz senkronizasyon yapılmadı.",
    };
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

    if (options?.sort === "price_asc") {
      products = [...products].sort((a, b) => a.price - b.price);
    } else if (options?.sort === "price_desc") {
      products = [...products].sort((a, b) => b.price - a.price);
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
  if (cached) {
    return { data: productFromCacheRow(cached), source: "cache", configured };
  }

  if (!configured) {
    return {
      data: null,
      source: "empty",
      configured: false,
      message: "Ürün bulunamadı. Ticimax bağlantısı yapılandırılmamış.",
    };
  }

  // slug may be numeric id
  const asId = Number(slug);
  if (Number.isFinite(asId) && asId > 0) {
    try {
      const product = await fetchProductById(asId);
      return { data: product, source: "ticimax", configured };
    } catch (error) {
      return {
        data: null,
        source: "empty",
        configured,
        message: error instanceof Error ? error.message : "Ürün alınamadı",
      };
    }
  }

  try {
    const products = await fetchProducts({ activeOnly: true, pageSize: 200 });
    const found = products.find((p) => p.slug === slug) ?? null;
    return { data: found, source: found ? "ticimax" : "empty", configured, message: found ? undefined : "Ürün bulunamadı" };
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

export { mapProduct };

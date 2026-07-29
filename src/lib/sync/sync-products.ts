import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";
import { appCache } from "@/lib/cache/memory-cache";
import { fetchCategories, fetchProducts } from "@/lib/ticimax/products";
import { isTicimaxConfigured } from "@/lib/env";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withBackoff<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = Math.min(8000, 500 * 2 ** i);
      await sleep(delay);
    }
  }
  throw lastError;
}

export async function syncCategoriesAndProducts(): Promise<{
  success: boolean;
  categoryCount: number;
  productCount: number;
  message: string;
  syncRunId: string;
}> {
  if (!isTicimaxConfigured()) {
    throw new Error("Ticimax yapılandırması eksik");
  }

  const run = await prisma.syncRun.create({
    data: { type: "PRODUCTS", status: "RUNNING" },
  });

  let categoryCount = 0;
  let productCount = 0;

  try {
    const categories = await withBackoff(() => fetchCategories());
    const flat: Array<{
      id: number;
      parentId: number;
      name: string;
      slug: string;
      active: boolean;
      sortOrder: number;
      seoTitle?: string;
      seoDescription?: string;
    }> = [];

    const walk = (nodes: typeof categories) => {
      for (const n of nodes) {
        flat.push(n);
        if (n.children?.length) walk(n.children);
      }
    };
    walk(categories);

    for (const cat of flat) {
      await prisma.categoryCache.upsert({
        where: { ticimaxId: cat.id },
        create: {
          ticimaxId: cat.id,
          parentId: cat.parentId,
          slug: cat.slug || String(cat.id),
          name: cat.name,
          sortOrder: cat.sortOrder,
          active: cat.active,
          seoTitle: cat.seoTitle,
          seoDesc: cat.seoDescription,
          raw: JSON.stringify(cat),
        },
        update: {
          parentId: cat.parentId,
          slug: cat.slug || String(cat.id),
          name: cat.name,
          sortOrder: cat.sortOrder,
          active: cat.active,
          seoTitle: cat.seoTitle,
          seoDesc: cat.seoDescription,
          raw: JSON.stringify(cat),
          syncedAt: new Date(),
        },
      });
      categoryCount += 1;
    }

    const pageSize = 50;
    for (let page = 0; page < 40; page++) {
      const products = await withBackoff(() =>
        fetchProducts({ activeOnly: false, page, pageSize, sortBy: "ID", sortDir: "ASC" }),
      );
      if (products.length === 0) break;

      for (const product of products) {
        try {
          const existing = await prisma.productCache.findUnique({ where: { ticimaxId: product.id } });
          const imageUrl = product.images[0] || existing?.imageUrl || null;
          const description = existing?.customDescription || product.description || existing?.description || null;
          await prisma.productCache.upsert({
            where: { ticimaxId: product.id },
            create: {
              ticimaxId: product.id,
              variantId: product.variants[0]?.id ?? null,
              slug: product.slug || String(product.id),
              name: product.name,
              categoryId: product.categoryId,
              categoryName: product.categoryName,
              brandId: product.brandId,
              brandName: product.brandName,
              price: product.price,
              salePrice: product.salePrice,
              stock: product.stock,
              active: product.active,
              imageUrl,
              description: product.description,
              sku: product.variants[0]?.sku,
              barcode: product.variants[0]?.barcode,
              vatRate: product.vatRate,
              raw: JSON.stringify(product),
            },
            update: {
              variantId: product.variants[0]?.id ?? null,
              slug: existing?.slug || product.slug || String(product.id),
              name: product.name,
              categoryId: product.categoryId,
              categoryName: product.categoryName,
              brandId: product.brandId,
              brandName: product.brandName,
              price: product.price,
              salePrice: product.salePrice,
              stock: product.stock,
              active: product.active,
              imageUrl,
              description,
              sku: product.variants[0]?.sku,
              barcode: product.variants[0]?.barcode,
              vatRate: product.vatRate,
              raw: JSON.stringify({
                ...product,
                description,
                images: existing?.customImageUrl ? [existing.customImageUrl] : product.images,
              }),
              syncedAt: new Date(),
            },
          });
          productCount += 1;
        } catch (error) {
          await prisma.syncError.create({
            data: {
              syncRunId: run.id,
              entityType: "product",
              entityId: String(product.id),
              message: error instanceof Error ? error.message : "Ürün kaydı başarısız",
            },
          });
        }
      }

      if (products.length < pageSize) break;
      await sleep(200);
    }

    appCache.clear();

    await prisma.syncRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        successCount: productCount + categoryCount,
        message: `${categoryCount} kategori, ${productCount} ürün senkronize edildi`,
      },
    });

    await prisma.appMeta.upsert({
      where: { key: "last_product_sync" },
      create: { key: "last_product_sync", value: new Date().toISOString() },
      update: { value: new Date().toISOString() },
    });

    logger.info("sync.products.success", { categoryCount, productCount });

    return {
      success: true,
      categoryCount,
      productCount,
      message: `${categoryCount} kategori, ${productCount} ürün senkronize edildi`,
      syncRunId: run.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Senkronizasyon başarısız";
    await prisma.syncRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        failureCount: 1,
        message,
      },
    });
    logger.error("sync.products.failed", { message });
    throw error;
  }
}

export async function syncOrders(limit = 50): Promise<{ count: number; syncRunId: string }> {
  if (!isTicimaxConfigured()) throw new Error("Ticimax yapılandırması eksik");

  const { fetchOrders } = await import("@/lib/ticimax/orders");
  const run = await prisma.syncRun.create({ data: { type: "ORDERS", status: "RUNNING" } });

  try {
    const orders = await withBackoff(() => fetchOrders(limit));
    await prisma.syncRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        successCount: orders.length,
        message: `${orders.length} sipariş çekildi`,
      },
    });
    await prisma.appMeta.upsert({
      where: { key: "last_order_sync" },
      create: { key: "last_order_sync", value: new Date().toISOString() },
      update: { value: new Date().toISOString() },
    });
    return { count: orders.length, syncRunId: run.id };
  } catch (error) {
    await prisma.syncRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        message: error instanceof Error ? error.message : "Sipariş sync hatası",
      },
    });
    throw error;
  }
}

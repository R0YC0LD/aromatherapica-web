import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();

async function main() {
  const file = path.join(process.cwd(), "data", "seed-catalog.json");
  if (!fs.existsSync(file)) {
    console.log("No seed file found, skip");
    return;
  }
  const payload = JSON.parse(fs.readFileSync(file, "utf8")) as {
    products: Array<Record<string, unknown>>;
    categories: Array<Record<string, unknown>>;
  };

  for (const cat of payload.categories) {
    const ticimaxId = Number(cat.ticimaxId);
    await prisma.categoryCache.upsert({
      where: { ticimaxId },
      create: {
        ticimaxId,
        parentId: Number(cat.parentId || 0),
        slug: String(cat.slug),
        name: String(cat.name),
        sortOrder: Number(cat.sortOrder || 0),
        active: Boolean(cat.active),
        seoTitle: (cat.seoTitle as string) || null,
        seoDesc: (cat.seoDesc as string) || null,
        raw: String(cat.raw || "{}"),
      },
      update: {
        name: String(cat.name),
        slug: String(cat.slug),
        parentId: Number(cat.parentId || 0),
        active: Boolean(cat.active),
        raw: String(cat.raw || "{}"),
      },
    });
  }

  for (const p of payload.products) {
    const ticimaxId = Number(p.ticimaxId);
    await prisma.productCache.upsert({
      where: { ticimaxId },
      create: {
        ticimaxId,
        variantId: p.variantId == null ? null : Number(p.variantId),
        slug: String(p.slug),
        name: String(p.name),
        categoryId: p.categoryId == null ? null : Number(p.categoryId),
        categoryName: (p.categoryName as string) || null,
        brandId: p.brandId == null ? null : Number(p.brandId),
        brandName: (p.brandName as string) || null,
        price: Number(p.price || 0),
        salePrice: p.salePrice == null ? null : Number(p.salePrice),
        stock: Number(p.stock || 0),
        active: Boolean(p.active),
        imageUrl: (p.imageUrl as string) || null,
        customImageUrl: (p.customImageUrl as string) || null,
        description: (p.description as string) || null,
        shortDesc: (p.shortDesc as string) || null,
        customDescription: (p.customDescription as string) || null,
        sku: (p.sku as string) || null,
        barcode: (p.barcode as string) || null,
        vatRate: p.vatRate == null ? null : Number(p.vatRate),
        raw: String(p.raw || "{}"),
      },
      update: {
        name: String(p.name),
        price: Number(p.price || 0),
        salePrice: p.salePrice == null ? null : Number(p.salePrice),
        stock: Number(p.stock || 0),
        active: Boolean(p.active),
        categoryName: (p.categoryName as string) || null,
        description: (p.description as string) || null,
        shortDesc: (p.shortDesc as string) || null,
        raw: String(p.raw || "{}"),
      },
    });
  }

  console.log(`Seeded ${payload.products.length} products, ${payload.categories.length} categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

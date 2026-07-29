/**
 * Import products from Ticimax Excel export into ProductCache + CategoryCache.
 * Usage: npx tsx scripts/import-ticimax-xls.ts [path-to-xls]
 */
import path from "node:path";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";

const prisma = new PrismaClient();

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function num(v: unknown): number {
  if (typeof v === "number") return v;
  const n = Number(String(v ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function str(v: unknown): string {
  return String(v ?? "").trim();
}

async function main() {
  const file =
    process.argv[2] ||
    path.join(process.env.USERPROFILE || "", "Downloads", "TicimaxExport-4.xls");

  if (!fs.existsSync(file)) {
    throw new Error(`Excel bulunamadı: ${file}`);
  }

  const wb = XLSX.readFile(file);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  console.log(`Import: ${rows.length} satır`);

  const categoryMap = new Map<string, number>();
  let categorySeq = 1;
  let productCount = 0;
  const usedSlugs = new Set<string>();

  for (const row of rows) {
    const cardId = num(row.URUNKARTIID);
    const variantId = num(row.URUNID);
    if (!cardId) continue;

    const name = str(row.URUNADI) || `Ürün ${cardId}`;
    const breadcrumb = str(row.BREADCRUMBKAT);
    const leafCategory = breadcrumb.split(">").map((s) => s.trim()).filter(Boolean).pop() || "Genel";
    const parentCategory = breadcrumb.split(">").map((s) => s.trim()).filter(Boolean)[0] || leafCategory;

    if (!categoryMap.has(parentCategory)) {
      const id = categorySeq++;
      categoryMap.set(parentCategory, id);
      await prisma.categoryCache.upsert({
        where: { ticimaxId: id },
        create: {
          ticimaxId: id,
          parentId: 0,
          slug: slugify(parentCategory) || `kat-${id}`,
          name: parentCategory,
          sortOrder: id,
          active: true,
          raw: JSON.stringify({ name: parentCategory }),
        },
        update: {
          name: parentCategory,
          slug: slugify(parentCategory) || `kat-${id}`,
          syncedAt: new Date(),
        },
      });
    }

    if (leafCategory !== parentCategory && !categoryMap.has(leafCategory)) {
      const parentId = categoryMap.get(parentCategory)!;
      const id = categorySeq++;
      categoryMap.set(leafCategory, id);
      await prisma.categoryCache.upsert({
        where: { ticimaxId: id },
        create: {
          ticimaxId: id,
          parentId,
          slug: slugify(leafCategory) || `kat-${id}`,
          name: leafCategory,
          sortOrder: id,
          active: true,
          raw: JSON.stringify({ name: leafCategory, parent: parentCategory }),
        },
        update: {
          name: leafCategory,
          parentId,
          syncedAt: new Date(),
        },
      });
    }

    const categoryId = categoryMap.get(leafCategory) || categoryMap.get(parentCategory)!;
    let slug = slugify(name) || `urun-${cardId}`;
    if (usedSlugs.has(slug)) slug = `${slug}-${cardId}`;
    usedSlugs.add(slug);

    const price = num(row.SATISFIYATI);
    const sale = num(row.INDIRIMLIFIYAT);
    const stock = Math.max(0, Math.floor(num(row.STOKADEDI)));
    const active = str(row.URUNAKTIF) === "1" || str(row.KARTAKTIF) === "1";
    const shortDesc = str(row.ONYAZI);
    const description = str(row.ACIKLAMA) || shortDesc;
    const brandName = str(row.MARKA);

    const normalized = {
      id: cardId,
      name,
      slug,
      description,
      categoryId,
      categoryName: leafCategory,
      brandName,
      active,
      price,
      salePrice: sale > 0 && sale < price ? sale : undefined,
      stock,
      vatRate: num(row.KDVORANI) || 20,
      images: [] as string[],
      variants: [
        {
          id: variantId || cardId,
          productId: cardId,
          sku: str(row.STOKKODU) || undefined,
          barcode: str(row.BARKOD) || undefined,
          price,
          salePrice: sale > 0 && sale < price ? sale : undefined,
          stock,
          vatRate: num(row.KDVORANI) || 20,
          active,
          options: [],
        },
      ],
      seoTitle: str(row.SEO_SAYFABASLIK) || name,
      seoDescription: str(row.SEO_SAYFAACIKLAMA) || shortDesc.slice(0, 160),
    };

    // Preserve admin custom overrides if product already exists
    const existing = await prisma.productCache.findUnique({ where: { ticimaxId: cardId } });

    await prisma.productCache.upsert({
      where: { ticimaxId: cardId },
      create: {
        ticimaxId: cardId,
        variantId: variantId || null,
        slug,
        name,
        categoryId,
        categoryName: leafCategory,
        brandName: brandName || null,
        price,
        salePrice: sale > 0 && sale < price ? sale : null,
        stock,
        active,
        imageUrl: null,
        customImageUrl: null,
        description,
        shortDesc: shortDesc || null,
        customDescription: null,
        sku: str(row.STOKKODU) || null,
        barcode: str(row.BARKOD) || null,
        vatRate: num(row.KDVORANI) || 20,
        raw: JSON.stringify(normalized),
      },
      update: {
        variantId: variantId || null,
        slug: existing?.slug || slug,
        name,
        categoryId,
        categoryName: leafCategory,
        brandName: brandName || null,
        price,
        salePrice: sale > 0 && sale < price ? sale : null,
        stock,
        active,
        description,
        shortDesc: shortDesc || null,
        sku: str(row.STOKKODU) || null,
        barcode: str(row.BARKOD) || null,
        vatRate: num(row.KDVORANI) || 20,
        raw: JSON.stringify({
          ...normalized,
          images: existing?.customImageUrl
            ? [existing.customImageUrl]
            : existing?.imageUrl
              ? [existing.imageUrl]
              : [],
          description: existing?.customDescription || description,
        }),
        syncedAt: new Date(),
      },
    });

    productCount += 1;
  }

  await prisma.appMeta.upsert({
    where: { key: "last_excel_import" },
    create: { key: "last_excel_import", value: new Date().toISOString() },
    update: { value: new Date().toISOString() },
  });

  console.log(`Tamam: ${productCount} ürün, ${categoryMap.size} kategori`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

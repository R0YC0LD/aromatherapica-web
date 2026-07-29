import type { MetadataRoute } from "next";
import { getAllStaticCategorySlugs, getAllStaticProductSlugs, isStaticExport } from "@/lib/catalog/static-data";

export const dynamic = "force-static";

const base =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.GITHUB_PAGES === "true"
    ? "https://r0yc0ld.github.io/aromatherapica-web"
    : "https://aromatherapica.com");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isStaticExport() || process.env.GITHUB_PAGES === "true") {
    const now = new Date();
    return [
      { url: base, lastModified: now },
      ...getAllStaticCategorySlugs().map((slug) => ({
        url: `${base}/kategori/${slug}/`,
        lastModified: now,
      })),
      ...getAllStaticProductSlugs().map((slug) => ({
        url: `${base}/urun/${slug}/`,
        lastModified: now,
      })),
    ];
  }

  try {
    const { prisma } = await import("@/lib/db");
    const products = await prisma.productCache.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
      take: 5000,
    });
    const categories = await prisma.categoryCache.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    });

    return [
      { url: base, lastModified: new Date() },
      { url: `${base}/kategori/tum-urunler`, lastModified: new Date() },
      ...categories.map((c) => ({
        url: `${base}/kategori/${c.slug}`,
        lastModified: c.updatedAt,
      })),
      ...products.map((p) => ({
        url: `${base}/urun/${p.slug}`,
        lastModified: p.updatedAt,
      })),
    ];
  } catch {
    return [{ url: base, lastModified: new Date() }];
  }
}

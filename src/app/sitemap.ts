import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://aromatherapica.com";
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
}

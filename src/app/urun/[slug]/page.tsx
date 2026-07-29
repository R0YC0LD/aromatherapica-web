import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/catalog/service";
import { ProductView } from "@/components/ProductView";
import { getAllStaticProductSlugs } from "@/lib/catalog/static-data";

export function generateStaticParams() {
  return getAllStaticProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getProductBySlug(slug);
  if (!data) return { title: "Ürün bulunamadı" };
  return {
    title: data.seoTitle || data.name,
    description: data.seoDescription || data.description?.slice(0, 160),
    openGraph: { title: data.name, description: data.description?.slice(0, 160) },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: product } = await getProductBySlug(slug);
  if (!product) notFound();

  const variant = product.variants[0];
  const price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: variant?.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <section className="section" style={{ display: "grid", gap: "2rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductView product={product} />
    </section>
  );
}

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/catalog/service";
import { formatCurrency } from "@/lib/format";
import { AddToCartButton } from "@/components/AddToCartButton";
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
      <div style={{ display: "grid", gap: "1.5rem" }} className="product-detail">
        <div className="product-card-media" style={{ maxWidth: 520 }}>
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <div className="product-placeholder">{product.name.slice(0, 1)}</div>
          )}
        </div>
        <div>
          <p className="product-cat">{product.categoryName || product.brandName}</p>
          <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
            {product.name}
          </h1>
          <p className="product-price" style={{ fontSize: "1.35rem" }}>
            <span>{formatCurrency(price)}</span>
            {product.salePrice && product.salePrice < product.price ? <s>{formatCurrency(product.price)}</s> : null}
          </p>
          <p>{product.stock > 0 ? `Stok: ${product.stock}` : "Stokta yok"}</p>
          {product.description ? (
            <div style={{ marginTop: "1rem", color: "var(--muted)" }} dangerouslySetInnerHTML={{ __html: product.description }} />
          ) : null}
          <div style={{ marginTop: "1.5rem" }}>
            <AddToCartButton
              productId={product.id}
              variantId={variant?.id || product.id}
              slug={product.slug}
              name={product.name}
              imageUrl={product.images[0]}
              price={product.price}
              salePrice={product.salePrice}
              disabled={product.stock <= 0}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

import { getProducts } from "@/lib/catalog/service";
import { ProductCard } from "@/components/ProductCard";
import Link from "next/link";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const sort = (sp.sort as "price_asc" | "price_desc" | "name" | "newest") || "newest";
  const categorySlug = slug === "tum-urunler" ? undefined : slug;

  const { data: products, message } = await getProducts({
    categorySlug,
    sort,
    q: sp.q,
    pageSize: 48,
  });

  return (
    <section className="section">
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: "2.2rem" }}>
        {slug === "tum-urunler" ? "Tüm ürünler" : slug.replace(/-/g, " ")}
      </h1>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", margin: "1rem 0 1.5rem" }}>
        <Link href={`?sort=newest`}>Yeni</Link>
        <Link href={`?sort=price_asc`}>Fiyat ↑</Link>
        <Link href={`?sort=price_desc`}>Fiyat ↓</Link>
        <Link href={`?sort=name`}>İsim</Link>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">{message || "Bu kategoride ürün bulunamadı."}</div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

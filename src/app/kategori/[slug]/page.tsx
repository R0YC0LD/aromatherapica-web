import { getProducts } from "@/lib/catalog/service";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { getAllStaticCategorySlugs } from "@/lib/catalog/static-data";

export function generateStaticParams() {
  return getAllStaticCategorySlugs().map((slug) => ({ slug }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categorySlug = slug === "tum-urunler" ? undefined : slug;

  const { data: products, message } = await getProducts({
    categorySlug,
    sort: "newest",
    pageSize: 48,
  });

  return (
    <section className="section">
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: "2.2rem" }}>
        {slug === "tum-urunler" ? "Tüm ürünler" : slug.replace(/-/g, " ")}
      </h1>
      <CategoryProductGrid products={products} emptyMessage={message} />
    </section>
  );
}

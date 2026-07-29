import { getProducts } from "@/lib/catalog/service";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { getAllStaticCategorySlugs } from "@/lib/catalog/static-data";
import { MARKETING_CATEGORY_RULES } from "@/lib/cms/category-map";

export function generateStaticParams() {
  return getAllStaticCategorySlugs().map((slug) => ({ slug }));
}

function titleForSlug(slug: string) {
  if (slug === "tum-urunler") return "Tüm ürünler";
  return MARKETING_CATEGORY_RULES[slug]?.label || slug.replace(/-/g, " ");
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
    pageSize: 96,
  });

  return (
    <section className="section">
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: "2.2rem" }}>
        {titleForSlug(slug)}
      </h1>
      <CategoryProductGrid products={products} emptyMessage={message} />
    </section>
  );
}

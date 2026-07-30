import Link from "next/link";
import { getProducts } from "@/lib/catalog/service";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { BackButton } from "@/components/BackButton";
import { getAllStaticCategorySlugs } from "@/lib/catalog/static-data";
import { MARKETING_CATEGORY_RULES } from "@/lib/cms/category-map";

export function generateStaticParams() {
  return getAllStaticCategorySlugs().map((slug) => ({ slug }));
}

function titleForSlug(slug: string) {
  if (slug === "tum-urunler") return "Tüm ürünler";
  return MARKETING_CATEGORY_RULES[slug]?.label || slug.replace(/-/g, " ");
}

function blurbForSlug(slug: string) {
  const label = titleForSlug(slug);
  if (slug === "ucucu-yaglar") {
    return "Saf aromatik yağlarla günlük ritüelinizi zenginleştirin. Her yağın kendine özgü karakterini keşfedin.";
  }
  if (slug === "sabit-tasiyici-yaglar") {
    return "Uçucu yağları seyreltmek ve cildi beslemek için özenle seçilmiş taşıyıcı yağlar.";
  }
  if (slug === "cilt-bakimi") {
    return "Cildinizin ritmine uygun, bitkisel karakterli bakım seçkisi.";
  }
  return `${label} kategorisindeki Aromatherapica ürünlerini keşfedin.`;
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categorySlug = slug === "tum-urunler" ? undefined : slug;
  const title = titleForSlug(slug);

  const { data: products, message } = await getProducts({
    categorySlug,
    sort: "newest",
    pageSize: 96,
  });

  return (
    <section className="commerce-page category-page">
      <nav className="commerce-breadcrumb" aria-label="Sayfa yolu">
        <BackButton fallbackHref="/" label="Ana menü" />
        <Link href="/">Ana sayfa</Link>
        <span>/</span>
        <span aria-current="page">{title}</span>
      </nav>

      <header className="catalog-hero">
        <div className="catalog-hero-copy">
          <p className="eyebrow">Kategori</p>
          <h1>{title}</h1>
          <p>{blurbForSlug(slug)}</p>
        </div>
        <div className="catalog-hero-visual" aria-hidden="true">
          <span className="catalog-hero-ring" />
          <span className="catalog-hero-mark">A</span>
        </div>
      </header>

      <div className="catalog-shell">
        <CategoryProductGrid products={products} emptyMessage={message} />
      </div>
    </section>
  );
}

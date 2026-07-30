import { ProductCard } from "@/components/ProductCard";
import { getRecommendations } from "@/lib/catalog/recommendations";
import { getStaticProducts } from "@/lib/catalog/static-data";
import type { NormalizedProduct } from "@/lib/ticimax/types";

export function RelatedProducts({ product }: { product: NormalizedProduct }) {
  const catalog = getStaticProducts({ pageSize: 500 });
  const recommendations = getRecommendations({
    seed: {
      id: product.id,
      variantId: product.variants[0]?.id,
      slug: product.slug,
      name: product.name,
      categoryId: product.categoryId,
      categoryName: product.categoryName,
      price: product.price,
      salePrice: product.salePrice,
      stock: product.stock,
      active: product.active,
      imageUrl: product.images[0],
    },
    catalog: catalog.map((p) => ({
      id: p.id,
      variantId: p.variants[0]?.id,
      slug: p.slug,
      name: p.name,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      price: p.price,
      salePrice: p.salePrice,
      stock: p.stock,
      active: p.active,
      imageUrl: p.images[0],
    })),
    excludeIds: [product.id],
    limit: 4,
  });

  if (recommendations.length === 0) return null;

  const products = recommendations
    .map((r) => catalog.find((p) => p.id === r.product.id))
    .filter(Boolean) as NormalizedProduct[];

  if (products.length === 0) return null;

  return (
    <section className="related-products">
      <div className="section-heading">
        <p className="eyebrow">Uyumluluk seçkisi</p>
        <h2>Bu yağla birlikte tercih edilenler</h2>
      </div>
      <div className="product-grid">
        {products.map((item) => (
          <ProductCard key={item.id} product={item} />
        ))}
      </div>
    </section>
  );
}

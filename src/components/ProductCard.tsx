import Link from "next/link";
import { formatCurrency } from "@/lib/format";
import type { NormalizedProduct } from "@/lib/ticimax/types";

export function ProductCard({ product }: { product: NormalizedProduct }) {
  const price = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const showOld = product.salePrice && product.salePrice < product.price;

  return (
    <article className="product-card">
      <Link href={`/urun/${product.slug}`} className="product-card-link">
        <div className="product-card-media">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} loading="lazy" />
          ) : (
            <div className="product-placeholder" aria-hidden>
              {product.name.slice(0, 1)}
            </div>
          )}
        </div>
        <div className="product-card-body">
          {product.categoryName ? <p className="product-cat">{product.categoryName}</p> : null}
          <h3>{product.name}</h3>
          <p className="product-price">
            <span>{formatCurrency(price)}</span>
            {showOld ? <s>{formatCurrency(product.price)}</s> : null}
          </p>
          <p className="product-stock">{product.stock > 0 ? "Stokta" : "Tükendi"}</p>
        </div>
      </Link>
    </article>
  );
}

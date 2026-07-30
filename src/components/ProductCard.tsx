"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import { formatCurrency } from "@/lib/format";
import type { NormalizedProduct } from "@/lib/ticimax/types";

export function ProductCard({ product: raw }: { product: NormalizedProduct }) {
  const { add } = useCart();
  const { mergeProduct } = useCatalogOverrides();
  const product = mergeProduct(raw);
  const [favorite, setFavorite] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product.active) return null;

  const hasSale = Boolean(product.salePrice && product.salePrice < product.price);
  const price = hasSale ? (product.salePrice as number) : product.price;
  const outOfStock = product.stock <= 0;
  const variant = product.variants[0];

  function handleAdd() {
    if (outOfStock) return;
    add({
      productId: product.id,
      variantId: variant?.id || product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.images[0],
      price: product.price,
      salePrice: product.salePrice,
      quantity: 1,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1200);
  }

  return (
    <article className="product-card">
      <Link href={`/urun/${product.slug}`} className="product-card-link" aria-label={product.name}>
        <div className="product-image">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} loading="lazy" />
          ) : (
            <span className="css-product-bottle" aria-hidden />
          )}
          {outOfStock ? (
            <span className="product-badge">Tükendi</span>
          ) : hasSale ? (
            <span className="product-badge">İndirimli</span>
          ) : null}
        </div>
      </Link>

      <button
        type="button"
        className={`favorite-button${favorite ? " is-active" : ""}`}
        aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
        onClick={() => setFavorite((value) => !value)}
      >
        <Heart aria-hidden />
      </button>

      <div className="product-info">
        <div className="product-meta">
          <span>{product.categoryName || product.brandName || "Aromatherapica"}</span>
        </div>
        <h3>
          <Link href={`/urun/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className="product-subtitle">{outOfStock ? "Şu anda stokta yok" : "Saf içeriklerle özenle hazırlanır"}</p>
        <div className="price-row">
          <strong>{formatCurrency(price)}</strong>
          {hasSale ? <del>{formatCurrency(product.price)}</del> : null}
        </div>
        <div className="card-actions">
          <button
            type="button"
            className={`add-button${added ? " is-added" : ""}`}
            disabled={outOfStock}
            onClick={handleAdd}
          >
            <ShoppingBag aria-hidden />
            {outOfStock ? "Stokta yok" : added ? "Sepete eklendi" : "Sepete ekle"}
          </button>
          <Link href={`/urun/${product.slug}`} className="quick-button" aria-label="Ürünü incele">
            <Eye aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

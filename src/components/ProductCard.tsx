"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { formatCurrency } from "@/lib/format";
import type { NormalizedProduct } from "@/lib/ticimax/types";

export function ProductCard({ product: raw }: { product: NormalizedProduct }) {
  const { add } = useCart();
  const { mergeProduct } = useCatalogOverrides();
  const { has, toggle } = useWishlist();
  const product = mergeProduct(raw);
  const favorite = has(product.id);
  const [added, setAdded] = useState(false);
  const [popping, setPopping] = useState(false);

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

  function handleFavorite(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const addedFav = toggle(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: product.images[0],
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
      },
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    );
    if (addedFav) {
      setPopping(true);
      window.setTimeout(() => setPopping(false), 450);
    }
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
        className={`favorite-button${favorite ? " is-active" : ""}${popping ? " is-popping" : ""}`}
        aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
        onClick={handleFavorite}
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
        <p className="product-subtitle">
          {outOfStock ? "Şu anda stokta yok" : "Saf içeriklerle özenle hazırlanır"}
        </p>
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

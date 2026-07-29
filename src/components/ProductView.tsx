"use client";

import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatCurrency } from "@/lib/format";
import type { NormalizedProduct } from "@/lib/ticimax/types";

export function ProductView({ product: raw }: { product: NormalizedProduct }) {
  const { mergeProduct } = useCatalogOverrides();
  const product = mergeProduct(raw);
  const variant = product.variants[0];
  const price =
    product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;

  return (
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
          {product.salePrice && product.salePrice < product.price ? (
            <s>{formatCurrency(product.price)}</s>
          ) : null}
        </p>
        <p>{product.stock > 0 ? `Stok: ${product.stock}` : "Stokta yok"}</p>
        {product.description ? (
          <div
            style={{ marginTop: "1rem", color: "var(--muted)" }}
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
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
  );
}

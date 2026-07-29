"use client";

import { useCart } from "@/components/CartProvider";

export function AddToCartButton(props: {
  productId: number;
  variantId: number;
  slug: string;
  name: string;
  imageUrl?: string;
  price: number;
  salePrice?: number;
  disabled?: boolean;
}) {
  const { add } = useCart();

  return (
    <button
      type="button"
      className="btn"
      disabled={props.disabled}
      onClick={() =>
        add({
          productId: props.productId,
          variantId: props.variantId,
          slug: props.slug,
          name: props.name,
          imageUrl: props.imageUrl,
          price: props.price,
          salePrice: props.salePrice,
          quantity: 1,
        })
      }
    >
      {props.disabled ? "Stokta yok" : "Sepete ekle"}
    </button>
  );
}

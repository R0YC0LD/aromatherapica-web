"use client";

import { ShoppingBag } from "lucide-react";
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
      className="add-button product-add"
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
      <ShoppingBag aria-hidden />
      {props.disabled ? "Stokta yok" : "Sepete ekle"}
    </button>
  );
}

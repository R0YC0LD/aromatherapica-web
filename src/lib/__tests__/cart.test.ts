import { describe, expect, it } from "vitest";
import { cartTotal, addToCart, emptyCart, updateCartQuantity } from "@/lib/cart/types";

describe("cart", () => {
  it("adds and totals", () => {
    let cart = emptyCart();
    cart = addToCart(cart, {
      productId: 1,
      variantId: 10,
      slug: "a",
      name: "A",
      price: 100,
      salePrice: 80,
      quantity: 2,
    });
    expect(cartTotal(cart)).toBe(160);
    cart = updateCartQuantity(cart, 10, 1);
    expect(cartTotal(cart)).toBe(80);
  });
});

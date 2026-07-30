export interface CartItem {
  productId: number;
  variantId: number;
  slug: string;
  name: string;
  imageUrl?: string;
  price: number;
  salePrice?: number;
  quantity: number;
  options?: Array<{ name: string; value: string }>;
}

export interface Cart {
  items: CartItem[];
}

export const CART_COOKIE_NAME = "arom_cart";
export const CART_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function emptyCart(): Cart {
  return { items: [] };
}

export function cartTotal(cart: Cart): number {
  return cart.items.reduce((sum, item) => {
    const unit = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
    return sum + unit * item.quantity;
  }, 0);
}

export function cartCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function addToCart(cart: Cart, item: CartItem): Cart {
  const existing = cart.items.find((i) => i.variantId === item.variantId);
  if (existing) {
    return {
      items: cart.items.map((i) =>
        i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i,
      ),
    };
  }
  return { items: [...cart.items, item] };
}

export function updateCartQuantity(cart: Cart, variantId: number, quantity: number): Cart {
  if (quantity <= 0) {
    return { items: cart.items.filter((i) => i.variantId !== variantId) };
  }
  return {
    items: cart.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
  };
}

export function removeFromCart(cart: Cart, variantId: number): Cart {
  return { items: cart.items.filter((i) => i.variantId !== variantId) };
}

export function serializeCart(cart: Cart): string {
  return JSON.stringify(cart);
}

export function parseCart(raw: string | undefined | null): Cart {
  if (!raw) return emptyCart();
  try {
    const parsed = JSON.parse(raw) as Cart;
    if (!parsed || !Array.isArray(parsed.items)) return emptyCart();
    return parsed;
  } catch {
    return emptyCart();
  }
}

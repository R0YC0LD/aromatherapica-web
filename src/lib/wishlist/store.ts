export type WishlistItem = {
  productId: number;
  slug: string;
  name: string;
  imageUrl?: string;
  price: number;
  salePrice?: number;
  stockWhenSaved: number;
  notifyOnRestock: boolean;
  addedAt: string;
};

const KEY = "arom_wishlist_v1";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeWishlist(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function readWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WishlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeWishlist(items: WishlistItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  emit();
}

export function isInWishlist(productId: number) {
  return readWishlist().some((i) => i.productId === productId);
}

export function toggleWishlistItem(item: Omit<WishlistItem, "addedAt" | "notifyOnRestock"> & {
  notifyOnRestock?: boolean;
}): { added: boolean; items: WishlistItem[] } {
  const list = readWishlist();
  const exists = list.find((i) => i.productId === item.productId);
  if (exists) {
    const next = list.filter((i) => i.productId !== item.productId);
    writeWishlist(next);
    return { added: false, items: next };
  }
  const next = [
    {
      ...item,
      notifyOnRestock: item.notifyOnRestock ?? true,
      addedAt: new Date().toISOString(),
    },
    ...list,
  ];
  writeWishlist(next);
  return { added: true, items: next };
}

export function removeWishlistItem(productId: number) {
  writeWishlist(readWishlist().filter((i) => i.productId !== productId));
}

export function updateWishlistStockSnapshot(productId: number, stock: number) {
  const next = readWishlist().map((i) =>
    i.productId === productId ? { ...i, stockWhenSaved: stock } : i,
  );
  writeWishlist(next);
}

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

/** Stable empty snapshot — required by useSyncExternalStore. */
const EMPTY_WISHLIST: WishlistItem[] = [];

let cachedRaw: string | null | undefined;
let cachedItems: WishlistItem[] = EMPTY_WISHLIST;

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeWishlist(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getWishlistServerSnapshot(): WishlistItem[] {
  return EMPTY_WISHLIST;
}

export function readWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return EMPTY_WISHLIST;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedItems;
    cachedRaw = raw;
    if (!raw) {
      cachedItems = EMPTY_WISHLIST;
      return EMPTY_WISHLIST;
    }
    const parsed = JSON.parse(raw) as WishlistItem[];
    cachedItems = Array.isArray(parsed) ? parsed : EMPTY_WISHLIST;
    return cachedItems;
  } catch {
    cachedRaw = null;
    cachedItems = EMPTY_WISHLIST;
    return EMPTY_WISHLIST;
  }
}

function writeWishlist(items: WishlistItem[]) {
  const next = items.length === 0 ? EMPTY_WISHLIST : items;
  const serialized = JSON.stringify(next);
  localStorage.setItem(KEY, serialized);
  cachedRaw = serialized;
  cachedItems = next;
  emit();
}

export function isInWishlist(productId: number) {
  return readWishlist().some((i) => i.productId === productId);
}

export function toggleWishlistItem(
  item: Omit<WishlistItem, "addedAt" | "notifyOnRestock"> & {
    notifyOnRestock?: boolean;
  },
): { added: boolean; items: WishlistItem[] } {
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

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  isInWishlist,
  readWishlist,
  subscribeWishlist,
  toggleWishlistItem,
  type WishlistItem,
} from "@/lib/wishlist/store";

type Burst = { id: number; x: number; y: number };

type WishlistContextValue = {
  items: WishlistItem[];
  count: number;
  has: (productId: number) => boolean;
  toggle: (
    item: {
      productId: number;
      slug: string;
      name: string;
      imageUrl?: string;
      price: number;
      salePrice?: number;
      stock: number;
    },
    origin?: { x: number; y: number },
  ) => boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  bursts: Burst[];
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function useWishlistSnapshot() {
  return useSyncExternalStore(subscribeWishlist, readWishlist, () => []);
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const items = useWishlistSnapshot();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [bursts, setBursts] = useState<Burst[]>([]);

  const spawnBurst = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, x, y }]);
    window.setTimeout(() => {
      setBursts((b) => b.filter((item) => item.id !== id));
    }, 900);
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      count: items.length,
      has: (productId) => isInWishlist(productId),
      toggle: (item, origin) => {
        const { added } = toggleWishlistItem({
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          imageUrl: item.imageUrl,
          price: item.price,
          salePrice: item.salePrice,
          stockWhenSaved: item.stock,
        });
        if (added && origin) spawnBurst(origin.x, origin.y);
        if (added) setDrawerOpen(true);
        return added;
      },
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      bursts,
    }),
    [items, drawerOpen, bursts, spawnBurst],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    // Never crash the storefront if provider mount order fails
    return {
      items: [],
      count: 0,
      has: () => false,
      toggle: () => false,
      drawerOpen: false,
      openDrawer: () => undefined,
      closeDrawer: () => undefined,
      bursts: [],
    } satisfies WishlistContextValue;
  }
  return ctx;
}

export function HeartBursts() {
  const { bursts } = useWishlist();
  return (
    <div className="heart-burst-layer" aria-hidden>
      {bursts.map((b) => (
        <span key={b.id} className="heart-burst" style={{ left: b.x, top: b.y }}>
          ♥
        </span>
      ))}
    </div>
  );
}

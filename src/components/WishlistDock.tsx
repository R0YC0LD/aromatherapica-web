"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Heart, X } from "lucide-react";
import { HeartBursts, useWishlist } from "@/components/WishlistProvider";
import { formatCurrency } from "@/lib/format";
import { withBasePath } from "@/lib/paths";
import { removeWishlistItem, updateWishlistStockSnapshot } from "@/lib/wishlist/store";

type CatalogRow = {
  id: number;
  slug: string;
  name: string;
  stock: number;
  price: number;
  salePrice: number | null;
  imageUrl: string | null;
  active: boolean;
};

export function WishlistDock() {
  const { count, drawerOpen, openDrawer, closeDrawer, items } = useWishlist();
  const [alerts, setAlerts] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<CatalogRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(withBasePath("/data/catalog.json"))
      .then((r) => r.json())
      .then((data: { products: CatalogRow[] }) => {
        if (!cancelled) setCatalog(data.products || []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!catalog.length || !items.length) return;
    const messages: string[] = [];
    for (const item of items) {
      if (!item.notifyOnRestock) continue;
      const live = catalog.find((p) => p.id === item.productId);
      if (!live) continue;
      if (item.stockWhenSaved <= 0 && live.stock > 0) {
        messages.push(`${item.name} yeniden stokta!`);
        updateWishlistStockSnapshot(item.productId, live.stock);
      }
    }
    if (messages.length) setAlerts(messages);
  }, [catalog, items]);

  return (
    <>
      <HeartBursts />
      <button type="button" className="wishlist-dock" onClick={openDrawer} aria-label="İstek listesi">
        <Heart size={16} aria-hidden />
        <span>İSTEK LİSTESİ</span>
        <b>{count}</b>
      </button>

      <AnimatePresence>
        {alerts.length > 0 ? (
          <motion.div
            className="wishlist-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
          >
            <Bell size={16} aria-hidden />
            <div>
              {alerts.map((msg) => (
                <p key={msg}>{msg}</p>
              ))}
            </div>
            <button type="button" aria-label="Kapat" onClick={() => setAlerts([])}>
              <X size={14} />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {drawerOpen ? (
          <>
            <motion.div
              className="page-scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
            />
            <motion.aside
              className="wishlist-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4 }}
              aria-label="İstek listesi"
            >
              <div className="cart-header">
                <div>
                  <p className="cart-drawer-kicker">Favoriler</p>
                  <h2>İstek listesi</h2>
                </div>
                <button type="button" className="close-button" onClick={closeDrawer} aria-label="Kapat">
                  <X size={18} />
                </button>
              </div>
              <div className="cart-drawer-body">
                {items.length === 0 ? (
                  <div className="cart-drawer-empty">
                    <Heart size={28} />
                    <p>Henüz favori ürün yok. Kalbe basarak ekleyin.</p>
                  </div>
                ) : (
                  <ul className="cart-drawer-list">
                    {items.map((item) => {
                      const live = catalog.find((p) => p.id === item.productId);
                      const stock = live?.stock ?? item.stockWhenSaved;
                      return (
                        <li key={item.productId} className="cart-drawer-item">
                          <Link
                            href={`/urun/${item.slug}`}
                            className="cart-drawer-thumb"
                            onClick={closeDrawer}
                          >
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.imageUrl} alt="" />
                            ) : (
                              <span className="css-product-bottle" aria-hidden />
                            )}
                          </Link>
                          <div className="cart-drawer-item-info">
                            <Link href={`/urun/${item.slug}`} onClick={closeDrawer}>
                              {item.name}
                            </Link>
                            <strong>{formatCurrency(item.salePrice || item.price)}</strong>
                            <p className="wishlist-stock-note">
                              {stock > 0 ? "Stokta" : "Stok bitince haber verilecek"}
                            </p>
                            <button
                              type="button"
                              className="cart-drawer-remove"
                              onClick={() => removeWishlistItem(item.productId)}
                            >
                              Kaldır
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}

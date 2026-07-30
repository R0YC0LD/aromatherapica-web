"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeDrawer();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      <HeartBursts />
      <button type="button" className="wishlist-dock" onClick={openDrawer} aria-label="İstek listesi">
        <Heart size={16} aria-hidden />
        <span>İSTEK LİSTESİ</span>
        <b>{count}</b>
      </button>

      {alerts.length > 0 ? (
        <div className="wishlist-toast">
          <Bell size={16} aria-hidden />
          <div>
            {alerts.map((msg) => (
              <p key={msg}>{msg}</p>
            ))}
          </div>
          <button type="button" aria-label="Kapat" onClick={() => setAlerts([])}>
            <X size={14} />
          </button>
        </div>
      ) : null}

      {drawerOpen ? (
        <>
          <div className="page-scrim" onClick={closeDrawer} />
          <aside className="wishlist-drawer" aria-label="İstek listesi">
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
                    const img =
                      item.imageUrl && item.imageUrl.startsWith("http")
                        ? item.imageUrl
                        : item.imageUrl
                          ? withBasePath(item.imageUrl)
                          : "";
                    return (
                      <li key={item.productId} className="cart-drawer-item">
                        <Link
                          href={`/urun/${item.slug}`}
                          className="cart-drawer-thumb"
                          onClick={closeDrawer}
                        >
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" />
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
          </aside>
        </>
      ) : null}
    </>
  );
}

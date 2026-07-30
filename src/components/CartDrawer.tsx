"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import {
  getRecommendations,
  type RecommendableProduct,
} from "@/lib/catalog/recommendations";
import { formatCurrency } from "@/lib/format";
import { withBasePath } from "@/lib/paths";
import { orderTotal, shippingCost, shippingProgressMessage } from "@/lib/shipping";

const EASE = [0.22, 1, 0.36, 1] as const;

type CatalogPayload = {
  products: Array<{
    id: number;
    variantId: number | null;
    slug: string;
    name: string;
    categoryId: number | null;
    categoryName: string | null;
    price: number;
    salePrice: number | null;
    stock: number;
    active: boolean;
    imageUrl: string | null;
  }>;
};

function linePrice(item: { price: number; salePrice?: number }) {
  return item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
}

export function CartDrawer() {
  const { cart, count, total, drawerOpen, lastAdded, closeCartDrawer, setQuantity, remove, add } =
    useCart();
  const { settings, mergeProduct } = useCatalogOverrides();
  const [catalog, setCatalog] = useState<RecommendableProduct[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(withBasePath("/data/catalog.json"))
      .then((r) => r.json())
      .then((data: CatalogPayload) => {
        if (cancelled) return;
        setCatalog(
          (data.products || []).map((p) => ({
            id: p.id,
            variantId: p.variantId,
            slug: p.slug,
            name: p.name,
            categoryId: p.categoryId,
            categoryName: p.categoryName,
            price: p.price,
            salePrice: p.salePrice,
            stock: p.stock,
            active: p.active,
            imageUrl: p.imageUrl,
          })),
        );
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("cart-drawer-open", drawerOpen);
    return () => document.body.classList.remove("cart-drawer-open");
  }, [drawerOpen]);

  useEffect(() => {
    if (!drawerOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeCartDrawer();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeCartDrawer]);

  const shippingCfg = {
    threshold: settings.freeShippingThreshold,
    fee: settings.shippingFee,
  };
  const ship = shippingCost(total, shippingCfg);
  const grand = orderTotal(total, shippingCfg);
  const progressNote = shippingProgressMessage(total, shippingCfg);

  const seed = useMemo(() => {
    if (lastAdded) {
      const fromCatalog = catalog.find((p) => p.id === lastAdded.productId);
      return (
        fromCatalog || {
          id: lastAdded.productId,
          variantId: lastAdded.variantId,
          slug: lastAdded.slug,
          name: lastAdded.name,
          categoryId: null,
          categoryName: null,
          price: lastAdded.price,
          salePrice: lastAdded.salePrice ?? null,
          stock: 1,
          active: true,
          imageUrl: lastAdded.imageUrl || null,
        }
      );
    }
    const first = cart.items[0];
    if (!first) return null;
    return catalog.find((p) => p.id === first.productId) || null;
  }, [lastAdded, catalog, cart.items]);

  const recommendations = useMemo(() => {
    const exclude = cart.items.map((i) => i.productId);
    return getRecommendations({
      seed,
      catalog,
      excludeIds: exclude,
      limit: 4,
    });
  }, [seed, catalog, cart.items]);

  function toNormalized(product: RecommendableProduct) {
    const variantId = product.variantId || product.id;
    return mergeProduct({
      id: product.id,
      name: product.name,
      slug: product.slug,
      active: product.active,
      price: product.price,
      salePrice: product.salePrice ?? undefined,
      stock: product.stock,
      categoryId: product.categoryId ?? undefined,
      categoryName: product.categoryName ?? undefined,
      images: product.imageUrl ? [product.imageUrl] : [],
      variants: [
        {
          id: variantId,
          productId: product.id,
          price: product.price,
          salePrice: product.salePrice ?? undefined,
          stock: product.stock,
          active: product.active,
          options: [],
          imageUrl: product.imageUrl || undefined,
        },
      ],
    });
  }

  function addRecommended(product: RecommendableProduct) {
    const merged = toNormalized(product);
    if (merged.stock <= 0) return;
    add(
      {
        productId: merged.id,
        variantId: merged.variants[0]?.id || merged.id,
        slug: merged.slug,
        name: merged.name,
        imageUrl: merged.images[0],
        price: merged.price,
        salePrice: merged.salePrice,
        quantity: 1,
      },
      { openDrawer: true },
    );
  }

  return (
    <>
      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            key="cart-scrim"
            className="page-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCartDrawer}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {drawerOpen ? (
          <motion.aside
            key="cart-drawer"
            className="cart-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.42, ease: EASE }}
            aria-label="Sipariş özeti"
            role="dialog"
            aria-modal="true"
          >
            <div className="cart-header">
              <div>
                <p className="cart-drawer-kicker">Sepetiniz</p>
                <h2>{count > 0 ? `${count} ürün` : "Boş"}</h2>
              </div>
              <button
                className="close-button"
                type="button"
                aria-label="Sepeti kapat"
                onClick={closeCartDrawer}
              >
                <X size={18} />
              </button>
            </div>

            <div className="cart-drawer-body">
              {cart.items.length === 0 ? (
                <div className="cart-drawer-empty">
                  <ShoppingBag size={28} aria-hidden />
                  <p>Sepetiniz henüz boş.</p>
                  <Link href="/kategori/tum-urunler" className="button button-primary" onClick={closeCartDrawer}>
                    Alışverişe başla
                  </Link>
                </div>
              ) : (
                <ul className="cart-drawer-list">
                  {cart.items.map((item) => {
                    const unit = linePrice(item);
                    return (
                      <li key={item.variantId} className="cart-drawer-item">
                        <Link href={`/urun/${item.slug}`} onClick={closeCartDrawer} className="cart-drawer-thumb">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt="" />
                          ) : (
                            <span className="css-product-bottle" aria-hidden />
                          )}
                        </Link>
                        <div className="cart-drawer-item-info">
                          <Link href={`/urun/${item.slug}`} onClick={closeCartDrawer}>
                            {item.name}
                          </Link>
                          <strong>{formatCurrency(unit * item.quantity)}</strong>
                          <div className="cart-drawer-qty">
                            <button
                              type="button"
                              aria-label="Adet azalt"
                              onClick={() =>
                                item.quantity <= 1
                                  ? remove(item.variantId)
                                  : setQuantity(item.variantId, item.quantity - 1)
                              }
                            >
                              <Minus size={14} />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              aria-label="Adet artır"
                              onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                            >
                              <Plus size={14} />
                            </button>
                            <button
                              type="button"
                              className="cart-drawer-remove"
                              onClick={() => remove(item.variantId)}
                            >
                              Kaldır
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              {recommendations.length > 0 ? (
                <section className="cart-recommendations" aria-label="Önerilen ürünler">
                  <div className="cart-rec-head">
                    <p>Aldığınız yağa göre</p>
                    <h3>Bunları da tercih edebilirsiniz</h3>
                  </div>
                  <ul className="cart-rec-list">
                    {recommendations.map(({ product, reason }) => {
                      const merged = toNormalized(product);
                      const price =
                        merged.salePrice && merged.salePrice < merged.price
                          ? merged.salePrice
                          : merged.price;
                      return (
                        <li key={product.id}>
                          <Link
                            href={`/urun/${merged.slug}`}
                            className="cart-rec-thumb"
                            onClick={closeCartDrawer}
                          >
                            {merged.images[0] || product.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={merged.images[0] || product.imageUrl || ""} alt="" />
                            ) : (
                              <span className="css-product-bottle" aria-hidden />
                            )}
                          </Link>
                          <div>
                            <Link href={`/urun/${merged.slug}`} onClick={closeCartDrawer}>
                              {merged.name}
                            </Link>
                            <p>{reason}</p>
                            <div className="cart-rec-row">
                              <strong>{formatCurrency(price)}</strong>
                              <button type="button" onClick={() => addRecommended(product)}>
                                Ekle
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ) : null}
            </div>

            {cart.items.length > 0 ? (
              <div className="cart-footer">
                <div>
                  <span>Ara toplam</span>
                  <strong>{formatCurrency(total)}</strong>
                </div>
                <div>
                  <span>Kargo</span>
                  <strong>{ship === 0 ? "Ücretsiz" : formatCurrency(ship)}</strong>
                </div>
                <div className="cart-footer-total">
                  <span>Toplam</span>
                  <strong>{formatCurrency(grand)}</strong>
                </div>
                <p>{progressNote}</p>
                <Link
                  className="button button-primary"
                  href="/odeme"
                  onClick={closeCartDrawer}
                >
                  Siparişi tamamla
                </Link>
                <Link className="cart-drawer-continue" href="/sepet" onClick={closeCartDrawer}>
                  Sepet sayfasına git
                </Link>
              </div>
            ) : null}
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}

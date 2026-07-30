"use client";

import Link from "next/link";
import { Truck } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import { formatCurrency } from "@/lib/format";
import { getShippingProgress, shippingCost as computeShippingCost } from "@/lib/shipping";

export default function CartPage() {
  const { cart, total, setQuantity, remove } = useCart();
  const { settings } = useCatalogOverrides();
  const shippingConfig = {
    threshold: settings.freeShippingThreshold,
    fee: settings.shippingFee,
  };
  const shipping = computeShippingCost(total, shippingConfig);
  const progress = getShippingProgress(total, shippingConfig);
  const grandTotal = total + shipping;

  return (
    <section className="commerce-page">
      <div className="cart-page-head">
        <p className="eyebrow">Alışveriş</p>
        <h1>Sepetiniz</h1>
      </div>

      {cart.items.length === 0 ? (
        <div className="cart-page-empty">
          <span>♡</span>
          <h2>Sepetiniz boş</h2>
          <p>Ritüelinize başlamak için seçkimize göz atın.</p>
          <Link className="button button-primary" href="/kategori/tum-urunler">
            Alışverişe devam et
          </Link>
        </div>
      ) : (
        <div className="cart-page-layout">
          <div className="cart-page-products">
            <div className={`shipping-progress${progress.qualified || progress.alwaysFree ? " is-complete" : ""}`}>
              <div className="shipping-progress-head">
                <span className="shipping-progress-icon" aria-hidden>
                  <Truck size={13} />
                </span>
                <div>
                  {progress.alwaysFree ? (
                    <>
                      <span>Kargo ücretsiz</span>
                      <strong>Tüm siparişlerde geçerli</strong>
                    </>
                  ) : progress.qualified ? (
                    <>
                      <span>Ücretsiz kargoyu hak ettiniz</span>
                      <strong>Tebrikler</strong>
                    </>
                  ) : (
                    <>
                      <span>Ücretsiz kargoya kalan</span>
                      <strong>{formatCurrency(progress.remaining)}</strong>
                    </>
                  )}
                </div>
              </div>
              <span className="progress-track">
                <i style={{ width: `${Math.round(progress.progress * 100)}%` }} />
                <b className="progress-milestone" aria-hidden />
              </span>
            </div>

            {cart.items.map((item) => {
              const unitPrice = item.salePrice && item.salePrice < item.price ? item.salePrice : item.price;
              return (
                <div className="cart-page-item" key={item.variantId}>
                  <div className="cart-page-visual">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" />
                    ) : (
                      <span className="css-product-bottle" aria-hidden />
                    )}
                  </div>
                  <div className="cart-page-item-info">
                    <p>Aromatherapica</p>
                    <h2>{item.name}</h2>
                    <small>{formatCurrency(unitPrice)} / adet</small>
                    <div className="cart-line-controls">
                      <div className="quantity-control">
                        <button
                          type="button"
                          aria-label="Azalt"
                          onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          aria-label="Artır"
                          onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button type="button" className="remove-line" onClick={() => remove(item.variantId)}>
                        Kaldır
                      </button>
                    </div>
                  </div>
                  <strong>{formatCurrency(unitPrice * item.quantity)}</strong>
                </div>
              );
            })}
          </div>

          <aside className="order-summary">
            <h2>Sipariş Özeti</h2>
            <dl>
              <div>
                <dt>Ara toplam</dt>
                <dd>{formatCurrency(total)}</dd>
              </div>
              <div>
                <dt>Kargo</dt>
                <dd>{shipping === 0 ? "Ücretsiz" : formatCurrency(shipping)}</dd>
              </div>
            </dl>
            <div className="order-total">
              <span>Toplam</span>
              <strong>{formatCurrency(grandTotal)}</strong>
            </div>
            <p>Kart numarası veya CVV bu sitede işlenmez; ödeme adımında Ticimax altyapısı kullanılır.</p>
            <Link className="button button-primary" href="/odeme">
              Siparişi tamamla
            </Link>
            {settings.ticimaxStoreUrl ? (
              <a
                className="button button-secondary"
                href={`${settings.ticimaxStoreUrl.replace(/\/$/, "")}/Sepetim`}
                rel="noreferrer"
              >
                Ticimax sepetinde öde
              </a>
            ) : null}
            <Link href="/kategori/tum-urunler">Alışverişe devam et</Link>
          </aside>
        </div>
      )}
    </section>
  );
}

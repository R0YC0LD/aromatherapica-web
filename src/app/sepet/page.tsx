"use client";

import Link from "next/link";
import { Truck } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatCurrency } from "@/lib/format";
import { getShippingProgress, shippingCost as computeShippingCost } from "@/lib/shipping";

export default function CartPage() {
  const { cart, total, setQuantity, remove } = useCart();
  const progress = getShippingProgress(total);
  const shipping = computeShippingCost(total);
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
            <div className="shipping-progress is-complete">
              <div className="shipping-progress-head">
                <span className="shipping-progress-icon" aria-hidden>
                  <Truck size={13} />
                </span>
                <div>
                  <span>Kargo ücretsiz</span>
                  <strong>Ticimax kargo çeki ile karşılanır</strong>
                </div>
              </div>
              <span className="progress-track">
                <i style={{ width: "100%" }} />
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
            <Link href="/kategori/tum-urunler">Alışverişe devam et</Link>
          </aside>
        </div>
      )}
    </section>
  );
}

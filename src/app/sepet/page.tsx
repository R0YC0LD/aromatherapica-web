"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatCurrency } from "@/lib/format";

export default function CartPage() {
  const { cart, total, setQuantity, remove } = useCart();

  return (
    <section className="section">
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>Sepet</h1>
      {cart.items.length === 0 ? (
        <div className="empty-state">
          Sepetiniz boş. <Link href="/kategori/tum-urunler">Alışverişe devam et</Link>
        </div>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cart.items.map((item) => (
              <li
                key={item.variantId}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 1fr auto",
                  gap: "1rem",
                  padding: "1rem 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div className="product-placeholder" style={{ height: 80 }}>
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    item.name.slice(0, 1)
                  )}
                </div>
                <div>
                  <strong>{item.name}</strong>
                  <p>{formatCurrency(item.salePrice && item.salePrice < item.price ? item.salePrice : item.price)}</p>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <button type="button" className="btn btn-outline" onClick={() => setQuantity(item.variantId, item.quantity - 1)}>
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button type="button" className="btn btn-outline" onClick={() => setQuantity(item.variantId, item.quantity + 1)}>
                      +
                    </button>
                    <button type="button" className="btn btn-outline" onClick={() => remove(item.variantId)}>
                      Sil
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p style={{ fontSize: "1.2rem" }}>
            Toplam: <strong>{formatCurrency(total)}</strong>
          </p>
          <Link className="btn" href="/odeme">
            Siparişi tamamla
          </Link>
        </>
      )}
    </section>
  );
}

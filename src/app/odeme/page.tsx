"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { formatCurrency } from "@/lib/format";
import { freeShippingAnnouncement, orderTotal, shippingCost, shippingProgressMessage } from "@/lib/shipping";

const isStatic = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

export default function CheckoutPage() {
  const { cart, total, clear } = useCart();
  const cargo = shippingCost(total);
  const grand = orderTotal(total);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const idempotencyKey = useMemo(() => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return `order-${Date.now()}`;
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const paymentType = Number(form.get("paymentType"));
    const customerName = String(form.get("name") || "");
    const customerEmail = String(form.get("email") || "");

    // Static GitHub Pages: validate locally from cart stock fields
    if (isStatic) {
      const invalid = cart.items.find((i) => i.quantity <= 0);
      if (invalid) {
        setLoading(false);
        setError("Sepet geçersiz");
        return;
      }

      const order = {
        id: idempotencyKey,
        status: "CREATED",
        paymentStatus: paymentType === 1 ? "AWAITING_TRANSFER" : "PENDING",
        totalAmount: grand,
        shipping: cargo,
        customerEmail,
        customerName,
        createdAt: new Date().toISOString(),
        ticimaxOrderId: null,
        ticimaxOrderCode: null,
        note:
          "GitHub Pages statik yayında sipariş tarayıcıda kaydedildi. Canlı Ticimax aktarımı için Node sunucusu (.env + TICIMAX_*) gerekir.",
        lines: cart.items,
      };

      try {
        localStorage.setItem(`arom_order_${order.id}`, JSON.stringify(order));
        const prev = JSON.parse(localStorage.getItem("arom_orders") || "[]") as unknown[];
        localStorage.setItem("arom_orders", JSON.stringify([order, ...prev].slice(0, 50)));
      } catch {
        /* ignore */
      }

      clear();
      setLoading(false);
      router.push(`/siparis/sonuc/?id=${encodeURIComponent(order.id)}`);
      return;
    }

    const validateRes = await fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lines: cart.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      }),
    });

    const validation = await validateRes.json();
    if (!validateRes.ok || !validation.valid) {
      setLoading(false);
      setError(validation.error || "Stok/fiyat doğrulaması başarısız. Sepeti kontrol edin.");
      return;
    }

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idempotencyKey,
        memberId: Number(form.get("memberId") || 1),
        billingAddressId: Number(form.get("billingAddressId") || 1),
        shippingAddressId: Number(form.get("shippingAddressId") || 1),
        paymentType,
        paymentStatus: 0,
        customerEmail,
        customerName,
        orderNote: String(form.get("note") || ""),
        lines: cart.items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Sipariş oluşturulamadı");
      return;
    }

    try {
      localStorage.setItem(
        `arom_order_${data.orderId}`,
        JSON.stringify({
          id: data.orderId,
          status: data.status,
          paymentStatus: paymentType === 1 ? "AWAITING_TRANSFER" : "PENDING",
          totalAmount: data.totalAmount,
          shipping: data.shipping,
          customerEmail,
          customerName,
          createdAt: new Date().toISOString(),
          ticimaxOrderId: data.ticimaxOrderId,
          ticimaxOrderCode: data.ticimaxOrderCode,
          note: data.warning,
        }),
      );
    } catch {
      /* ignore */
    }

    clear();
    router.push(`/siparis/sonuc/?id=${encodeURIComponent(data.orderId)}`);
  }

  if (cart.items.length === 0) {
    return (
      <section className="section">
        <div className="empty-state">Sepet boş.</div>
      </section>
    );
  }

  return (
    <section className="section">
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>Ödeme</h1>
      <p className="section-lead">
        Kart numarası veya CVV bu sitede işlenmez.
        {isStatic
          ? " Bu yayın GitHub Pages üzerindedir; sipariş tarayıcıda kaydedilir. Canlı Ticimax aktarımı için Node sunucusu kullanın."
          : " Sipariş Ticimax üzerinden oluşturulur."}
        {` ${freeShippingAnnouncement()}.`}
      </p>
      <div
        className="admin-card"
        style={{ background: "rgba(255,255,255,0.55)", color: "var(--ink)", maxWidth: 520 }}
      >
        <p>
          Ara toplam: <strong>{formatCurrency(total)}</strong>
        </p>
        <p>
          Kargo: <strong>{cargo === 0 ? "Ücretsiz" : formatCurrency(cargo)}</strong>
        </p>
        <p>
          Genel toplam: <strong>{formatCurrency(grand)}</strong>
        </p>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{shippingProgressMessage(total)}</p>
      </div>

      <form onSubmit={onSubmit} style={{ maxWidth: 520 }}>
        <div className="form-field">
          <label htmlFor="name">Ad Soyad</label>
          <input id="name" name="name" required />
        </div>
        <div className="form-field">
          <label htmlFor="email">E-posta</label>
          <input id="email" name="email" type="email" required />
        </div>
        {!isStatic ? (
          <>
            <div className="form-field">
              <label htmlFor="memberId">Ticimax Üye ID</label>
              <input id="memberId" name="memberId" type="number" required min={1} />
            </div>
            <div className="form-field">
              <label htmlFor="billingAddressId">Fatura Adres ID</label>
              <input id="billingAddressId" name="billingAddressId" type="number" required min={1} />
            </div>
            <div className="form-field">
              <label htmlFor="shippingAddressId">Kargo Adres ID</label>
              <input id="shippingAddressId" name="shippingAddressId" type="number" required min={1} />
            </div>
          </>
        ) : (
          <div className="form-field">
            <label htmlFor="phone">Telefon</label>
            <input id="phone" name="phone" required />
          </div>
        )}
        <div className="form-field">
          <label htmlFor="paymentType">Ödeme tipi</label>
          <select id="paymentType" name="paymentType" defaultValue="1">
            <option value="1">Havale / EFT</option>
            <option value="2">Kapıda Ödeme (Nakit)</option>
            <option value="3">Kapıda Ödeme (Kredi Kartı — Ticimax tarafı)</option>
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="note">Sipariş notu</label>
          <textarea id="note" name="note" rows={3} />
        </div>
        {error ? <p style={{ color: "var(--clay)" }}>{error}</p> : null}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? "Gönderiliyor…" : "Siparişi oluştur"}
        </button>
      </form>
    </section>
  );
}

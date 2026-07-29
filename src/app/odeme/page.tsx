"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { formatCurrency } from "@/lib/format";

export default function CheckoutPage() {
  const { cart, total, clear } = useCart();
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
        memberId: Number(form.get("memberId")),
        billingAddressId: Number(form.get("billingAddressId")),
        shippingAddressId: Number(form.get("shippingAddressId")),
        paymentType,
        paymentStatus: paymentType === 1 ? 0 : 0,
        customerEmail: String(form.get("email")),
        customerName: String(form.get("name")),
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

    clear();
    router.push(`/siparis/${data.orderId}`);
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
        Kart numarası veya CVV bu sitede işlenmez. Ticimax dokümanındaki Havale / Kapıda Ödeme tipleri kullanılır.
      </p>
      <p>
        Sipariş tutarı: <strong>{formatCurrency(total)}</strong>
      </p>

      <form onSubmit={onSubmit} style={{ maxWidth: 520 }}>
        <div className="form-field">
          <label htmlFor="name">Ad Soyad</label>
          <input id="name" name="name" required />
        </div>
        <div className="form-field">
          <label htmlFor="email">E-posta</label>
          <input id="email" name="email" type="email" required />
        </div>
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

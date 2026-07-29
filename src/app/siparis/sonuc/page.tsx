"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { formatCurrency, formatDate } from "@/lib/format";

type LocalOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  customerEmail?: string;
  customerName?: string;
  ticimaxOrderId?: number | null;
  ticimaxOrderCode?: string | null;
  createdAt: string;
  shipping?: number;
  note?: string;
};

function OrderResultInner() {
  const search = useSearchParams();
  const id = search.get("id");
  const [order, setOrder] = useState<LocalOrder | null>(null);

  useEffect(() => {
    try {
      if (id) {
        const raw = localStorage.getItem(`arom_order_${id}`);
        if (raw) {
          setOrder(JSON.parse(raw) as LocalOrder);
          return;
        }
      }
      const list = JSON.parse(localStorage.getItem("arom_orders") || "[]") as LocalOrder[];
      setOrder(list[0] || null);
    } catch {
      setOrder(null);
    }
  }, [id]);

  if (!order) {
    return (
      <section className="section">
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>Sipariş bulunamadı</h1>
        <p className="section-lead">Bu sipariş kaydı bu tarayıcıda bulunamadı.</p>
        <Link className="btn" href="/">
          Ana sayfa
        </Link>
      </section>
    );
  }

  return (
    <section className="section">
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>Sipariş alındı</h1>
      <p>
        Sipariş no: <strong>{order.id}</strong>
      </p>
      {order.ticimaxOrderCode ? (
        <p>
          Ticimax sipariş kodu: <strong>{order.ticimaxOrderCode}</strong>
        </p>
      ) : null}
      <p>Durum: {order.status}</p>
      <p>Ödeme: {order.paymentStatus}</p>
      <p>Tutar: {formatCurrency(order.totalAmount)}</p>
      <p>Tarih: {formatDate(order.createdAt)}</p>
      {order.note ? <p style={{ color: "var(--muted)" }}>{order.note}</p> : null}
      <Link className="btn" href="/kategori/tum-urunler/" style={{ marginTop: "1rem" }}>
        Alışverişe devam
      </Link>
    </section>
  );
}

export default function OrderResultPage() {
  return (
    <Suspense fallback={<section className="section">Yükleniyor…</section>}>
      <OrderResultInner />
    </Suspense>
  );
}

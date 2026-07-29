"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/format";

interface DashboardData {
  connection: { ok: boolean; message: string; durationMs?: number };
  lastSyncAt: string | null;
  totals: { products: number; activeProducts: number; outOfStock: number; orders: number };
  orderStatusDistribution: Array<{ status: string; count: number }>;
  recentOrders: Array<{ id: string; status: string; totalAmount: number; createdAt: string; customerEmail: string }>;
  recentErrors: Array<{ id: string; message: string; entityType: string; createdAt: string }>;
  config: { baseUrl: string; uyeKodu: string; alanAdi: string };
}

export function AdminDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(async (res) => {
        if (!res.ok) throw new Error("Dashboard yüklenemedi");
        setData(await res.json());
      })
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p style={{ color: "#f0a0a0" }}>{error}</p>;
  if (!data) return <p>Yükleniyor…</p>;

  return (
    <>
      <div className="admin-card">
        <h2>Ticimax bağlantısı</h2>
        <p>{data.connection.ok ? "Bağlı" : "Bağlantı yok"} — {data.connection.message}</p>
        <p>Son senkronizasyon: {data.lastSyncAt ? formatDate(data.lastSyncAt) : "—"}</p>
        <p>Base URL: {data.config.baseUrl}</p>
        <p>Üye kodu: {data.config.uyeKodu}</p>
      </div>

      <div className="admin-card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: "1rem" }}>
        <div><strong>{data.totals.products}</strong><br />Toplam ürün</div>
        <div><strong>{data.totals.activeProducts}</strong><br />Aktif</div>
        <div><strong>{data.totals.outOfStock}</strong><br />Stok tükenen</div>
        <div><strong>{data.totals.orders}</strong><br />Yerel sipariş</div>
      </div>

      <div className="admin-card">
        <h2>Sipariş durumları</h2>
        <ul>
          {data.orderStatusDistribution.map((s) => (
            <li key={s.status}>{s.status}: {s.count}</li>
          ))}
        </ul>
      </div>

      <div className="admin-card">
        <h2>Son siparişler</h2>
        <table className="table">
          <thead>
            <tr><th>ID</th><th>E-posta</th><th>Tutar</th><th>Durum</th><th>Tarih</th></tr>
          </thead>
          <tbody>
            {data.recentOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.id.slice(0, 8)}</td>
                <td>{o.customerEmail}</td>
                <td>{formatCurrency(o.totalAmount)}</td>
                <td>{o.status}</td>
                <td>{formatDate(o.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-card">
        <h2>Entegrasyon hataları</h2>
        {data.recentErrors.length === 0 ? <p>Hata yok</p> : (
          <ul>
            {data.recentErrors.map((e) => (
              <li key={e.id}>{e.entityType}: {e.message}</li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

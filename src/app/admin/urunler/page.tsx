"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatCurrency, formatDate } from "@/lib/format";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Array<{
    id: number; name: string; price: number; salePrice: number | null; stock: number; active: boolean; syncedAt: string;
  }>>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const url = q ? `/api/admin/products?q=${encodeURIComponent(q)}` : "/api/admin/products";
    fetch(url).then((r) => r.json()).then((d) => setProducts(d.data || []));
  }, [q]);

  return (
    <AdminShell title="Ürünler">
      <p style={{ color: "#9fb4d0" }}>Ürünler Ticimax&apos;tan senkronize edilir. Düzenleme API desteklemiyorsa salt okunurdur.</p>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Ara…"
        style={{ marginBottom: "1rem", padding: "0.7rem", width: "100%", maxWidth: 360 }}
      />
      <div className="admin-card">
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Ad</th><th>Fiyat</th><th>Stok</th><th>Aktif</th><th>Sync</th></tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{formatCurrency(p.salePrice ?? p.price)}</td>
                <td>{p.stock}</td>
                <td>{p.active ? "Evet" : "Hayır"}</td>
                <td>{formatDate(p.syncedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

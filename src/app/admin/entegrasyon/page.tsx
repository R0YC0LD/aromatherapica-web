"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminIntegrationPage() {
  const [csrf, setCsrf] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((d) => {
        if (d.csrfToken) {
          setCsrf(d.csrfToken);
          sessionStorage.setItem("admin_csrf", d.csrfToken);
        }
      });
  }, []);

  async function testConnection() {
    setLoading(true);
    const res = await fetch("/api/admin/integration/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csrfToken: csrf || "bootstrap" }),
    });
    const data = await res.json();
    setMessage(data.message || data.error || JSON.stringify(data));
    setLoading(false);
  }

  async function sync(type: "products" | "orders") {
    setLoading(true);
    const res = await fetch("/api/admin/integration/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csrfToken: csrf || "bootstrap", type }),
    });
    const data = await res.json();
    setMessage(data.message || data.error || JSON.stringify(data));
    setLoading(false);
  }

  return (
    <AdminShell title="Entegrasyon">
      <div className="admin-card">
        <p>API anahtarları maskeli gösterilir; açık metin olarak panelde yer almaz.</p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button className="btn" type="button" disabled={loading} onClick={testConnection}>Bağlantı testi</button>
          <button className="btn" type="button" disabled={loading} onClick={() => sync("products")}>Ürün sync</button>
          <button className="btn" type="button" disabled={loading} onClick={() => sync("orders")}>Sipariş sync</button>
        </div>
        {message ? <pre style={{ marginTop: "1rem", whiteSpace: "pre-wrap" }}>{message}</pre> : null}
      </div>
    </AdminShell>
  );
}

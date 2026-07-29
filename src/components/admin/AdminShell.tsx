"use client";

import Link from "next/link";

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <main>
        <nav className="admin-nav">
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/urunler">Ürünler</Link>
          <Link href="/admin/siparisler">Siparişler</Link>
          <Link href="/admin/entegrasyon">Entegrasyon</Link>
          <Link href="/admin/sifre-degistir">Şifre</Link>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: "0.35rem 0.8rem", fontSize: "0.85rem" }}
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              window.location.href = "/admin/login";
            }}
          >
            Çıkış
          </button>
        </nav>
        <h1>{title}</h1>
        {children}
      </main>
    </div>
  );
}

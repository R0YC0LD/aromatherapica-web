"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Plug,
  KeyRound,
  LogOut,
  Leaf,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/urunler", label: "Ürünler", icon: Package },
  { href: "/admin/siparisler", label: "Siparişler", icon: ShoppingBag },
  { href: "/admin/entegrasyon", label: "Entegrasyon", icon: Plug },
  { href: "/admin/sifre-degistir", label: "Şifre", icon: KeyRound },
];

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Leaf size={18} strokeWidth={1.5} />
          <div>
            <strong>Aromatherapica</strong>
            <span>Yönetim</span>
          </div>
        </div>
        <nav className="admin-side-nav">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="admin-nav-link">
                <Icon size={18} strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            className="admin-nav-link logout"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              window.location.href = "/admin/login";
            }}
          >
            <LogOut size={18} strokeWidth={1.5} />
            Çıkış
          </button>
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <h1>{title}</h1>
          <Link href="/" className="admin-store-link">
            Mağazayı gör
          </Link>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}

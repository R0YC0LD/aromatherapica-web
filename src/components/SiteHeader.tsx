import Link from "next/link";
import { SecretLogo } from "@/components/SecretLogo";
import { CartBadge } from "@/components/CartBadge";

const NAV = [
  { href: "/kategori/ucucu-yaglar", label: "Uçucu Yağlar" },
  { href: "/kategori/cilt-bakimi", label: "Cilt Bakımı" },
  { href: "/kategori/ozel-bakim", label: "Özel Bakım" },
  { href: "/kategori/sac-bakimi", label: "Saç Bakımı" },
  { href: "/kategori/vucut-bakimi", label: "Vücut Bakımı" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="announcement">
        <span>1.000 TL üzeri ücretsiz kargo</span>
        <span>Doğadan gelen bakım ritüelleri</span>
      </div>
      <div className="header-main">
        <SecretLogo href="/" className="wordmark">
          <span className="brand-mark" aria-hidden>
            A
          </span>
          <span className="brand-text">
            <strong>Aromatherapica</strong>
            <em>Essential Oils &amp; Aromatherapy</em>
          </span>
        </SecretLogo>
        <nav className="main-nav" aria-label="Ana menü">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/hesap" className="icon-link">
            Hesabım
          </Link>
          <Link href="/sepet" className="icon-link cart-link">
            Sepet <CartBadge />
          </Link>
        </div>
      </div>
    </header>
  );
}

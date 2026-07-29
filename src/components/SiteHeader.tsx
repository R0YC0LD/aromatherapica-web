"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { SecretLogo } from "@/components/SecretLogo";
import { CartBadge } from "@/components/CartBadge";
import { freeShippingAnnouncement } from "@/lib/shipping";
import { withBasePath } from "@/lib/paths";

const EASE = [0.22, 1, 0.36, 1] as const;

const MAIN_NAV = [
  { href: "/kategori/ucucu-yaglar", label: "Aromaterapi" },
  { href: "/kategori/ozel-bakim", label: "Özel Bakım" },
  { href: "/kategori/cilt-bakimi", label: "Cilt Bakımı" },
  { href: "/icerik/markamiz", label: "Markamız" },
];

const CATEGORY_NAV = [
  { href: "/kategori/ucucu-yaglar", label: "Uçucu Yağlar" },
  { href: "/kategori/cilt-bakimi", label: "Cilt Bakımı" },
  { href: "/kategori/ozel-bakim", label: "Özel Bakım" },
  { href: "/kategori/sac-bakimi", label: "Saç Bakımı" },
  { href: "/kategori/vucut-bakimi", label: "Vücut Bakımı" },
  { href: "/kategori/gul-sulari", label: "Gül Suları" },
  { href: "/kategori/dogal-sabunlar", label: "Doğal Sabunlar" },
  { href: "/kategori/hediye-secenekleri", label: "Hediye Seçenekleri" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [query, setQuery] = useState("");
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 8);
      setHidden(y > lastY.current && y > 160);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("panel-open", menuOpen || searchOpen);
    return () => document.body.classList.remove("panel-open");
  }, [menuOpen, searchOpen]);

  function closePanels() {
    setMenuOpen(false);
    setSearchOpen(false);
  }

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    setSearchOpen(false);
    router.push(q ? `/kategori/tum-urunler?q=${encodeURIComponent(q)}` : "/kategori/tum-urunler");
  }

  return (
    <>
      <a className="skip-link" href="#main">
        İçeriğe geç
      </a>

      <div className="announcement-bar">
        <Link href="/kategori/tum-urunler">
          Seçili ürünlerde avantajlı fiyatlar <span>→</span>
        </Link>
        <Link href="/kategori/ucucu-yaglar">
          Saf aromaterapi yağlarını keşfedin <span>→</span>
        </Link>
        <Link href="/sepet">
          {freeShippingAnnouncement()} <span>→</span>
        </Link>
      </div>

      <header className={`site-header${scrolled ? " is-scrolled" : ""}${hidden ? " is-hidden" : ""}`}>
        <div className="header-main">
          <div className="header-mobile-tools">
            <button
              className="icon-button menu-button"
              type="button"
              aria-label="Menüyü aç"
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <button
              className="icon-button search-button"
              type="button"
              aria-label="Arama yap"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={19} />
            </button>
          </div>

          <SecretLogo href="/" className="wordmark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand-mark-image" src={withBasePath("/aromatherapica-emblem.png")} width={46} height={46} alt="" />
            <strong>Aromatherapica</strong>
            <span>Essential Oils &amp; Aromatherapy</span>
          </SecretLogo>

          <div className="header-actions">
            <button
              className="icon-button desktop-search"
              type="button"
              aria-label="Arama yap"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={19} />
            </button>
            <Link href="/hesap" className="icon-button account-button" aria-label="Hesabım">
              <User size={19} />
            </Link>
            <Link href="/sepet" className="icon-button" aria-label="Sepeti görüntüle">
              <ShoppingBag size={19} />
              <CartBadge />
            </Link>
          </div>
        </div>

        <nav className="main-nav" aria-label="Ana menü">
          {MAIN_NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <nav className="category-nav" aria-label="Ürün kategorileri">
          {CATEGORY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "is-active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <AnimatePresence>
        {(menuOpen || searchOpen) && (
          <motion.div
            className="page-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closePanels}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.aside
            className="mobile-drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.45, ease: EASE }}
            aria-label="Mobil menü"
          >
            <div className="drawer-header">
              <SecretLogo href="/" className="wordmark">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="brand-mark-image" src={withBasePath("/aromatherapica-emblem.png")} width={40} height={40} alt="" />
                <strong>Aromatherapica</strong>
                <span>Essential Oils &amp; Aromatherapy</span>
              </SecretLogo>
              <button
                className="icon-button close-button"
                type="button"
                aria-label="Menüyü kapat"
                onClick={() => setMenuOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <nav>
              {CATEGORY_NAV.slice(0, 5).map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
                  <span>{item.label}</span>
                  <b>→</b>
                </Link>
              ))}
            </nav>
            <div className="drawer-promo">
              <p>Ritüelinize özel</p>
              <strong>İlk siparişinize %15 indirim</strong>
              <Link href="/kategori/tum-urunler" onClick={() => setMenuOpen(false)}>
                Seçkiyi keşfet
              </Link>
            </div>
            <div className="drawer-footer">
              <Link href="/hesap" onClick={() => setMenuOpen(false)}>
                Hesabım
              </Link>
              <Link href="/icerik/iletisim" onClick={() => setMenuOpen(false)}>
                Bize Ulaşın
              </Link>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="search-panel"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.35, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="Ürün ara"
          >
            <div className="search-inner">
              <div className="panel-header">
                <div>
                  <p>Aromatherapica seçkisinde</p>
                  <h2>Ne arıyorsunuz?</h2>
                </div>
                <button
                  className="close-button"
                  type="button"
                  aria-label="Aramayı kapat"
                  onClick={() => setSearchOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <form className="search-field" onSubmit={onSearchSubmit}>
                <Search size={20} aria-hidden />
                <input
                  type="search"
                  placeholder="Ürün veya içerik ara"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  autoFocus
                />
              </form>
              <p className="search-empty">Aramanızı yazıp Enter’a basın, tüm ürünler içinde arayalım.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

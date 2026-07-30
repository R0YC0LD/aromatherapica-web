"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ShoppingBag, User, X, Heart } from "lucide-react";
import { SecretLogo } from "@/components/SecretLogo";
import { CartBadge } from "@/components/CartBadge";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import { productHref } from "@/lib/cms/product-href";
import { STORE_NAV_CATEGORIES } from "@/lib/cms/category-map";
import { searchProducts, type SearchHit } from "@/lib/search/query";
import { freeShippingAnnouncement } from "@/lib/shipping";
import { withBasePath } from "@/lib/paths";

const EASE = [0.22, 1, 0.36, 1] as const;

const MAIN_NAV = [
  { href: "/kategori/ucucu-yaglar", label: "Aromaterapi" },
  { href: "/kategori/ozel-bakim", label: "Özel Bakım" },
  { href: "/kategori/cilt-bakimi", label: "Cilt Bakımı" },
  { href: "/icerik/markamiz", label: "Markamız" },
];

const CATEGORY_NAV = STORE_NAV_CATEGORIES.map((c) => ({ ...c }));

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, catalog, mergeProduct } = useCatalogOverrides();
  const { openCartDrawer, drawerOpen } = useCart();
  const { openDrawer: openWishlist, toggle: toggleWish, has: hasWish } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [query, setQuery] = useState("");
  const [submitNotice, setSubmitNotice] = useState<string | null>(null);
  const lastY = useRef(0);
  const logoSrc = settings.logoUrl?.startsWith("data:")
    ? settings.logoUrl
    : withBasePath(settings.logoUrl || "/aromatherapica-emblem.png");

  const searchable = useMemo(() => {
    const source = catalog.length
      ? catalog.map(mergeProduct)
      : [];
    return source
      .filter((p) => p.active)
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        categoryName: p.categoryName,
        shortDesc: p.seoDescription,
        imageUrl: p.images[0] || null,
        price: p.price,
        salePrice: p.salePrice ?? null,
        stock: p.stock,
        active: p.active,
      }));
  }, [catalog, mergeProduct]);

  const liveSearch = useMemo(() => {
    const q = query.trim();
    if (!q) return null;
    return searchProducts(searchable, q, { limit: 8, fuzzy: false });
  }, [query, searchable]);

  const bestsellers = useMemo(() => {
    const ids = String(settings.searchBestsellerIds || settings.featuredProductIds || "")
      .split(/[,\s]+/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    const all = searchable;
    const picked = ids.length
      ? ids.map((id) => all.find((p) => p.id === id)).filter(Boolean)
      : all.slice(0, 4);
    return picked as typeof searchable;
  }, [searchable, settings.searchBestsellerIds, settings.featuredProductIds]);

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
    document.body.classList.toggle("panel-open", menuOpen || searchOpen || drawerOpen);
    return () => document.body.classList.remove("panel-open");
  }, [menuOpen, searchOpen, drawerOpen]);

  useEffect(() => {
    if (!searchOpen) {
      setQuery("");
      setSubmitNotice(null);
    }
  }, [searchOpen]);

  function closePanels() {
    setMenuOpen(false);
    setSearchOpen(false);
  }

  function onSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    if (!q) {
      setSearchOpen(false);
      router.push("/kategori/tum-urunler");
      return;
    }

    const result = searchProducts(searchable, q, { limit: 24, fuzzy: true });
    if (result.mode === "empty") {
      setSubmitNotice(result.message || "Böyle bir ürün bulunamamaktadır.");
      return;
    }

    setSearchOpen(false);
    router.push(`/kategori/tum-urunler?q=${encodeURIComponent(q)}`);
  }

  function renderHit(hit: SearchHit) {
    return (
      <Link
        key={hit.id}
        href={productHref(hit.slug, hit.id)}
        className="search-suggest-item"
        onClick={() => setSearchOpen(false)}
      >
        {hit.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={hit.imageUrl} alt="" />
        ) : (
          <span className="css-product-bottle" aria-hidden />
        )}
        <span>
          <strong>{hit.name}</strong>
          {hit.categoryName ? <em>{hit.categoryName}</em> : null}
        </span>
      </Link>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main">
        İçeriğe geç
      </a>

      <div className="announcement-bar">
        <Link href={settings.announcementHref || "/kategori/ucucu-yaglar"}>
          {settings.announcementText || "Saf aromaterapi yağlarını keşfedin →"}
        </Link>
        <Link href="/sepet">
          {freeShippingAnnouncement({
            threshold: settings.freeShippingThreshold,
            fee: settings.shippingFee,
          })}{" "}
          <span>→</span>
        </Link>
      </div>

      <header className={`site-header${scrolled ? " is-scrolled" : ""}${hidden ? " is-hidden" : ""}`}>
        <div className="header-main">
          <div className="header-left">
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

            <nav className="main-nav" aria-label="Ana menü">
              {MAIN_NAV.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <SecretLogo href="/" className="wordmark">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand-mark-image" src={logoSrc} width={46} height={46} alt="" />
            <strong>{settings.siteName || "Aromatherapica"}</strong>
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
            <button
              type="button"
              className="icon-button"
              aria-label="İstek listesi"
              onClick={openWishlist}
            >
              <Heart size={19} />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label="Sepeti görüntüle"
              onClick={openCartDrawer}
            >
              <ShoppingBag size={19} />
              <CartBadge />
            </button>
          </div>
        </div>

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
                <img className="brand-mark-image" src={logoSrc} width={40} height={40} alt="" />
                <strong>{settings.siteName || "Aromatherapica"}</strong>
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
            <div className="search-inner search-inner-nyr">
              <form className="search-field search-field-pill" onSubmit={onSearchSubmit}>
                <Search size={20} aria-hidden />
                <input
                  type="search"
                  placeholder="Ürün ara…"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSubmitNotice(null);
                  }}
                  autoFocus
                  autoComplete="off"
                  aria-autocomplete="list"
                  aria-controls="search-live-results"
                />
                <button type="submit" className="search-submit-btn">
                  Ara
                </button>
                <button
                  className="close-button"
                  type="button"
                  aria-label="Aramayı kapat"
                  onClick={() => setSearchOpen(false)}
                >
                  <X size={18} />
                </button>
              </form>

              {query.trim() ? (
                <div id="search-live-results" className="search-suggest" role="listbox">
                  {liveSearch && liveSearch.hits.length > 0 ? (
                    liveSearch.hits.map(renderHit)
                  ) : (
                    <p className="search-suggest-empty">Eşleşen ürün yazıldıkça burada görünür.</p>
                  )}
                  {submitNotice ? <p className="search-suggest-warn">{submitNotice}</p> : null}
                </div>
              ) : (
                <>
                  <h3 className="search-bestsellers-title">
                    {settings.searchBestsellersTitle || "ÇOK SATANLAR…"}
                  </h3>
                  <div className="search-bestsellers">
                    {bestsellers.map((p) => (
                      <article key={p.id} className="search-bestseller-card">
                        <Link
                          href={productHref(p.slug, p.id)}
                          onClick={() => setSearchOpen(false)}
                        >
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.imageUrl} alt="" />
                          ) : (
                            <span className="css-product-bottle" aria-hidden />
                          )}
                          <strong>{p.name}</strong>
                        </Link>
                        <button
                          type="button"
                          className={`favorite-button${hasWish(p.id) ? " is-active" : ""}`}
                          aria-label="Favorilere ekle"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            toggleWish(
                              {
                                productId: p.id,
                                slug: p.slug,
                                name: p.name,
                                imageUrl: p.imageUrl || undefined,
                                price: p.price,
                                salePrice: p.salePrice || undefined,
                                stock: p.stock,
                              },
                              { x: rect.left + rect.width / 2, y: rect.top },
                            );
                          }}
                        >
                          <Heart size={16} />
                        </button>
                      </article>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

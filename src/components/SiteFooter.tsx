"use client";

import Link from "next/link";
import { Camera, Pin, PlayCircle } from "lucide-react";
import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import { withBasePath } from "@/lib/paths";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const { settings } = useCatalogOverrides();
  const logoSrc = settings.logoUrl?.startsWith("data:")
    ? settings.logoUrl
    : withBasePath(settings.logoUrl || "/aromatherapica-emblem.png");

  return (
    <footer className="site-footer site-footer-nyr">
      <div className="footer-columns">
        <div>
          <h2>HAKKIMIZDA</h2>
          <Link href="/icerik/markamiz">Markamız</Link>
          <Link href="/icerik/markamiz">Sürdürülebilirlik</Link>
          <Link href="/kategori/ucucu-yaglar">İçeriklerimiz</Link>
          <Link href="/icerik/iletisim">Mağaza bul</Link>
          <Link href="/icerik/iletisim">Kurumsal hediyeler</Link>
        </div>
        <div>
          <h2>MÜŞTERİ HİZMETLERİ</h2>
          <Link href="/icerik/iletisim">Bize ulaşın</Link>
          <Link href="/hesap">Sadakat / üyelik</Link>
          <Link href="/kategori/tum-urunler">Kampanyalar</Link>
          <Link href="/icerik/teslimat">Teslimat seçenekleri</Link>
          <Link href="/icerik/iade">İade ve değişim</Link>
        </div>
        <div>
          <h2>YASAL</h2>
          <Link href="/icerik/mesafeli-satis">Şartlar ve koşullar</Link>
          <Link href="/icerik/gizlilik">Gizlilik politikası</Link>
          <Link href="/icerik/kvkk">KVKK / Çerezler</Link>
          <Link href="/icerik/mesafeli-satis">Mesafeli satış</Link>
          <Link href="/icerik/iletisim">Erişilebilirlik</Link>
        </div>
      </div>

      <div className="footer-social-row">
        <div className="footer-brand-inline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={36} height={36} alt="" />
          <p>{settings.footerAbout || settings.siteName}</p>
        </div>
        <div className="social-links" aria-label="Sosyal medya">
          <a href={settings.footerInstagram || "#instagram"} aria-label="Instagram">
            <Camera aria-hidden />
          </a>
          <a href={settings.footerPinterest || "#pinterest"} aria-label="Pinterest">
            <Pin aria-hidden />
          </a>
          <a href={settings.footerYoutube || "#youtube"} aria-label="YouTube">
            <PlayCircle aria-hidden />
          </a>
        </div>
      </div>

      <div className="payment-marks payment-marks-wide" aria-label="Ödeme yöntemleri">
        <b>VISA</b>
        <b>MC</b>
        <b>TROY</b>
        <b>AMEX</b>
        <b>PayPal</b>
        <b>Apple Pay</b>
        <b>Google Pay</b>
      </div>

      <div className="footer-bottom footer-bottom-nyr">
        <p>© {year} {settings.siteName || "Aromatherapica"}. Tüm hakları saklıdır.</p>
        <div>
          <Link href="/icerik/mesafeli-satis">Kullanım Koşulları</Link>
          <Link href="/icerik/gizlilik">Gizlilik</Link>
          <Link href="/icerik/kvkk">Çerezler</Link>
        </div>
      </div>
    </footer>
  );
}

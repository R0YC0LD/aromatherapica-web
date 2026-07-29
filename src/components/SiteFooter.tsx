import Link from "next/link";
import { Camera, Leaf, PackageCheck, Pin, PlayCircle, ShieldCheck } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Link className="wordmark wordmark-light" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="brand-mark-image" src="/aromatherapica-emblem.png" width={46} height={46} alt="" loading="lazy" />
            <strong>Aromatherapica</strong>
            <span>Essential Oils &amp; Aromatherapy</span>
          </Link>
          <p>
            Doğanın bilgisini modern bakım ritüelleriyle buluşturan, özenli ve duyusal Aromatherapica
            dünyası.
          </p>
          <div className="social-links" aria-label="Sosyal medya bağlantıları">
            <a href="#instagram" aria-label="Instagram">
              <Camera aria-hidden />
            </a>
            <a href="#pinterest" aria-label="Pinterest">
              <Pin aria-hidden />
            </a>
            <a href="#youtube" aria-label="YouTube">
              <PlayCircle aria-hidden />
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div>
            <h2>Yardım</h2>
            <Link href="/icerik/iletisim">Müşteri Hizmetleri</Link>
            <Link href="/icerik/teslimat">Kargo ve Teslimat</Link>
            <Link href="/icerik/iade">İade ve Değişim</Link>
            <Link href="/icerik/mesafeli-satis">Mesafeli Satış Sözleşmesi</Link>
          </div>
          <div>
            <h2>Hesabım</h2>
            <Link href="/hesap">Üyelik</Link>
            <Link href="/hesap">Siparişlerim</Link>
            <Link href="/sepet">Sepetim</Link>
            <Link href="/icerik/kvkk">KVKK</Link>
          </div>
          <div>
            <h2>Aromatherapica</h2>
            <Link href="/icerik/markamiz">Markamız</Link>
            <Link href="/kategori/tum-urunler">Tüm Ürünler</Link>
            <Link href="/icerik/gizlilik">Gizlilik Politikası</Link>
            <Link href="/icerik/iletisim">Bize Ulaşın</Link>
          </div>
        </div>
      </div>

      <div className="footer-assurances">
        <span>
          <ShieldCheck aria-hidden /> Güvenli ödeme
        </span>
        <span>
          <PackageCheck aria-hidden /> Özenli paketleme
        </span>
        <span>
          <Leaf aria-hidden /> Bitkisel içerikler
        </span>
      </div>

      <div className="footer-bottom">
        <p>© {year} Aromatherapica. Tüm hakları saklıdır.</p>
        <div>
          <Link href="/icerik/mesafeli-satis">Kullanım Koşulları</Link>
          <Link href="/icerik/gizlilik">Gizlilik</Link>
          <Link href="/icerik/kvkk">Çerezler</Link>
        </div>
        <div className="payment-marks" aria-label="Ödeme yöntemleri">
          <b>VISA</b>
          <b>MC</b>
          <b>TROY</b>
        </div>
      </div>
    </footer>
  );
}

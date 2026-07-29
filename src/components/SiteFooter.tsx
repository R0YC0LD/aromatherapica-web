import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <strong>Aromatherapica</strong>
          <p>Doğanın bilgisinden modern bakım ritüellerine.</p>
        </div>
        <div>
          <h3>Yardım</h3>
          <Link href="/icerik/teslimat">Teslimat</Link>
          <Link href="/icerik/iade">İade</Link>
          <Link href="/icerik/iletisim">İletişim</Link>
        </div>
        <div>
          <h3>Politikalar</h3>
          <Link href="/icerik/kvkk">KVKK</Link>
          <Link href="/icerik/gizlilik">Gizlilik</Link>
          <Link href="/icerik/mesafeli-satis">Mesafeli Satış</Link>
        </div>
      </div>
      <p className="footer-copy">© {new Date().getFullYear()} Aromatherapica</p>
    </footer>
  );
}

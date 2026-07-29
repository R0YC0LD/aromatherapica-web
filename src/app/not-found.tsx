import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400 }}>Sayfa bulunamadı</h1>
      <p className="section-lead">Aradığınız içerik mevcut değil veya taşınmış olabilir.</p>
      <Link className="btn" href="/">
        Ana sayfaya dön
      </Link>
    </section>
  );
}

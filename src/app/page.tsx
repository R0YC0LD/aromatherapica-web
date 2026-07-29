import Link from "next/link";
import { getProducts } from "@/lib/catalog/service";
import { ProductCard } from "@/components/ProductCard";

export default async function HomePage() {
  const { data: products, message, configured } = await getProducts({ pageSize: 8, sort: "newest" });

  return (
    <>
      <section className="hero">
        <div>
          <p style={{ letterSpacing: "0.12em", textTransform: "uppercase", fontSize: "0.75rem", color: "var(--gold)" }}>
            Aromatherapica
          </p>
          <h1>Doğadan gelen bakım ritüelleri</h1>
          <p>
            Saf uçucu yağlar ve özenli formüller. Stok, fiyat ve siparişler Ticimax üzerinden yönetilir.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.25rem" }}>
            <Link className="btn" href="/kategori/tum-urunler">
              Ürünleri keşfet
            </Link>
            <Link className="btn btn-outline" href="/icerik/markamiz">
              Markamız
            </Link>
          </div>
        </div>
        <div aria-hidden className="product-placeholder" style={{ minHeight: 280, border: "1px solid var(--line)" }}>
          A
        </div>
      </section>

      <section className="section">
        <h2>Seçili ürünler</h2>
        <p className="section-lead">Güncel stok ve fiyat bilgisi Ticimax kaynağından gelir.</p>

        {!configured || products.length === 0 ? (
          <div className="empty-state">
            <p>
              {message ||
                "Henüz ürün listelenemiyor. Ticimax bağlantısını yapılandırıp admin panelinden senkronizasyon çalıştırın."}
            </p>
            <Link className="btn" href="/admin/login" style={{ marginTop: "1rem" }}>
              Admin paneli
            </Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

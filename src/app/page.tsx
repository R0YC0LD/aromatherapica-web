import Link from "next/link";
import { Leaf, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { getProducts } from "@/lib/catalog/service";
import { ProductCard } from "@/components/ProductCard";
import { HeroSection } from "@/components/home/HeroSection";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { Reveal } from "@/components/Reveal";
import { freeShippingAnnouncement } from "@/lib/shipping";

export default async function HomePage() {
  const { data: products, message, configured } = await getProducts({ pageSize: 8, sort: "newest" });

  return (
    <>
      <HeroSection />

      <section className="benefit-strip" aria-label="Aromatherapica güvenceleri">
        <article>
          <span className="benefit-icon" aria-hidden>
            <Truck />
          </span>
          <div>
            <strong>Ücretsiz kargo</strong>
            <p>{freeShippingAnnouncement()}</p>
          </div>
        </article>
        <article>
          <span className="benefit-icon" aria-hidden>
            <Leaf />
          </span>
          <div>
            <strong>Bitkisel içerikler</strong>
            <p>Saf ve doğadan gelen özler</p>
          </div>
        </article>
        <article>
          <span className="benefit-icon" aria-hidden>
            <ShieldCheck />
          </span>
          <div>
            <strong>Güvenli ödeme</strong>
            <p>256-bit şifreli işlem</p>
          </div>
        </article>
        <article>
          <span className="benefit-icon" aria-hidden>
            <PackageCheck />
          </span>
          <div>
            <strong>Özenli paketleme</strong>
            <p>Ritüelinize yakışır bir teslimat</p>
          </div>
        </article>
      </section>

      <section className="gift-banner" id="delivery" aria-label="Alışveriş fırsatı">
        <p className="eyebrow">Aromatherapica&apos;dan size</p>
        <h2>İlk siparişinize özel bakım hediyesi</h2>
        <p>Seçili alışverişlerde sürpriz ritüel ürününüz bizden.</p>
        <Link className="text-link" href="/kategori/tum-urunler">
          Şimdi keşfet <span>→</span>
        </Link>
      </section>

      <section className="section products-section" id="products">
        <Reveal className="section-heading">
          <div>
            <p className="eyebrow">Aromatherapica seçkisi</p>
            <h2>Çok sevilenler</h2>
          </div>
        </Reveal>

        {products.length === 0 ? (
          <div className="catalog-empty">
            <span>A</span>
            <h2>Ürünler yakında burada</h2>
            <p>
              {message ||
                "Henüz ürün listelenemiyor. Ticimax bağlantısını yapılandırıp admin panelinden senkronizasyon çalıştırın."}
            </p>
            {!configured ? (
              <Link className="button button-primary" href="/admin/login">
                Admin paneli
              </Link>
            ) : null}
          </div>
        ) : (
          <Reveal className="product-grid" delay={0.05}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Reveal>
        )}

        <div className="section-footer-action">
          <Link className="text-link" href="/kategori/tum-urunler">
            Tüm ürünleri görüntüle <span>→</span>
          </Link>
        </div>
      </section>

      <section className="ritual-intro" id="rituals">
        <div className="ritual-intro-copy">
          <p className="eyebrow">Kendinize ayırdığınız anlar</p>
          <h2>Ritüelinizi seçin</h2>
          <p>Saf bitkisel içeriklerle hazırlanan ürünleri bakım ihtiyacınıza göre keşfedin.</p>
          <Link className="text-link" href="/kategori/tum-urunler">
            Tüm ürünleri gör <span>→</span>
          </Link>
        </div>

        <div className="ritual-grid">
          <article className="ritual-card ritual-blue">
            <span className="ritual-number">01</span>
            <div className="ritual-art ritual-art-oil" aria-hidden="true" />
            <div className="ritual-card-copy">
              <p>Saf ve konsantre</p>
              <h3>Aromaterapi Yağları</h3>
              <span>Ruh halinize ve günlük ritüelinize eşlik eden bitkisel özler.</span>
              <Link href="/kategori/ucucu-yaglar">Keşfet</Link>
            </div>
          </article>
          <article className="ritual-card ritual-clay">
            <span className="ritual-number">02</span>
            <div className="ritual-art ritual-art-cream" aria-hidden="true" />
            <div className="ritual-card-copy">
              <p>Günlük bakım</p>
              <h3>Cilt Bakım Serisi</h3>
              <span>Cildin dengesini gözeten zengin ve nazik formüller.</span>
              <Link href="/kategori/cilt-bakimi">Keşfet</Link>
            </div>
          </article>
          <article className="ritual-card ritual-sage">
            <span className="ritual-number">03</span>
            <div className="ritual-art ritual-art-flower" aria-hidden="true" />
            <div className="ritual-card-copy">
              <p>Bütünsel bakım</p>
              <h3>Saç ve Vücut</h3>
              <span>Günlük bakımınıza doğanın sakin ritmini taşıyan seçkiler.</span>
              <Link href="/kategori/ozel-bakim">Keşfet</Link>
            </div>
          </article>
        </div>
      </section>

      <Reveal as="section" className="editorial-split" y={32}>
        <div className="editorial-image" aria-hidden="true">
          <div className="editorial-vessel">
            <span />
          </div>
          <div className="editorial-shadow" />
        </div>
        <div className="editorial-copy">
          <p className="eyebrow">Bitkilerden ilham alan formüller</p>
          <h2>Cildinizin ritmini dinleyin</h2>
          <p>
            Pirinç kepeği, üzüm çekirdeği ve calendula gibi güçlü bitkisel içerikleri; duyusal
            dokular ve günlük kullanıma uygun formüllerle bir araya getiriyoruz.
          </p>
          <div className="editorial-points">
            <div>
              <strong>01</strong>
              <span>İhtiyacınızı belirleyin</span>
            </div>
            <div>
              <strong>02</strong>
              <span>Doğru ürünü seçin</span>
            </div>
            <div>
              <strong>03</strong>
              <span>Ritüelinizi düzenli uygulayın</span>
            </div>
          </div>
          <Link className="button button-primary" href="/kategori/tum-urunler">
            Bakım seçkisini keşfet
          </Link>
        </div>
      </Reveal>

      <section className="ingredient-banner" aria-label="Öne çıkan içerikler">
        <div className="ingredient-track">
          <span>Lavanta</span>
          <i />
          <span>Calendula</span>
          <i />
          <span>Tamanu</span>
          <i />
          <span>Üzüm Çekirdeği</span>
          <i />
          <span>Pirinç Kepeği</span>
          <i />
          <span>Biberiye</span>
          <i />
          <span>Lavanta</span>
          <i />
          <span>Calendula</span>
          <i />
          <span>Tamanu</span>
          <i />
          <span>Üzüm Çekirdeği</span>
          <i />
        </div>
      </section>

      <section className="conscience-section" aria-label="Sorumlu alışveriş ilkeleri">
        <h2>Özenle alışveriş</h2>
        <div className="conscience-grid">
          <article>
            <i className="conscience-icon conscience-rabbit" aria-hidden="true" />
            <h3>Hayvan dostu</h3>
            <p>Ürünlerimiz hayvanlar üzerinde test edilmez.</p>
          </article>
          <article>
            <i className="conscience-icon conscience-leaf" aria-hidden="true" />
            <h3>Bitkisel içerikler</h3>
            <p>Formüllerimizde doğadan gelen içeriklere öncelik veririz.</p>
          </article>
          <article>
            <i className="conscience-icon conscience-drop" aria-hidden="true" />
            <h3>Saf özler</h3>
            <p>Aromaterapi seçkimiz özenle seçilmiş özlerden oluşur.</p>
          </article>
          <article>
            <i className="conscience-icon conscience-recycle" aria-hidden="true" />
            <h3>Sorumlu ambalaj</h3>
            <p>Geri dönüştürülebilir ambalaj seçeneklerini destekleriz.</p>
          </article>
          <article>
            <i className="conscience-icon conscience-heart" aria-hidden="true" />
            <h3>İyi yaşam</h3>
            <p>Bakımı günlük yaşamın sakin ve değerli bir parçası görürüz.</p>
          </article>
        </div>
      </section>

      <section className="newsletter">
        <div className="newsletter-copy">
          <p className="eyebrow">Aromatherapica dünyasına katılın</p>
          <h2>Yeniliklerden ilk siz haberdar olun</h2>
          <p>Yeni ürünler, bakım notları ve özel tekliflerden ilk siz haberdar olun.</p>
        </div>
        <NewsletterForm />
      </section>
    </>
  );
}

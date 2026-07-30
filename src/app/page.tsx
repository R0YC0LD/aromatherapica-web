import Link from "next/link";
import { Leaf, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { getProducts } from "@/lib/catalog/service";
import { HeroSection } from "@/components/home/HeroSection";
import { NewsletterForm } from "@/components/home/NewsletterForm";
import { Reveal } from "@/components/Reveal";
import { ShippingBenefitText } from "@/components/ShippingBenefitText";
import {
  HomeFeaturedProducts,
  HomeGiftBanner,
  HomeRituals,
} from "@/components/home/HomeStorefront";
import { ConscienceSection } from "@/components/home/ConscienceSection";

export default async function HomePage() {
  const { data: products, message, configured } = await getProducts({ pageSize: 48, sort: "newest" });

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
            <p>
              <ShippingBenefitText />
            </p>
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

      <HomeGiftBanner />

      <HomeFeaturedProducts products={products} message={message} configured={configured} />

      <HomeRituals />

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

      <ConscienceSection />

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

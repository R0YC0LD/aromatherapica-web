"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ProductCard } from "@/components/ProductCard";
import { Reveal } from "@/components/Reveal";
import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import { withBasePath } from "@/lib/paths";
import type { NormalizedProduct } from "@/lib/ticimax/types";

export function HomeGiftBanner() {
  const { settings } = useCatalogOverrides();
  return (
    <section className="gift-banner" id="delivery" aria-label="Alışveriş fırsatı">
      <p className="eyebrow">{settings.giftEyebrow}</p>
      <h2>{settings.giftTitle}</h2>
      <p>{settings.giftText}</p>
      <Link className="text-link" href="/kategori/tum-urunler">
        Şimdi keşfet <span>→</span>
      </Link>
    </section>
  );
}

export function HomeFeaturedProducts({
  products,
  message,
  configured,
}: {
  products: NormalizedProduct[];
  message?: string;
  configured?: boolean;
}) {
  const { settings, mergeProduct, catalog } = useCatalogOverrides();

  const list = useMemo(() => {
    const source = catalog.length > 0 ? catalog : products;
    const merged = source.map(mergeProduct).filter((p) => p.active);
    const rawIds = settings.featuredProductIds;
    const ids = String(rawIds || "")
      .split(/[,\s]+/)
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (ids.length === 0) return merged.slice(0, 8);
    const map = new Map(merged.map((p) => [p.id, p]));
    const picked = ids.map((id) => map.get(id)).filter(Boolean) as NormalizedProduct[];
    return picked.length > 0 ? picked : merged.slice(0, 8);
  }, [products, catalog, mergeProduct, settings.featuredProductIds]);

  return (
    <section className="section products-section" id="products">
      <Reveal className="section-heading">
        <div>
          <p className="eyebrow">{settings.featuredEyebrow}</p>
          <h2>{settings.featuredTitle}</h2>
        </div>
      </Reveal>

      {list.length === 0 ? (
        <div className="catalog-empty">
          <span>A</span>
          <h2>Ürünler yakında burada</h2>
          <p>
            {message ||
              "Henüz ürün listelenemiyor. Yönetim panelinden ürün ekleyin veya görselleri güncelleyin."}
          </p>
          {!configured ? (
            <Link className="button button-primary" href="/admin/">
              Yönetim paneli
            </Link>
          ) : null}
        </div>
      ) : (
        <Reveal className="product-grid" delay={0.05}>
          {list.map((product) => (
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
  );
}

export function HomeRituals() {
  const { settings } = useCatalogOverrides();
  const cards = settings.ritualCards?.length ? settings.ritualCards : [];

  return (
    <section className="ritual-intro" id="rituals">
      <div className="ritual-intro-copy">
        <p className="eyebrow">{settings.ritualEyebrow}</p>
        <h2>{settings.ritualTitle}</h2>
        <p>Saf bitkisel içeriklerle hazırlanan ürünleri bakım ihtiyacınıza göre keşfedin.</p>
        <Link className="text-link" href="/kategori/tum-urunler">
          Tüm ürünleri gör <span>→</span>
        </Link>
      </div>

      <div className="ritual-grid">
        {cards.map((card, index) => {
          const img = card.imageUrl
            ? card.imageUrl.startsWith("data:")
              ? card.imageUrl
              : withBasePath(card.imageUrl)
            : "";
          const tone = index === 0 ? "ritual-blue" : index === 1 ? "ritual-sage" : "ritual-sand";
          return (
            <article key={`${card.title}-${index}`} className={`ritual-card ${tone}`}>
              <span className="ritual-number">{String(index + 1).padStart(2, "0")}</span>
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="ritual-photo" src={img} alt="" />
              ) : (
                <div
                  className={`ritual-art ${index === 0 ? "ritual-art-oil" : index === 1 ? "ritual-art-skin" : "ritual-art-body"}`}
                  aria-hidden="true"
                />
              )}
              <div className="ritual-card-copy">
                <p>{card.subtitle}</p>
                <h3>{card.title}</h3>
                <span>{card.description}</span>
                <Link href={card.href || "/kategori/tum-urunler"}>Keşfet</Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

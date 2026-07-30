"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { BackButton } from "@/components/BackButton";
import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";
import { productStory, resolveIngredientsForProduct } from "@/lib/catalog/ingredients";
import { formatCurrency, slugify } from "@/lib/format";
import { withBasePath } from "@/lib/paths";
import { ticimaxProductUrl } from "@/lib/ticimax/commerce";
import type { NormalizedProduct } from "@/lib/ticimax/types";

const EASE = [0.22, 1, 0.36, 1] as const;

export function ProductView({ product: raw }: { product: NormalizedProduct }) {
  const { mergeProduct, settings } = useCatalogOverrides();
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const product = mergeProduct(raw);
  const variant = product.variants[0];
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const favorite = has(product.id);
  const buyUrl = ticimaxProductUrl(
    { slug: product.slug, id: product.id, ticimaxUrl: product.ticimaxUrl },
    settings.ticimaxStoreUrl,
  );

  const price =
    product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const categoryHref = product.categoryName
    ? `/kategori/${slugify(product.categoryName)}`
    : "/kategori/tum-urunler";

  const ingredients = useMemo(() => resolveIngredientsForProduct(product), [product]);
  const story = useMemo(() => productStory(product), [product]);

  function addWithQty() {
    if (product.stock <= 0) return;
    add({
      productId: product.id,
      variantId: variant?.id || product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.images[0],
      price: product.price,
      salePrice: product.salePrice,
      quantity: qty,
    });
    setAdded(true);
    window.setTimeout(() => {
      window.location.href = buyUrl;
    }, 350);
  }

  function handleFavorite(e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    toggle(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: product.images[0],
        price: product.price,
        salePrice: product.salePrice,
        stock: product.stock,
      },
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
    );
  }

  return (
    <div className="commerce-page product-page">
      <nav className="commerce-breadcrumb" aria-label="Sayfa yolu">
        <BackButton fallbackHref={categoryHref} label="Önceki sayfa" />
        <Link href="/">Ana sayfa</Link>
        <span>/</span>
        <Link href={categoryHref}>{product.categoryName || "Ürünler"}</Link>
        <span>/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="product-detail-layout">
        <motion.div
          className="product-gallery-stage"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: EASE }}
        >
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <span className="css-product-bottle" aria-hidden />
          )}
          <p className="product-gallery-note">Aromatherapica · Saf içerik seçkisi</p>
        </motion.div>

        <motion.div
          className="product-purchase"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: EASE }}
        >
          <p className="product-cat">{product.categoryName || product.brandName || "Aromatherapica"}</p>
          <h1>{product.name}</h1>
          <p className="product-lead">{story}</p>

          <div className="product-price-block">
            <strong>{formatCurrency(price)}</strong>
            {product.salePrice && product.salePrice < product.price ? (
              <s>{formatCurrency(product.price)}</s>
            ) : null}
          </div>

          <p className={`product-stock${product.stock > 0 ? "" : " is-out"}`}>
            <span className="stock-dot" aria-hidden />
            {product.stock > 0 ? "Stokta · Hızlı kargoya hazır" : "Şu anda stokta yok"}
          </p>

          <ul className="product-benefits">
            <li>
              <ShieldCheck size={16} aria-hidden /> Saf bitkisel karakter
            </li>
            <li>
              <Truck size={16} aria-hidden /> Özenli teslimat
            </li>
          </ul>

          <div className="purchase-actions">
            <div className="quantity-control" aria-label="Adet">
              <button
                type="button"
                aria-label="Azalt"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus size={14} />
              </button>
              <span>{qty}</span>
              <button type="button" aria-label="Artır" onClick={() => setQty((q) => q + 1)}>
                <Plus size={14} />
              </button>
            </div>

            <button
              type="button"
              className={`add-button product-add${added ? " is-added" : ""}`}
              disabled={product.stock <= 0}
              onClick={addWithQty}
            >
              {product.stock <= 0 ? "Stokta yok" : added ? "Ticimax’e gidiliyor…" : "Sepete ekle"}
            </button>

            <button
              type="button"
              className={`product-favorite${favorite ? " is-active" : ""}`}
              aria-label={favorite ? "Favorilerden çıkar" : "Favorilere ekle"}
              aria-pressed={favorite}
              onClick={handleFavorite}
            >
              <Heart size={18} aria-hidden />
            </button>
          </div>

          <div className="purchase-trust">
            <p>Kart numarası bu sitede işlenmez. Ödeme Ticimax altyapısıyla güvenle tamamlanır.</p>
          </div>
        </motion.div>
      </div>

      <section className="product-information" aria-labelledby="details-title">
        <div className="product-information-intro">
          <p className="eyebrow">Ürün hikâyesi</p>
          <h2 id="details-title">İçindeki bitkiler ve faydaları</h2>
        </div>

        <div>
          <div className="ingredient-grid">
            {ingredients.map((item, index) => (
              <motion.article
                key={item.key}
                className="ingredient-card"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: index * 0.06, ease: EASE }}
              >
                <div className="ingredient-icon">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={withBasePath(item.image)} alt="" loading="lazy" />
                </div>
                <div>
                  <h3>{item.name}</h3>
                  <p className="ingredient-latin">{item.latin}</p>
                  <p>{item.role}</p>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="product-accordions">
            <details open>
              <summary>
                Nasıl kullanılır?
                <span aria-hidden>+</span>
              </summary>
              <p>
                Uçucu yağ ise taşıyıcı yağ ile seyrelterek cilde uygulayın veya difüzörde kullanın.
                Taşıyıcı / bakım yağlarında az miktarı temiz cilde masaj hareketleriyle uygulayın.
                Gözle temastan kaçının.
              </p>
            </details>
            <details>
              <summary>
                İçerik notu
                <span aria-hidden>+</span>
              </summary>
              <p>
                {product.description
                  ? null
                  : "Bu ürün Aromatherapica bitkisel seçkisinden gelir. Saf aromatik karakterini koruyacak şekilde sunulur."}
              </p>
              {product.description ? (
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : null}
            </details>
            <details>
              <summary>
                Saklama ve uyarılar
                <span aria-hidden>+</span>
              </summary>
              <p>
                Serin, kuru ve güneş almayan bir yerde saklayın. Çocukların ulaşamayacağı yerde
                tutun. Hamilelik, emzirme veya hassas cilt durumunda kullanmadan önce uzmanınıza
                danışın.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
}

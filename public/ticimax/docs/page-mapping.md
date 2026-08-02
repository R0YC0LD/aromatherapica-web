# v24 sayfa ve bileşen haritası

| Ticimax alanı | Snippet | `data-ar-page` | Yüklenen sayfa modülü |
|---|---|---|---|
| Tüm Sayfalar | `01-all-pages.html` | `all` | core + global shell |
| Anasayfa | `02-home.html` | `home` | `ar-home.js` + `pages/ar-home-page.js` |
| Kategori | `03-category.html` | `category` | `pages/ar-category.js` |
| Marka | `04-brand.html` | `brand` | `pages/ar-brand.js` |
| Ürün Detay | `05-product-detail.html` | `product-detail` | `pages/ar-product-detail.js` |
| Sipariş Tamamlandı | `06-order-success.html` | `order-success` | `pages/ar-order-success.js` |
| Sepet | `07-cart.html` | `cart` | `pages/ar-cart-page.js` |
| Üye Ol | `08-register.html` | `register` | `pages/ar-register.js` |
| Üyelik Tamamlandı | `09-register-success.html` | `register-success` | `pages/ar-register-success.js` |
| Tüm Sayfalar - Header | `10-header.html` | config | loader yüklemez |
| Arama | `13-search.html` | `search` | `pages/ar-search.js` |
| Sipariş Tamamla | `14-checkout.html` | `checkout` | `pages/ar-checkout.js` |

Ortak bileşenler: `ar-global.js` header, menü, arama, sepet çekmecesi, favori rotası, popup, sayaç senkronu ve akıllı scroll davranışını yönetir. `ar-polish.css` bütün sayfalarda en son yüklenen terminal responsive katmandır. Ticimax ürün kartı ve formları kaynak/işlem katmanı olarak korunur.

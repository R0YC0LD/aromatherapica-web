# Aromatherapica Ticimax v21 kurulumu

Aktif sürüm: `20260802-22`

Kullanılacak dosyalar `snippets/` klasöründedir. Her dosya Ticimax’ın yaklaşık 600 satırlık panel sınırının çok altındadır; büyük CSS/JS dosyaları GitHub Pages üzerinden yüklenir.

## 1. Yedek ve temizlik

1. Ticimax Dinamik Script Yönetimi’ndeki 12 alanı yedekleyin.
2. Eski Aromatherapica loader satırlarını ve büyük gömülü CSS/JS bloklarını kaldırın.
3. Aynı alanda v20 ve v21’i birlikte bırakmayın.

## 2. Panel alanları

| Sıra | Ticimax alanı | Yapıştırılacak dosya |
|---:|---|---|
| 1 | Tüm Sayfalar - Header | `snippets/10-header.html` |
| 2 | Tüm Sayfalar | `snippets/01-all-pages.html` |
| 3 | Anasayfa | `snippets/02-home.html` |
| 4 | Kategori | `snippets/03-category.html` |
| 5 | Marka | `snippets/04-brand.html` |
| 6 | Ürün Detay | `snippets/05-product-detail.html` |
| 7 | Sipariş Tamamlandı | `snippets/06-order-success.html` |
| 8 | Sepet | `snippets/07-cart.html` |
| 9 | Üye Ol Sayfası | `snippets/08-register.html` |
| 10 | Üyelik Tamamlandı | `snippets/09-register-success.html` |
| 11 | Arama | `snippets/13-search.html` |
| 12 | Sipariş Tamamla | `snippets/14-checkout.html` |

Her alanı kaydedin. Son işlemden sonra 2–5 dakika bekleyip gizli pencerede `Ctrl+F5` yapın.

## 3. Ürün ve kategori davranışı

Tema ürün üretmez veya sabit ürün listesi tutmaz. Ticimax’ın `.productItem` kartları, ürün görselleri, fiyatları ve gerçek `.btnAddToCart` eylemleri kullanılır. Ticimax panelinde ürün, görsel, stok, fiyat veya kategori değiştirdiğinizde mağaza otomatik güncellenir. Görseli olmayan ürünlerde tema sahte resim yerine erişilebilir hazırlık alanı gösterir.

## 4. Kontrol

- Mobil: 320/360/390/430 px, iki ürün kolonu.
- Tablet: 768–1279 px, üç ürün kolonu.
- Masaüstü: 1280–1920 px, dört ürün kolonu.
- Favoriler: `/Hesabim.aspx#/Favorilerim`.
- Menü: butona basınca sayfa kaymamalı, artılı gruplar açılmalı.
- Sepet: sayaç artmalı ve ürün checkout’ta görünmeli.
- Popup: 6,5 saniyede açılmalı, ekran içinde kalmalı ve kapatılabilmeli.

Ayrıntılı kurulum: `docs/installation.md`. Sayfa/bileşen haritası: `docs/page-mapping.md`. Test ve geri alma: `docs/testing.md`, `docs/rollback.md`.

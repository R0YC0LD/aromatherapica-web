# Ticimax manuel kurulum — v21 (`20260802-22`)

Bu paket Ticimax ürün, kategori, fiyat, stok, varyant, favori, sepet, üyelik ve ödeme akışlarını değiştirmez. Görünüm katmanı uzak GitHub Pages runtime’ından yüklenir; ürünler ve görseller Ticimax’ın kendi HTML’inden canlı okunur.

## Kurulumdan önce

1. Ticimax **Dinamik Script Yönetimi** içindeki 12 alanın mevcut metnini ayrı dosyalara yedekleyin.
2. Eski Aromatherapica loader veya büyük gömülü CSS/JS bloklarını aynı alanlarda bırakmayın.
3. `10-header.html` alanına runtime loader koymayın; bu alan yalnız v21 yapılandırmasıdır.

## Yapıştırma sırası

1. `snippets/10-header.html` → **Tüm Sayfalar - Header**
2. `snippets/01-all-pages.html` → **Tüm Sayfalar**
3. `snippets/02-home.html` → **Anasayfa**
4. `snippets/03-category.html` → **Kategori**
5. `snippets/04-brand.html` → **Marka**
6. `snippets/05-product-detail.html` → **Ürün Detay**
7. `snippets/06-order-success.html` → **Sipariş Tamamlandı**
8. `snippets/07-cart.html` → **Sepet**
9. `snippets/08-register.html` → **Üye Ol Sayfası**
10. `snippets/09-register-success.html` → **Üyelik Tamamlandı**
11. `snippets/13-search.html` → **Arama**
12. `snippets/14-checkout.html` → **Sipariş Tamamla**

Her alanı tek tek kaydedin. Snippetlerin her biri 600 satır sınırının çok altındadır. Son kayıttan sonra 2–5 dakika bekleyin, gizli pencerede açın ve bir kez `Ctrl+F5` uygulayın.

## Zorunlu yayın kontrolü

- Sayfa kaynağında `20260802-22` görünmelidir.
- Konsolda `window.AROMATHERAPICA.version` değeri `20260802-22` olmalıdır.
- Mobilde iki, tablette üç, masaüstünde dört katalog sütunu görünmelidir.
- Favori bağlantısı `/Hesabim.aspx#/Favorilerim` olmalıdır.
- Bir ürünü sepete eklediğinizde header sayacı artmalı ve ürün `/checkout` içinde görünmelidir.

## Ticimax sınırlaması/fallback

Runtime yüklenemezse yerel Ticimax DOM’u ve alışveriş işlevleri görünür kalır. Ürün görseli Ticimax kaydında yoksa tema sahte ürün resmi üretmez; erişilebilir “Ürün görseli hazırlanıyor” alanı gösterir. Görseli Ticimax ürün kartından eklediğinizde site otomatik güncellenir.

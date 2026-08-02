# Aromatherapica Ticimax v21 — responsive minimal teslim raporu

## 1. Kısa teşhis

- Önceki sürümlerde aynı bileşene farklı breakpointlerden gelen çok sayıda `!important` kural uygulanıyordu.
- `ar-global.css`, `ar-home.css` ve eski polish ekleri yanlış yükleme sırasıyla birbirini geçebiliyordu.
- Native `custom-top-bar` ve `ozel-hizli-menu`, yeni header içeriğini tekrarlıyordu.
- 768 px katalog geometrisi eski yüzde kuralları nedeniyle iki kolona düşüyordu.
- Favori kısayolunda `/favorilerim` rotası Ticimax’ta 404 veriyordu.
- Popup kapatma ve mobil ürün butonlarının bazıları 44 px dokunma hedefinin altındaydı.
- Görsel “sepete ekle” butonu işlem yapıyor ancak özel header sayacı sonradan senkronlanmıyordu.

## 2. Tasarım tokenları

| Token | Değer/denklem | Kullanım |
|---|---|---|
| `--ar-container` | `min(1280px, 100vw - 2 × pad)` | Merkez içerik genişliği |
| `--ar-pad` | `clamp(16px, 4vw, 28px)` | Yatay güvenli boşluk |
| `--ar-gap` | `clamp(12px, 2vw, 28px)` | Grid/kart aralığı |
| `--ar-section-y` | `clamp(72px, 8vw, 120px)` | Dikey bölüm ritmi |
| `--ar-type-hero` | `clamp(36px, 6vw, 72px)` | Hero başlığı |
| `--ar-type-h2` | `clamp(28px, 4vw, 52px)` | Bölüm başlığı |
| `--ar-control-radius` | `999px` | Buton ve kategori çipleri |
| `--ar-safe-*` | `env(safe-area-inset-*)` | Çentik/home-bar güvenliği |
| Ürün kolonları | 2 / 3 / 4 | telefon / tablet / masaüstü |

## 3. Uygulanan yamalar

- `ar-polish.css`: tek terminal responsive sistem, global taşma kilidi, safe-area, dengeli header, katalog geometrisi, ürün/sepet/üyelik/popup/footer düzenleri ve minimal hareket dili.
- `ar-global.js`: v21 sürümü, doğru favori rotası, akıllı header, menü akordeonu, popup zamanlaması, yerel Ticimax sepete ekleme delegasyonu ve sayaç senkronu.
- `ar-home.js`: sahte yıldız/rozetlerin kaldırılması, yerel Ticimax ürün içeriği, minimal kart metni ve parallax kaldırma.
- `ar-loader.js`: `global.css → home.css (yalnız anasayfa) → polish.css → JS` sırası; polish her zaman terminal katmandır.
- Native ürün, fiyat, stok, varyant, form, üyelik, checkout ve sipariş kontrolleri silinmedi veya yeniden üretilmedi.

## 4. Minimal JavaScript notu

JavaScript yalnız kabuk etkileşimleri ve progressive enhancement için kullanılır. Ticimax’ın fiyat/stok/varyant/sepet iş mantığı kopyalanmaz. Görsel katalog butonu gerçek `.btnAddToCart` öğesini tetikler; sayaç yerel `.sepetUrunSayisi` değerinden okunur. Ürün güncellemesi DOM observer ile yeniden biçimlendirilir.

## 5. Panel sürüm yükseltmesi

Tüm loader snippet dosyaları ve Header config `20260802-21` sürümüne yükseltildi. Loader, panelde kalmış daha eski bir config değerinin v21 cache anahtarını geriye almasını engeller. Header alanı runtime yüklemez. Kullanılacak tek dosya takımı `public/ticimax/snippets/` ve bunun `final/` kopyasıdır; eski `final-full/` klasörü yayın akışında kullanılmaz. Canlı Ticimax panelinde Üye Ol alanı loader çalıştırmadığı için `08-register.html` dahil 12 v21 snippetinin panelde yeniden kaydedilmesi zorunludur.

## 6. Cihaz test matrisi

| Görünüm | Anasayfa | Kategori/Marka | Ürün | Checkout | Üyelik | Sonuç |
|---|---:|---:|---:|---:|---:|---|
| 320 × 568 | 2 kolon | 2 kolon | tek kolon | tek kolon | tek kolon | taşma yok |
| 360 × 844 | 2 kolon | 2 kolon | tek kolon | tek kolon | tek kolon | taşma yok |
| 390 × 844 | 2 kolon | 2 kolon | tek kolon | tek kolon | tek kolon | taşma yok |
| 430 × 844 | 2 kolon | 2 kolon | tek kolon | tek kolon | tek kolon | taşma yok |
| 768 × 1024 | 3 kolon | 3 kolon | dengeli 2 panel | tek kolon | tek kolon | taşma yok |
| 1280 × 1024 | 4 kolon | 4 kolon | 2 panel | yerel akış | merkez form | taşma yok |
| 1440 × 1024 | 4 kolon | 4 kolon | 2 panel | yerel akış | merkez form | taşma yok |
| 1920 × 1024 | 4 kolon | 4 kolon | 2 panel | yerel akış | merkez form | taşma yok |
| 844 × 390 yatay | akışkan | 3 kolon | akışkan | akışkan | akışkan | sabit kontrol taşması yok |

## 7. Geri alma

Ticimax panelindeki 12 v21 snippetini kurulum öncesi yedeklerle değiştirin veya v21 loader satırlarını kaldırın. Kaydedip CDN yenilenmesini bekleyin. İşlem yalnız görünüm/yükleyici katmanını geri alır; Ticimax ürün, üye, sepet ve sipariş verilerine dokunmaz.

# Aromatherapica Ticimax v24 — responsive minimal teslim raporu

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
| `--ar-navy` / `--ar-green` | `#082f6b` | Eski Aromatherapica lacivert/mavi ana vurgu |
| `--ar-type-hero` | `clamp(36px, 6vw, 72px)` | Hero başlığı |
| `--ar-type-h2` | `clamp(28px, 4vw, 52px)` | Bölüm başlığı |
| `--ar-control-radius` | `999px` | Buton ve kategori çipleri |
| `--ar-safe-*` | `env(safe-area-inset-*)` | Çentik/home-bar güvenliği |
| Ürün kolonları | 2 / 3 / 4 | telefon / tablet / masaüstü |

## 3. Uygulanan yamalar

- `ar-polish.css`: tek terminal responsive sistem, global taşma kilidi, safe-area, eski lacivert/mavi marka vurgusu, dengeli header, katalog geometrisi, ürün/sepet/üyelik/popup/footer düzenleri, etiketli checkbox/radio kontrollerinde 44 px dokunma alanı ve minimal hareket dili.
- `ar-global.js`: v24 sürümü, doğru favori rotası, akıllı header, menü akordeonu, popup zamanlaması, yerel Ticimax sepete ekleme delegasyonu, sayaç senkronu ve hash ile sonradan gelen native Üyelik Bilgilerim formunu güvenli biçimde tanıyan layout işaretleyicileri.
- `ar-home.js`: sahte yıldız/rozetlerin kaldırılması, yerel Ticimax ürün içeriği, minimal kart metni ve parallax kaldırma.
- `ar-loader.js`: `global.css → home.css (yalnız anasayfa) → polish.css → JS` sırası; polish her zaman terminal katmandır.
- Native ürün, fiyat, stok, varyant, form, üyelik, checkout ve sipariş kontrolleri silinmedi veya yeniden üretilmedi.
- Runtime CSS/JS içindeki doygun yeşil hex ve RGB renkler otomatik renk taramasından geçirildi; kalan yeşil renk sayısı sıfırlandı. Footer `#061f49`, ana vurgu `#082f6b`, açık yüzeyler mavi-gri palete taşındı.

## 4. Minimal JavaScript notu

JavaScript yalnız kabuk etkileşimleri ve progressive enhancement için kullanılır. Ticimax’ın fiyat/stok/varyant/sepet iş mantığı kopyalanmaz. Görsel katalog butonu gerçek `.btnAddToCart` öğesini tetikler; sayaç yerel `.sepetUrunSayisi` değerinden okunur. Ürün güncellemesi DOM observer ile yeniden biçimlendirilir.

Hareket katmanı kısa `160–280 ms` süreler ve yalnızca `opacity/transform` geçişleri kullanır. Sonsuz dekoratif animasyonlar ile kaydırma sırasında yeniden boyama üreten blur efektleri terminal katmanda kapatılmıştır; `prefers-reduced-motion` desteği korunur.

## 5. Panel sürüm yükseltmesi

Tüm loader snippet dosyaları ve Header config lacivert/mavi + akıcılık yamasıyla `20260802-24` sürümüne yükseltildi. Loader, panelde kalmış daha eski bir config değerinin güncel cache anahtarını geriye almasını engeller. Header alanı runtime yüklemez. Kullanılacak ana dosya takımı `public/ticimax/snippets/` ve bunun `final/` kopyasıdır. Eski büyük gömülü kodlar içeren `final-full/` dosyaları da yanlışlıkla seçildiklerinde yeşil temayı geri getirmemeleri ve 600 satır sınırını aşmamaları için aynı v24 kısa yükleyicilerine dönüştürüldü. Canlı Ticimax panelinde Üye Ol alanı loader çalıştırmadığı için `08-register.html` dahil 12 güncel snippetin panelde yeniden kaydedilmesi zorunludur.

## 6. Cihaz test matrisi

| Görünüm | Anasayfa | Kategori/Marka | Ürün | Checkout | Üyelik | Sonuç |
|---|---:|---:|---:|---:|---:|---|
| 320 × 568 | 2 kolon | 2 kolon | tek kolon | tek kolon | tek kolon | taşma yok |
| 360 × 844 | 2 kolon | 2 kolon | tek kolon | tek kolon | tek kolon | taşma yok |
| 390 × 844 | 2 kolon | 2 kolon | tek kolon | tek kolon | tek kolon | taşma yok |
| 430 × 844 | 2 kolon | 2 kolon | tek kolon | tek kolon | tek kolon | taşma yok |
| 768 × 1024 | 3 kolon | 3 kolon | dengeli 2 panel | tek kolon | iki kolon | taşma yok |
| 1280 × 1024 | 4 kolon | 4 kolon | 2 panel | yerel akış | merkez form | taşma yok |
| 1440 × 1024 | 4 kolon | 4 kolon | 2 panel | yerel akış | merkez form | taşma yok |
| 1920 × 1024 | 4 kolon | 4 kolon | 2 panel | yerel akış | merkez form | taşma yok |
| 844 × 390 yatay | akışkan | 3 kolon | akışkan | akışkan | akışkan | sabit kontrol taşması yok |

Ek sistem sayfası doğrulamasında sepet, checkout, üye ol, üyelik tamamlandı ve sipariş tamamlandı için 5 genişlikte 25 koşu yapıldı. Native form kimliği, varyant/adet alanları, favori bağlantısı ve Ticimax header korunurken yatay taşma, küçük dokunma hedefi ve modül yükleme hatası görülmedi. Başarı ekranlarına `role="status"` ve `aria-live="polite"` uygulandığı doğrulandı.

Üyelik Bilgilerim için ayrıca dar native kolon kuralları içeren temsilî Ticimax DOM’u test edilir. Form `id/name/action`, input `name/value` ve submit düğmesi korunurken masaüstünde iki kolon, telefonda tek kolon ve en az 44 px dokunma alanı beklenir.

## 7. Geri alma

Ticimax panelindeki 12 v24 snippetini kurulum öncesi yedeklerle değiştirin veya v24 loader satırlarını kaldırın. Kaydedip CDN yenilenmesini bekleyin. İşlem yalnız görünüm/yükleyici katmanını geri alır; Ticimax ürün, üye, sepet ve sipariş verilerine dokunmaz.

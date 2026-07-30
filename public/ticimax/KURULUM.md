# WebSitesi → Ticimax birebir kurulum

Kaynak: `C:\Users\ongor\OneDrive\Desktop\WebSitesi\zmetik\zmetik` (HAZIR-KURULUM / canli-exact).

Bu paket yerel WebSitesi görünümünü Ticimax’ın gerçek ürün, sepet, favori, üyelik ve ödeme altyapısıyla birleştirir. Ürün verisi sabitlenmez; Ticimax `.productItem` düğümleri biçimlendirilir.

## 0. Temizlik

1. `location.replace(...github.io...)` yönlendirme scriptini sil.
2. Eski çakışan Dinamik Script / “Tema Önizlemesi” gömülü HTML’i kaldır.
3. Panel yedeği al.

## 1. Amblem

`assets/aromatherapica-emblem.png` → `/Uploads/EditorUploads/aromatherapica-emblem.png`

## 2. Dinamik Script sırası

| # | Dosya (`final/`) | Alan |
|---|------------------|------|
| 1 | `01-tum-sayfalar.txt` | Tüm Sayfalar |
| 2 | `10-tum-sayfalar-header.txt` | Tüm Sayfalar - Header |
| 3 | `02-anasayfa.txt` | Anasayfa |
| 4 | `03-kategori.txt` | Kategori |
| 5 | `04-marka.txt` | Marka |
| 6 | `05-urun-detay.txt` | Ürün Detay |
| 7 | `07-sepet.txt` | Sepet |
| 8 | `13-arama.txt` | Arama |
| 9 | `08-uye-ol-sayfasi.txt` | Üye Ol |
| 10 | `09-uyelik-tamamlandi.txt` | Üyelik Tamamlandı |
| 11 | `14-siparis-tamamla.txt` | Sipariş Tamamla |
| 12 | `06-siparis-tamamlandi.txt` | Sipariş Tamamlandı |

## 3. Kategori üst blokları

`kategori-bloklari/` içindeki HTML’leri ilgili kategori açıklama alanına yapıştırın.

## 4. Yayın kontrolü

Anasayfa · kategori · ürün · sepet · arama · üyelik · ödeme · mobil 360/390 · menü blur · duyuru barı scroll.

Integrity: `final/SHA256SUMS.txt`

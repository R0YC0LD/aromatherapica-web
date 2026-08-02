# v21 test raporu ve kontrol listesi

Sürüm: `20260802-22`

- JavaScript: `ar-loader.js`, `ar-global.js` ve `ar-home.js` `node --check` ile doğrulandı.
- Görünüm matrisi: 320, 360, 390, 430, 768, 1280, 1440 ve 1920 px.
- Yatay görünüm: 844 × 390 px.
- Sayfalar: anasayfa, kategori, marka, arama, ürün detay, checkout ve üyelik.
- Sonuç: yatay taşma, header çakışması, kırık tema görseli ve sabit kontrol taşması yok.
- Katalog: telefon 2, tablet 3, masaüstü 4 sütun; ilk satır kart yükseklik farkı 0 px.
- Etkileşim: popup, kapatma, menü, akordeon, scroll-hide, favori rotası, yerel sepete ekleme köprüsü ve checkout ürün devamlılığı doğrulandı.
- Progressive enhancement: asset hatasında yerel Ticimax DOM’u korunur.

Ticimax’ın `ticimax.productlist.min.js` içindeki `null.map` ve arama partial uyarıları canlı platform paketinden gelmektedir; v21 dosyalarından kaynaklanan hata bulunmadı. Gerçek ödeme ve sipariş oluşturma mağaza sahibinin test/sandbox hesabında tamamlanmalıdır.

# Test raporu ve kontrol listesi

Sürüm: `20260801-12`

- JavaScript sözdizimi: otomatik `node --check`.
- Loader tekrarı: `data-ar-asset` ve modül bayraklarıyla engellenir.
- Dinamik ürünler: ilgili katalog container’ında debounce edilmiş `MutationObserver`.
- Ürün verisi: gerçek Ticimax kartından okunur; fiyat/stok/varyant uydurulmaz.
- Progressive enhancement: asset hatası yakalanır, özgün Ticimax DOM’u kaldırılmaz.
- Erişilebilirlik: ürün görseli alt metni ve gerçek eylem butonlarına erişilebilir ad eklenir.

Gerçek ödeme ve sipariş oluşturma testi güvenlik nedeniyle yalnız Ticimax test/sandbox hesabında mağaza sahibi tarafından tamamlanmalıdır. Safari/iPhone fiziksel cihaz doğrulaması da mağaza yayınından sonra yapılmalıdır.

# Doğrulanmış Ticimax selector haritası

Canlı Aromatherapica DOM incelemesinde ürün kökü `.productItem`, veri alanı `.productDetail`, ad `.productName`, görsel `.productImage img`, fiyat `.discountPriceSpan`/`.currentPrice`, gerçek sepet butonu `.btnAddToCart`, favori `.favoriteslist` olarak görüldü. Adaptör ayrıca tema varyasyonları için sınırlı alternatifler içerir.

Kritik koruma listesi: `.btnAddToCart`, `.favoriteslist`, varyant `data-variant-id`, form `action/name/id`, inline Ticimax olayları, sepet adet kontrolleri, checkout ödeme/kargo/sözleşme alanları. Runtime bunları kaldırmaz veya yeniden yazmaz; yalnız sınıf ve erişilebilirlik niteliği ekler.

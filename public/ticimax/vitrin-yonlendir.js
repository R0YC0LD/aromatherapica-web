/**
 * Aromatherapica → Ticimax Dinamik Script (Vitrin yönlendirme)
 * ------------------------------------------------------------
 * Ticimax Admin > Dinamik Script Yönetimi > Yeni Script
 * Konum: </head> öncesi veya gövde sonu
 * Sayfalar: Tüm sayfalar (veya sadece Anasayfa)
 *
 * Mağaza vitrinini özel siteye taşır; Admin / Üye / Sepet / Ödeme Ticimax'te kalır.
 */
(function () {
  try {
    var path = String(location.pathname || "/").toLowerCase();
    var href = String(location.href || "");

    // Ticimax yönetim ve ticaret akışlarını dokunma
    var keep = [
      "/admin",
      "/uyegiris",
      "/uyekayit",
      "/uye/",
      "/uyeler",
      "/sepet",
      "/sepetim",
      "/odeme",
      "/siparis",
      "/servis",
      "/handlers",
      "/taksit",
      "/banka",
      "/3dsecure",
      "/dinamikscript",
    ];
    for (var i = 0; i < keep.length; i++) {
      if (path.indexOf(keep[i]) !== -1) return;
    }

    // Zaten özel sitedeysek döngü olmasın
    var CUSTOM = "https://r0yc0ld.github.io/aromatherapica-web";
    if (href.indexOf(CUSTOM) === 0) return;

    // Anasayfa + kategori/ürün vitrinini özel siteye yönlendir
    var dest = CUSTOM + "/";
    if (path.length > 1) {
      // Ticimax slug'larını özel sitede tum-urunler aramasına düşür
      dest = CUSTOM + "/kategori/tum-urunler/";
    }
    location.replace(dest);
  } catch (e) {
    /* sessiz */
  }
})();

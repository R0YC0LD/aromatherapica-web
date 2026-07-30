/**
 * Aromatherapica → Ticimax Dinamik Script (Tam sayfa gömme)
 * --------------------------------------------------------
 * Yönlendirme istemezseniz: aromatherapica.com üzerinde özel siteyi iframe ile gösterir.
 * Admin / Üye / Sepet / Ödeme sayfalarında çalışmaz.
 *
 * Not: Bazı tarayıcılar / güvenlik politikaları iframe'i kısıtlayabilir.
 * Sorun olursa vitrin-yonlendir.js kullanın.
 */
(function () {
  try {
    var path = String(location.pathname || "/").toLowerCase();
    var keep = [
      "/admin",
      "/uyegiris",
      "/uyekayit",
      "/uye/",
      "/sepet",
      "/sepetim",
      "/odeme",
      "/siparis",
      "/servis",
      "/handlers",
    ];
    for (var i = 0; i < keep.length; i++) {
      if (path.indexOf(keep[i]) !== -1) return;
    }
    if (window.__aromIframeBooted) return;
    window.__aromIframeBooted = true;

    var CUSTOM = "https://r0yc0ld.github.io/aromatherapica-web/";
    var style = document.createElement("style");
    style.textContent =
      "html,body{margin:0!important;padding:0!important;overflow:hidden!important;height:100%!important}" +
      "#arom-custom-shell{position:fixed;inset:0;z-index:2147483000;background:#fbfaf7}" +
      "#arom-custom-shell iframe{border:0;width:100%;height:100%;display:block}";
    document.documentElement.appendChild(style);

    var shell = document.createElement("div");
    shell.id = "arom-custom-shell";
    var frame = document.createElement("iframe");
    frame.title = "Aromatherapica";
    frame.src = CUSTOM;
    frame.setAttribute("allow", "payment *; clipboard-write");
    shell.appendChild(frame);

    function mount() {
      document.body.innerHTML = "";
      document.body.appendChild(shell);
    }
    if (document.body) mount();
    else document.addEventListener("DOMContentLoaded", mount);
  } catch (e) {
    /* sessiz */
  }
})();

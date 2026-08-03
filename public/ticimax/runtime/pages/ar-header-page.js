(function (w, d) {
  "use strict";
  var A = w.AROMATHERAPICA;
  if (!A || !A.registerModule) return;
  A.registerModule("header", function (api) {
    api.ready(function () {
      var T = w.AromatherapicaTicimax;
      if (T && typeof T.syncCartCount === "function") {
        T.syncCartCount();
        // Keep badge in sync after Ticimax cart AJAX without inventing cart line items.
        [400, 1200, 3000].forEach(function (ms) {
          w.setTimeout(function () { T.syncCartCount(); }, ms);
        });
        d.addEventListener("click", function (event) {
          var hit = event.target && event.target.closest && event.target.closest(".btnAddToCart, .AddToCart, .Addtobasket, .btnAddBasketOnDetail, [onclick*='AddToCart'], [onclick*='Sepet']");
          if (hit) w.setTimeout(function () { T.syncCartCount(); }, 800);
        }, true);
      }
      d.documentElement.classList.add("ar-header-ready");
    });
  });
})(window, document);

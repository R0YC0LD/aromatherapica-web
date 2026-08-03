(function (w, d) {
  "use strict";
  var A = w.AROMATHERAPICA;
  if (!A || !A.registerModule) return;
  A.registerModule("cart", function (api) {
    api.ready(function () {
      var T = w.AromatherapicaTicimax;
      if (T) {
        T.addPageClass("cart");
        if (typeof T.syncCartCount === "function") T.syncCartCount();
        if (typeof T.labelForms === "function") T.labelForms(d);
      }
      var root = api.dom.findFirst(d, [".sepetimBody", ".CartPage", "[class*='Sepet']", "#divIcerik"]) || d.body;
      root.classList.add("ar-native-cart");
      // Style-only: never rewrite qty inputs, totals, or remove/update handlers.
      root.setAttribute("data-ar-commerce", "native");
    });
  });
})(window, document);

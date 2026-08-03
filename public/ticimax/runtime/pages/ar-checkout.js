(function (w, d) {
  "use strict";
  var A = w.AROMATHERAPICA;
  if (!A || !A.registerModule) return;
  A.registerModule("checkout", function (api) {
    api.ready(function () {
      var T = w.AromatherapicaTicimax;
      if (T) {
        T.addPageClass("checkout");
        if (typeof T.labelForms === "function") {
          var root = api.dom.findFirst(d, [".CheckoutPage", ".OdemePage", "#divIcerik"]) || d.body;
          T.labelForms(root);
        }
      }
      var root = api.dom.findFirst(d, [".CheckoutPage", ".OdemePage", "#divIcerik"]) || d.body;
      root.classList.add("ar-native-checkout");
      root.setAttribute("data-ar-commerce", "native");
      // Never auto-tick contracts, touch payment iframes, or invent shipping totals.
    });
  });
})(window, document);

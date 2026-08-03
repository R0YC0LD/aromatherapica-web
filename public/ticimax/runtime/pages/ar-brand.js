(function (w, d) {
  "use strict";
  var A = w.AROMATHERAPICA;
  if (!A || !A.registerModule) return;
  A.registerModule("brand", function (api) {
    api.ready(function () {
      var T = w.AromatherapicaTicimax;
      if (T) T.addPageClass("brand");
      var root = api.dom.findFirst(d, api.selectors.catalog) || d.body;
      root.classList.add("ar-native-catalog", "ar-native-brand");
      api.products.enhanceRoot(root);
      api.products.observe(root);
      api.dom.findAllUnique(d, api.selectors.sortSelect || ["select[name*='sira' i]", "select[id*='sira' i]", ".categoryTitle select"])
        .forEach(function (select) {
          select.classList.add("ar-sort-select");
          select.setAttribute("data-ar-sort", "true");
        });
    });
  });
})(window, document);

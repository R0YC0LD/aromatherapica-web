(function (w, d) {
  "use strict";
  var A = w.AROMATHERAPICA;
  if (!A || !A.registerModule) return;
  A.registerModule("category", function (api) {
    api.ready(function () {
      var T = w.AromatherapicaTicimax;
      if (T) T.addPageClass("category");
      var root = api.dom.findFirst(d, api.selectors.catalog) || d.body;
      root.classList.add("ar-native-catalog");
      api.products.enhanceRoot(root);
      api.products.observe(root);

      // Mark sort controls so polish CSS can size them without touching options/handlers.
      api.dom.findAllUnique(d, api.selectors.sortSelect || ["select[name*='sira' i]", "select[id*='sira' i]", ".categoryTitle select"])
        .forEach(function (select) {
          select.classList.add("ar-sort-select");
          select.setAttribute("data-ar-sort", "true");
        });

      // Soft-wrap filter drawers: style only, never rewrite filter inputs/names.
      var filterRoots = api.dom.findAllUnique(d, [
        ".LeftFilter", ".leftFilter", ".filtreIcerik", ".productFilter",
        "#divLeftFilter", ".CategoryLeft", ".categoryLeft"
      ]);
      filterRoots.forEach(function (node) {
        node.classList.add("ar-filter-drawer");
        node.setAttribute("data-ar-filter", "safe-wrap");
      });
    });
  });
})(window, document);

(function (w, d) {
  "use strict";
  var A = w.AROMATHERAPICA;
  if (!A || !A.registerModule) return;
  A.registerModule("home", function (api) {
    api.ready(function () {
      var T = w.AromatherapicaTicimax;
      if (T) T.addPageClass("home");
      var root = api.dom.findFirst(d, api.selectors.catalog);
      if (root) {
        api.products.enhanceRoot(root);
        api.products.observe(root);
      }
      // Ensure exact-home class is never left on without a mounted main.
      if (d.body && d.body.classList.contains("ar-exact-home") && !d.getElementById("ar-exact-main")) {
        d.body.classList.remove("ar-exact-home");
        d.documentElement.classList.remove("ar-exact-home");
      }
    });
  });
})(window, document);

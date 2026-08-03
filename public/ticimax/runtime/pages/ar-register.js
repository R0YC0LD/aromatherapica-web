(function (w, d) {
  "use strict";
  var A = w.AROMATHERAPICA;
  if (!A || !A.registerModule) return;
  A.registerModule("register", function (api) {
    api.ready(function () {
      var T = w.AromatherapicaTicimax;
      if (T) {
        T.addPageClass("register");
        if (typeof T.labelForms === "function") T.labelForms(d);
      }
      var root = api.dom.findFirst(d, [".UyeOl", ".registerPage", "#divIcerik"]) || d.body;
      root.classList.add("ar-native-register");
      root.setAttribute("data-ar-commerce", "native");
    });
  });
})(window, document);

(function (w, d) {
  "use strict";
  var A = w.AROMATHERAPICA;
  if (!A || !A.registerModule) return;
  A.registerModule("orderSuccess", function (api) {
    api.ready(function () {
      var T = w.AromatherapicaTicimax;
      if (T) T.addPageClass("order-success");
      var root = api.dom.findFirst(d, ["#divIcerik", ".mainContainer"]) || d.body;
      root.classList.add("ar-native-order-success");
      root.setAttribute("data-ar-commerce", "native");
    });
  });
})(window, document);

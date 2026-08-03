(function (w, d) {
  "use strict";
  var A = w.AROMATHERAPICA;
  if (!A || !A.registerModule) return;
  A.registerModule("registerSuccess", function (api) {
    api.ready(function () {
      var T = w.AromatherapicaTicimax;
      if (T) T.addPageClass("register-success");
      var root = api.dom.findFirst(d, ["#divIcerik", ".mainContainer"]) || d.body;
      root.classList.add("ar-native-register-success");
    });
  });
})(window, document);

(function (window, document) {
  "use strict";

  var DEFAULT_BUILD = "20260802-26";
  var DEFAULT_BASE = "https://r0yc0ld.github.io/aromatherapica-web/ticimax/runtime/";
  var currentScript = document.currentScript;
  var config = window.AROMATHERAPICA_CONFIG || {};
  var page = (currentScript && currentScript.dataset.arPage) || "all";
  var base = config.baseUrl || DEFAULT_BASE;
  function buildRank(value) {
    var match = /^(\d{8})-(\d+)$/.exec(String(value || ""));
    return match ? (Number(match[1]) * 1000) + Number(match[2]) : 0;
  }
  var build = buildRank(config.version) >= buildRank(DEFAULT_BUILD) ? String(config.version) : DEFAULT_BUILD;
  var pages = {
    home: "pages/ar-home-page.js",
    category: "pages/ar-category.js",
    brand: "pages/ar-brand.js",
    "product-detail": "pages/ar-product-detail.js",
    "order-success": "pages/ar-order-success.js",
    cart: "pages/ar-cart-page.js",
    register: "pages/ar-register.js",
    "register-success": "pages/ar-register-success.js",
    header: "pages/ar-header-page.js",
    search: "pages/ar-search.js",
    checkout: "pages/ar-checkout.js"
  };

  var api = window.AROMATHERAPICA = window.AROMATHERAPICA || {
    version: build,
    initialized: false,
    modules: {},
    state: {},
    debug: /[?&]ar_debug=1(?:&|$)/.test(window.location.search)
  };
  api.version = build;
  api.requested = api.requested || {};
  api.requested[page] = true;

  function asset(tag, url, id) {
    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('[data-ar-asset="' + id + '"]');
      if (existing) {
        if (existing.dataset.arLoaded === "1") {
          resolve();
          return;
        }
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      var element = document.createElement(tag);
      element.dataset.arAsset = id;
      if (tag === "link") {
        element.rel = "stylesheet";
        element.href = url;
      } else {
        element.src = url;
        element.defer = true;
      }
      element.addEventListener("load", function () {
        element.dataset.arLoaded = "1";
        resolve();
      }, { once: true });
      element.addEventListener("error", function () {
        reject(new Error("Aromatherapica asset yüklenemedi: " + url));
      }, { once: true });
      document.head.appendChild(element);
    });
  }

  function js(path, id) {
    return asset("script", base + path + "?v=" + encodeURIComponent(build), id);
  }

  function css(path, id) {
    return asset("link", base + path + "?v=" + encodeURIComponent(build), id);
  }

  function log() {
    if (!api.debug || !window.console) return;
    window.console.info.apply(window.console, ["[AR " + build + "]"].concat([].slice.call(arguments)));
  }

  css("ar-global.css", "global-css")
    .then(function () {
      if (page === "home") return css("ar-home.css", "home-css");
      return undefined;
    })
    .then(function () { return css("ar-polish.css", "polish-css"); })
    .then(function () { return js("core/ar-core.js", "core-js"); })
    .then(function () { return js("ar-global.js", "global-js"); })
    .then(function () {
      if (page === "home") {
        return js("ar-home.js", "home-legacy-js")
          .then(function () { return js(pages.home, "page-home-js"); });
      }
      if (page === "all") return undefined;
      if (!pages[page]) {
        log("Bilinmeyen sayfa", page);
        return undefined;
      }
      return js(pages[page], "page-" + page + "-js");
    })
    .then(function () {
      api.initialized = true;
      log("Hazır", page);
    })
    .catch(function (error) {
      api.state.loaderError = String(error && error.message || error);
      if (api.debug && window.console) window.console.error("[AR loader]", error);
    });
})(window, document);

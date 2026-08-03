(function (w, d) {
  "use strict";

  var A = w.AROMATHERAPICA = w.AROMATHERAPICA || { modules: {}, state: {}, observers: {}, cleanups: {} };
  if (A.modules.core && A.modules.core.initialized) return;

  A.registerModule = A.registerModule || function registerModule(name, initializer) {
    if (!name || typeof initializer !== "function") return false;
    A.modules[name] = A.modules[name] || { initializer: initializer, initialized: false };
    if (A.modules[name].initialized) return false;
    try {
      var cleanup = initializer(A);
      A.modules[name].initialized = true;
      if (typeof cleanup === "function") A.cleanups[name] = cleanup;
    } catch (error) {
      A.state.lastModuleError = String(error && error.message || error);
      if (A.debug && w.console) w.console.error("[AR module " + name + "]", error);
    }
    return true;
  };

  A.registerModule("core", function (api) {
    var VERSION = api.version || (api.config && api.config.version) || "20260803-01";
    var S = api.selectors = {
      productCard: [".productItem", ".product-item", ".ItemOrj", ".ProductListContent li[data-id]", "[data-product-id]", "[data-urun-id]"],
      productName: [".productName", ".product-name", ".item-name", "[itemprop='name']"],
      productImage: [".productImage img", ".product-image img", ".image-wrapper img", "img[itemprop='image']"],
      currentPrice: [".discountPriceSpan", ".discountPrice", ".currentPrice", ".current-price", "[itemprop='price']"],
      oldPrice: [".regularPrice", ".old-price", ".list-price"],
      addToCart: [".btnAddToCart", ".AddToCart", ".addToCart", ".add-to-cart", "[data-action='add-to-cart']"],
      favorite: [".favoriteslist", ".favorite", ".addToFavorite", "[data-action='favorite']"],
      catalog: [".ProductListContent", ".ProductList", ".productList", "#divIcerik"],
      cartCount: [".CartProductNumber", ".cart-product-count", ".sepetUrunSayisi", "[class*='SepetUrunSayisi']", "[data-cart-count]"],
      sortSelect: ["select[name*='sira' i]", "select[id*='sira' i]", ".categoryTitle select"]
    };

    function arr(x) { return Array.isArray(x) ? x : [x]; }
    function first(root, selectors) {
      root = root || d;
      for (var i = 0; i < arr(selectors).length; i++) {
        var n = root.querySelector(arr(selectors)[i]);
        if (n) return n;
      }
      return null;
    }
    function all(root, selectors) {
      root = root || d;
      var out = [];
      arr(selectors).forEach(function (s) {
        try {
          root.querySelectorAll(s).forEach(function (n) {
            if (out.indexOf(n) < 0) out.push(n);
          });
        } catch (e) { /* ignore invalid selectors */ }
      });
      return out;
    }
    function text(n) { return n ? (n.textContent || "").replace(/\s+/g, " ").trim() : ""; }
    function attr(n, k) { return n && n.getAttribute ? n.getAttribute(k) || "" : ""; }
    function safeUrl(value) {
      try {
        var u = new URL(value, d.baseURI);
        return /^(https?:)$/.test(u.protocol) || u.origin === location.origin ? u.href : "";
      } catch (e) { return ""; }
    }
    function image(card) {
      var img = first(card, S.productImage);
      if (!img) return "";
      var values = ["data-original", "data-src", "data-lazy", "data-lazy-src", "src"].map(function (k) { return attr(img, k); });
      var set = attr(img, "data-srcset") || attr(img, "srcset");
      if (set) values.unshift(set.split(",").pop().trim().split(/\s+/)[0]);
      for (var i = 0; i < values.length; i++) {
        if (values[i] && !/resim-hazirlaniyor|no-?image|data:image/i.test(values[i])) return safeUrl(values[i]);
      }
      return "";
    }
    function id(card) {
      var detail = first(card, [".productDetail", "[data-id]", "[data-product-id]", "[data-urun-id]"]);
      return attr(detail, "data-id") || attr(card, "data-product-id") || attr(card, "data-urun-id") || "";
    }
    function normalize(card) {
      var name = first(card, S.productName);
      var link = first(card, [".productName a", ".productImage a", "a[itemprop='url']"]);
      var price = first(card, S.currentPrice);
      var old = first(card, S.oldPrice);
      var detail = first(card, [".productDetail", "[data-variant-id]"]);
      return {
        id: id(card),
        name: text(name),
        url: safeUrl(attr(link, "href")),
        image: image(card),
        imageAlt: attr(first(card, S.productImage), "alt") || text(name),
        currentPriceText: text(price),
        oldPriceText: text(old),
        currency: "TRY",
        inStock: !card.matches(".out-of-stock,.tukendi,[data-stock='0']"),
        variantId: attr(detail, "data-variant-id"),
        sourceElement: card,
        addToCart: first(card, S.addToCart),
        favorite: first(card, S.favorite)
      };
    }
    function debounce(fn, wait) {
      var t;
      return function () {
        var a = arguments, c = this;
        clearTimeout(t);
        t = setTimeout(function () { fn.apply(c, a); }, wait);
      };
    }
    function enhance(card) {
      if (!card || card.nodeType !== 1) return;
      if (card.dataset.arEnhanced === "true" && card.dataset.arEnhanceVersion === VERSION) return;
      var p = normalize(card);
      if (!p.name && !p.id) return;
      card.dataset.arEnhanced = "true";
      card.dataset.arEnhanceVersion = VERSION;
      card.dataset.arComponent = "product-card";
      card.classList.add("ar-native-product-card");
      var img = first(card, S.productImage);
      if (img) {
        img.decoding = "async";
        if (!img.alt) img.alt = p.imageAlt || "Ürün görseli";
        if (!img.closest("[data-ar-first-visible]") && !img.loading) img.loading = "lazy";
      }
      if (p.addToCart) {
        p.addToCart.classList.add("ar-native-add-button");
        if (!p.addToCart.getAttribute("aria-label")) p.addToCart.setAttribute("aria-label", p.name + " sepete ekle");
      }
      if (p.favorite && !p.favorite.getAttribute("aria-label")) {
        p.favorite.setAttribute("aria-label", p.name + " favorilere ekle");
      }
    }
    function enhanceRoot(root) {
      all(root || d, S.productCard).forEach(function (card) {
        try { enhance(card); } catch (e) { debug("product-card", e); }
      });
    }
    function observe(root) {
      root = root || first(d, S.catalog);
      if (!root || !w.MutationObserver) return;
      if (root.dataset.arObserved === "true" || api.state.productObserver) {
        enhanceRoot(root);
        return;
      }
      root.dataset.arObserved = "true";
      var run = debounce(function (nodes) {
        nodes.forEach(function (n) {
          if (n.nodeType !== 1) return;
          if (n.matches && S.productCard.some(function (s) {
            try { return n.matches(s); } catch (e) { return false; }
          })) enhance(n);
          else enhanceRoot(n);
        });
      }, 100);
      var o = new MutationObserver(function (ms) {
        var nodes = [];
        ms.forEach(function (m) {
          m.addedNodes.forEach(function (n) { nodes.push(n); });
        });
        if (nodes.length) run(nodes);
      });
      o.observe(root, { childList: true, subtree: true });
      api.state.productObserver = o;
      api.observers.product = o;
    }
    function detect(explicit) {
      if (explicit && explicit !== "all") return explicit;
      if (first(d, [".ProductDetail", ".urunDetay", "[itemtype*='Product']"])) return "product-detail";
      if (first(d, [".CartPage", ".sepetimBody", "[class*='Sepetim']"])) return "cart";
      if (first(d, [".CheckoutPage", ".OdemePage"])) return "checkout";
      var p = location.pathname.toLowerCase();
      if (/arama|search/.test(p)) return "search";
      if (/marka|brand/.test(p)) return "brand";
      if (/kategori|category/.test(p) || first(d, S.catalog)) return "category";
      return "all";
    }
    function debug(scope, error) {
      if (api.debug && w.console) console.warn("[AR " + scope + "]", error);
    }

    api.dom = {
      findFirst: first,
      findAllUnique: all,
      getSafeText: text,
      getSafeAttribute: attr,
      safeUrl: safeUrl,
      debounce: debounce
    };
    api.products = {
      normalize: normalize,
      enhance: enhance,
      enhanceRoot: enhanceRoot,
      observe: observe
    };
    api.detectPage = detect;
    api.debugLog = debug;
    api.ready = function (fn) {
      if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", fn, { once: true });
      else fn();
    };

    // Alias for legacy callers
    w.AromatherapicaTicimax = w.AromatherapicaTicimax || {};

    api.ready(function () {
      enhanceRoot(d);
      var root = first(d, S.catalog);
      if (root) observe(root);
      if (api.debug) {
        console.info("[AR debug]", {
          version: VERSION,
          page: detect(),
          products: all(d, S.productCard).length,
          observer: !!api.state.productObserver,
          modules: Object.keys(api.modules || {}),
          assets: d.querySelectorAll("[data-ar-asset]").length
        });
      }
    });

    return function cleanup() {
      if (api.state.productObserver) {
        api.state.productObserver.disconnect();
        api.state.productObserver = null;
      }
    };
  });
})(window, document);

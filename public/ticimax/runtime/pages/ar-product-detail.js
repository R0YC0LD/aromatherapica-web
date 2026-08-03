(function (w, d) {
  "use strict";
  var A = w.AROMATHERAPICA;
  if (!A || !A.registerModule) return;
  A.registerModule("productDetail", function (api) {
    api.ready(function () {
      var T = w.AromatherapicaTicimax;
      if (T) T.addPageClass("product");
      var root = api.dom.findFirst(d, [".ProductDetail", ".urunDetay", "[itemtype*='Product']", "#divIcerik"]) || d.body;
      root.classList.add("ar-native-product-detail");

      var title = api.dom.getSafeText(api.dom.findFirst(root, [".ProductName h1", ".ProductName", "h1"])) || "Ürün";
      var images = api.dom.findAllUnique(root, [".ProductGallery img", ".leftImage img", "img[itemprop='image']"]);
      var hasRealImage = images.some(function (img) {
        var src = img.currentSrc || img.getAttribute("data-original") || img.getAttribute("data-src") || img.src || "";
        return src && !/resim-hazirlaniyor|no-?image|data:image/i.test(src);
      });
      if (!hasRealImage && images.length) {
        root.classList.add("ar-product-image-missing");
        images.forEach(function (img) { img.alt = title + " ürün görseli hazırlanıyor"; });
      }
      api.products.enhanceRoot(root);

      // Sticky CTA mirrors the native add-to-cart control; never creates a fake cart action.
      var nativeAdd = api.dom.findFirst(root, [
        ".btnAddBasketOnDetail", ".Addtobasket", ".btnAddToCart",
        ".BasketBtn a", ".BasketBtn button", ".buybutton a", ".buybutton button"
      ]);
      if (nativeAdd && !d.getElementById("ar-pdp-sticky") && w.matchMedia && w.matchMedia("(max-width: 900px)").matches) {
        var bar = d.createElement("div");
        bar.id = "ar-pdp-sticky";
        bar.className = "ar-pdp-sticky";
        bar.innerHTML = '<button type="button" class="ar-pdp-sticky-btn" aria-label="' + title + ' sepete ekle">Sepete ekle</button>';
        d.body.appendChild(bar);
        var stickyBtn = bar.querySelector("button");
        stickyBtn.addEventListener("click", function () {
          try { nativeAdd.click(); } catch (e) { /* ignore */ }
          if (T && typeof T.syncCartCount === "function") w.setTimeout(T.syncCartCount, 700);
        });
        // Observe variant / disabled state on the native button and mirror to sticky.
        function syncStickyState() {
          stickyBtn.disabled = !!nativeAdd.disabled || nativeAdd.getAttribute("aria-disabled") === "true";
          stickyBtn.classList.toggle("is-disabled", stickyBtn.disabled);
        }
        syncStickyState();
        if (w.MutationObserver) {
          var obs = new MutationObserver(syncStickyState);
          obs.observe(nativeAdd, { attributes: true, attributeFilter: ["disabled", "class", "aria-disabled"] });
          api.observers.pdpSticky = obs;
        }
      }

      if (T && typeof T.syncCartCount === "function") T.syncCartCount();
    });
  });
})(window, document);

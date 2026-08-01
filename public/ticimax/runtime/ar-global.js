(function (window, document) {
  "use strict";

  if (/\/admin(?:\/|$)/i.test(window.location.pathname || "")) return;
  if (window.AromatherapicaTicimax) return;

  var api = {};
  var cardSelector = [
    ".productItem",
    ".product-item",
    ".ProductListContent li",
    ".productList li",
    "[data-product-id]"
  ].join(",");

  api.ready = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  api.qs = function (selector, root) {
    return (root || document).querySelector(selector);
  };

  api.qsa = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  api.addPageClass = function (name) {
    document.documentElement.classList.add("ar-page-" + name);
    if (document.body) document.body.classList.add("ar-page-" + name);
    var main = api.qs("main, #mainHolder, .mainContainer, #divIcerik");
    if (main) main.setAttribute("data-ar-page", name);
  };

  api.enhanceProductCards = function (root) {
    api.qsa(cardSelector, root).forEach(function (card) {
      if (card.getAttribute("data-ar-enhanced") === "true") return;
      card.setAttribute("data-ar-enhanced", "true");
      card.classList.add("ar-native-product-card");

      var image = api.qs("img", card);
      if (image) {
        image.loading = "lazy";
        image.decoding = "async";
        if (!image.alt) {
          var title = api.qs(".productName, .product-name, .name, h2, h3", card);
          image.alt = title ? title.textContent.trim() : "Aromatherapica ürünü";
        }
      }

      var add = api.qs(
        ".AddToCart, .addToCart, .add-to-cart, [onclick*='AddToCart'], [onclick*='Sepet'], button[id*='Sepet']",
        card
      );
      if (add) {
        add.classList.add("ar-native-add-button");
        if (!add.getAttribute("aria-label")) add.setAttribute("aria-label", "Sepete ekle");
      }

      var favorite = api.qs(
        ".favoriteslist, .favorite, .addToFavorite, [onclick*='Favorite'], [onclick*='Favori']",
        card
      );
      if (favorite) {
        favorite.classList.add("ar-native-favorite");
        if (!favorite.getAttribute("aria-label")) favorite.setAttribute("aria-label", "Favorilere ekle");
      }
    });
  };

  api.observeProducts = function (root) {
    var target = root || document.body;
    if (!target || !window.MutationObserver) return;
    var queued = false;
    var observer = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        api.enhanceProductCards(target);
      });
    });
    observer.observe(target, { childList: true, subtree: true });
  };

  api.syncCartCount = function () {
    var nativeCount = api.qs(
      ".CartProductNumber, .cart-product-count, .sepetUrunSayisi, [class*='SepetUrunSayisi'], [data-cart-count]"
    );
    var count = nativeCount ? (nativeCount.textContent || "0").replace(/\D/g, "") : "0";
    api.qsa("[data-ar-cart-count]").forEach(function (node) {
      node.textContent = count || "0";
    });
  };

  function isVisible(element) {
    if (!element || !element.getClientRects().length) return false;
    var style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && element.offsetWidth > 0;
  }

  function refreshEditor(wrapper) {
    if (!wrapper || !isVisible(wrapper)) return;
    var instance = wrapper.CodeMirror;
    if (!instance) {
      var previous = wrapper.previousElementSibling;
      if (previous && previous.CodeMirror) instance = previous.CodeMirror;
    }
    if (instance && typeof instance.refresh === "function") {
      instance.refresh();
      return;
    }

    if (wrapper.classList.contains("ace_editor") && window.ace) {
      try {
        window.ace.edit(wrapper).resize(true);
        return;
      } catch (ignoreAceError) {}
    }
    window.dispatchEvent(new Event("resize"));
  }

  api.refreshEditors = function (root) {
    var scope = root || document;
    api.qsa(".CodeMirror, .ace_editor, .monaco-editor", scope).forEach(function (wrapper) {
      window.requestAnimationFrame(function () { refreshEditor(wrapper); });
    });
  };

  api.watchEditors = function () {
    var root = document.body;
    if (!root || root.getAttribute("data-ar-editor-watch") === "true") return;
    root.setAttribute("data-ar-editor-watch", "true");

    api.refreshEditors(root);
    window.setTimeout(function () { api.refreshEditors(root); }, 120);
    window.setTimeout(function () { api.refreshEditors(root); }, 600);

    if (window.ResizeObserver) {
      var resizeObserver = new ResizeObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
            api.refreshEditors(entry.target);
          }
        });
      });
      api.qsa(".CodeMirror, .ace_editor, .monaco-editor").forEach(function (editor) {
        resizeObserver.observe(editor);
        if (editor.parentElement) resizeObserver.observe(editor.parentElement);
      });
    }

    if (window.MutationObserver) {
      var mutationObserver = new MutationObserver(function (mutations) {
        var shouldRefresh = mutations.some(function (mutation) {
          return mutation.type === "childList" ||
            (mutation.type === "attributes" &&
              (mutation.attributeName === "class" ||
               mutation.attributeName === "style" ||
               mutation.attributeName === "hidden"));
        });
        if (shouldRefresh) api.refreshEditors(root);
      });
      mutationObserver.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class", "style", "hidden"]
      });
    }

    window.addEventListener("resize", function () { api.refreshEditors(root); }, { passive: true });
  };

  api.labelForms = function (root) {
    api.qsa("input, select, textarea", root).forEach(function (field) {
      if (field.type === "hidden") return;
      var text = (field.getAttribute("placeholder") || field.getAttribute("name") || "").toLowerCase();
      if (!field.getAttribute("autocomplete")) {
        if (text.indexOf("mail") > -1) field.autocomplete = "email";
        else if (text.indexOf("telefon") > -1 || text.indexOf("phone") > -1) field.autocomplete = "tel";
        else if (text.indexOf("ad") > -1 && text.indexOf("soyad") === -1) field.autocomplete = "given-name";
        else if (text.indexOf("soyad") > -1) field.autocomplete = "family-name";
      }
      if (!field.getAttribute("aria-label")) {
        var label = field.id ? api.qs("label[for='" + field.id + "']", root) : null;
        field.setAttribute("aria-label", label ? label.textContent.trim() : (field.placeholder || field.name || "Form alanı"));
      }
    });
  };

  api.buildExactShell = function () {
    document.documentElement.classList.add("ar-exact-shell");
    document.body.classList.add("ar-exact-shell");
    if (document.body.classList.contains("HomeBody")) document.body.classList.add("ar-exact-home");
    var nativeHeader = api.qs("#headerNew");
    if (nativeHeader && !api.qs("#ar-exact-header")) {
      var header = document.createElement("header");
      header.id = "ar-exact-header";
      header.innerHTML = '<div class="ar-topline"><a href="/aromaterapi-yaglari">Saf aromaterapi yağlarını keşfedin →</a><a href="/urunler">Tüm siparişlerde ücretsiz kargo →</a></div><div class="header-main"><nav class="ar-head-nav" aria-label="Ana menü"><button class="ar-head-button" data-ar-menu aria-label="Menüyü aç">☰</button><a href="/aromaterapi-yaglari">Aromaterapi</a><a href="/ozel-bakim-urunleri">Özel Bakım</a><a href="/cilt-bakimi">Cilt Bakımı</a><a href="/hakkimizda">Markamız</a></nav><a class="ar-wordmark" href="/" aria-label="Aromatherapica ana sayfa"><img src="https://r0yc0ld.github.io/aromatherapica-web/aromatherapica-emblem.png" alt=""><span><strong>Aromatherapica</strong><small>Essential Oils &amp; Aromatherapy</small></span></a><div class="ar-head-actions"><button class="ar-head-button" data-ar-search aria-label="Arama yap">⌕</button><a class="ar-head-button ar-account" href="/Hesabim" aria-label="Hesabım">♙</a><a class="ar-head-button" href="/favorilerim" aria-label="İstek listesi">♡</a><a class="ar-head-button" href="/checkout" aria-label="Sepete git">▢</a></div></div><nav class="ar-category-nav" aria-label="Ürün kategorileri"><a href="/aromaterapi-yaglari">Uçucu Yağlar</a><a href="/cilt-bakimi">Cilt Bakımı</a><a href="/ozel-bakim-urunleri">Özel Bakım</a><a href="/sacvevucut-bakimi">Saç Bakımı</a><a href="/sacvevucut-bakimi">Vücut Bakımı</a><a href="/arama?q=gül+suyu">Gül Suları</a><a href="/arama?q=taşıyıcı+yağ">Taşıyıcı Yağlar</a><a href="/arama?q=hediye">Hediye</a></nav>';
      nativeHeader.parentNode.insertBefore(header, nativeHeader);
    }
    if (!api.qs("#ar-shell-panels")) document.body.insertAdjacentHTML("beforeend", '<div id="ar-shell-panels"><button class="ar-shell-scrim" data-ar-close aria-label="Kapat"></button><aside class="ar-shell-drawer" aria-label="Mobil menü"><button class="ar-shell-close" data-ar-close aria-label="Kapat">×</button><nav><a href="/aromaterapi-yaglari">Aromaterapi Yağları</a><a href="/ozel-bakim-urunleri">Özel Bakım</a><a href="/cilt-bakimi">Cilt Bakımı</a><a href="/sacvevucut-bakimi">Saç ve Vücut</a><a href="/hakkimizda">Markamız</a></nav></aside><div class="ar-shell-search" role="dialog" aria-modal="true" aria-label="Ürün ara"><form action="/arama"><input name="q" type="search" placeholder="Ürün veya içerik ara" aria-label="Ürün veya içerik ara"><button>Ara</button></form></div></div>');
    if (!api.qs("#ar-wishlist-dock")) document.body.insertAdjacentHTML("beforeend", '<a id="ar-wishlist-dock" href="/favorilerim" aria-label="İstek listesine git"><span>♡</span> İSTEK LİSTESİ <b>0</b></a>');
    var panels = api.qs("#ar-shell-panels");
    function closePanels() { panels.classList.remove("menu-open", "search-open"); document.body.classList.remove("ar-panel-open"); }
    api.qsa("[data-ar-menu]").forEach(function (button) { button.onclick = function () { closePanels(); panels.classList.add("menu-open"); document.body.classList.add("ar-panel-open"); }; });
    api.qsa("[data-ar-search]").forEach(function (button) { button.onclick = function () { closePanels(); panels.classList.add("search-open"); document.body.classList.add("ar-panel-open"); window.setTimeout(function () { var input = api.qs("input", panels); if (input) input.focus(); }, 80); }; });
    api.qsa("[data-ar-close]", panels).forEach(function (button) { button.onclick = closePanels; });
    document.addEventListener("keydown", function (event) { if (event.key === "Escape") closePanels(); });
    var count = api.qs(".favoritesCount, .favoriteCount, #spanFavoriSayisi, [class*='favori'] .count");
    if (count) api.qs("#ar-wishlist-dock b").textContent = (count.textContent.match(/\d+/) || ["0"])[0];
  };

  api.scheduleNewsletter = function (attempt) {
    var popup = api.qs("#ozel-popup-overlay");
    if (!popup) {
      if ((attempt || 0) < 20) window.setTimeout(function () { api.scheduleNewsletter((attempt || 0) + 1); }, 250);
      return;
    }
    popup.classList.remove("ar-popup-visible");
    var key = "ar-newsletter-dismissed";
    function close() { popup.classList.remove("ar-popup-visible"); try { sessionStorage.setItem(key, "1"); } catch (ignore) {} }
    api.qsa("#ozel-popup-kapat, #popup-hayir, [data-popup-close], .popup-kapat", popup).forEach(function (button) { button.addEventListener("click", close); });
    window.setTimeout(function () { var dismissed = false; try { dismissed = sessionStorage.getItem(key) === "1"; } catch (ignore) {} if (!dismissed) popup.classList.add("ar-popup-visible"); }, 6500);
  };

  window.AromatherapicaTicimax = api;

  api.ready(function () {
    var path = (window.location.pathname || "").toLowerCase();
    if (path.indexOf("hesabim") > -1 || path.indexOf("uyelik") > -1) api.addPageClass("account");
    if (path.indexOf("favori") > -1) api.addPageClass("favorites");
    api.watchEditors();
    api.buildExactShell();
    api.scheduleNewsletter();
    api.syncCartCount();
    api.enhanceProductCards(document);
    if (api.qs(cardSelector)) api.observeProducts(document.body);
  });
})(window, document);

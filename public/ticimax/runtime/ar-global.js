(function (window, document) {
  "use strict";

  (function ensureFreshStyles() {
    if (document.querySelector('link[data-ar-runtime="global-v4"],link[data-ar-asset="global-css"]')) return;
    var script = document.currentScript;
    var base = script && script.src ? script.src.replace(/ar-global\.js.*$/i, "") : "https://r0yc0ld.github.io/aromatherapica-web/ticimax/runtime/";
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = base + "ar-global.css?v=20260801-11";
    link.setAttribute("data-ar-runtime", "global-v4");
    document.head.appendChild(link);
    var polish = document.createElement("link");
    polish.rel = "stylesheet";
    polish.href = base + "ar-polish.css?v=20260801-11";
    polish.setAttribute("data-ar-runtime", "polish-v11");
    document.head.appendChild(polish);
  })();

  if (/\/admin(?:\/|$)/i.test(window.location.pathname || "")) return;
  var RUNTIME_VERSION = "20260801.11";
  if (window.__AR_GLOBAL_RUNTIME_VERSION__ === RUNTIME_VERSION) return;
  window.__AR_GLOBAL_RUNTIME_VERSION__ = RUNTIME_VERSION;

  var api = window.AromatherapicaTicimax || {};
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
      header.innerHTML = '<div class="ar-topline"><a href="/aromaterapi-yaglari">Saf aromaterapi yağlarını keşfedin <span>→</span></a><a href="/urunler">Tüm siparişlerde ücretsiz kargo <span>→</span></a></div><div class="header-main"><nav class="ar-head-nav" aria-label="Ana menü"><button type="button" class="ar-head-button" data-ar-menu aria-label="Menüyü aç"><i class="ar-i ar-i-menu"></i></button><a href="/aromaterapi-yaglari">Aromaterapi</a><a href="/ozel-bakim-urunleri">Özel Bakım</a><a href="/cilt-bakimi">Cilt Bakımı</a><a href="/hakkimizda">Markamız</a></nav><a class="ar-wordmark" href="/" aria-label="Aromatherapica ana sayfa"><img src="https://r0yc0ld.github.io/aromatherapica-web/aromatherapica-emblem.png" alt=""><span><strong>Aromatherapica</strong><small>Essential Oils &amp; Aromatherapy</small></span></a><div class="ar-head-actions"><button type="button" class="ar-head-button" data-ar-search aria-label="Arama yap"><i class="ar-i ar-i-search"></i></button><a class="ar-head-button ar-account" href="/Hesabim" aria-label="Hesabım"><i class="ar-i ar-i-user"></i></a><a class="ar-head-button" href="/favorilerim" aria-label="İstek listesi"><i class="ar-i ar-i-heart"></i></a><button type="button" class="ar-head-button" data-ar-cart aria-label="Sepeti aç"><i class="ar-i ar-i-bag"></i><b class="ar-cart-badge">0</b></button></div></div><nav class="ar-category-nav" aria-label="Ürün kategorileri"><a href="/aromaterapi-yaglari">Uçucu Yağlar</a><a href="/cilt-bakimi">Cilt Bakımı</a><a href="/ozel-bakim-urunleri">Özel Bakım</a><a href="/sacvevucut-bakimi">Saç Bakımı</a><a href="/sacvevucut-bakimi">Vücut Bakımı</a><a href="/arama?q=gül+suyu">Gül Suları</a><a href="/arama?q=taşıyıcı+yağ">Taşıyıcı Yağlar</a><a href="/arama?q=hediye">Hediye</a></nav>';
      nativeHeader.parentNode.insertBefore(header, nativeHeader);
    }
    var exactHeader = api.qs("#ar-exact-header");
    if (exactHeader && exactHeader.parentNode !== document.body) document.body.insertBefore(exactHeader, document.body.firstChild);
    if (!api.qs("#ar-shell-panels")) document.body.insertAdjacentHTML("beforeend", '<div id="ar-shell-panels"><button class="ar-shell-scrim" data-ar-close aria-label="Kapat"></button><aside class="ar-shell-drawer" aria-label="Alışveriş menüsü"><header><strong>KEŞFET</strong><button class="ar-shell-close" data-ar-close aria-label="Kapat"><i class="ar-i ar-i-close"></i></button></header><nav><section><button data-ar-accordion>Aromaterapi Yağları <i class="ar-i ar-i-plus"></i></button><div><a href="/aromaterapi-yaglari">Tüm Aromaterapi</a><a href="/arama?q=uçucu+yağ">Uçucu Yağlar</a><a href="/arama?q=taşıyıcı+yağ">Taşıyıcı Yağlar</a><a href="/arama?q=gül+suyu">Gül Suları</a></div></section><section><button data-ar-accordion>Cilt Bakımı <i class="ar-i ar-i-plus"></i></button><div><a href="/cilt-bakimi">Tüm Cilt Bakımı</a><a href="/arama?q=serum">Serumlar</a><a href="/arama?q=krem">Bakım Kremleri</a><a href="/arama?q=temizleme">Temizleme</a></div></section><section><button data-ar-accordion>Saç ve Vücut <i class="ar-i ar-i-plus"></i></button><div><a href="/sacvevucut-bakimi">Tümünü Gör</a><a href="/arama?q=saç">Saç Bakımı</a><a href="/arama?q=vücut">Vücut Bakımı</a></div></section><a class="ar-menu-direct" href="/ozel-bakim-urunleri">Özel Bakım</a><a class="ar-menu-direct" href="/arama?q=hediye">Hediye Seçenekleri</a><a class="ar-menu-direct" href="/hakkimizda">Markamız</a></nav></aside><div class="ar-shell-search" role="dialog" aria-modal="true" aria-label="Ürün ara"><header><strong>ARAMA</strong><button class="ar-shell-close" data-ar-close aria-label="Kapat"><i class="ar-i ar-i-close"></i></button></header><form action="/arama"><i class="ar-i ar-i-search"></i><input name="q" type="search" placeholder="Ürün veya içerik ara" aria-label="Ürün veya içerik ara"><button>Ara</button></form><div class="ar-search-chips"><a href="/arama?q=lavanta">Lavanta</a><a href="/arama?q=biberiye">Biberiye</a><a href="/arama?q=gül+suyu">Gül Suyu</a><a href="/arama?q=cilt+bakımı">Cilt Bakımı</a></div></div><aside class="ar-cart-drawer" aria-label="Sepet"><header><strong>SEPETİM</strong><button class="ar-shell-close" data-ar-close aria-label="Kapat"><i class="ar-i ar-i-close"></i></button></header><div class="ar-cart-copy"><i class="ar-i ar-i-bag"></i><h2>Sepetiniz sizi bekliyor</h2><p>Ürünleriniz Ticimax sepetinde güvenle saklanır.</p><a href="/checkout">SEPETE GİT</a></div></aside></div>');
    if (!api.qs("#ar-wishlist-dock")) document.body.insertAdjacentHTML("beforeend", '<a id="ar-wishlist-dock" href="/favorilerim" aria-label="İstek listesine git"><i class="ar-i ar-i-heart"></i> İSTEK LİSTESİ <b>0</b></a>');
    var panels = api.qs("#ar-shell-panels");
    api.qsa("[data-ar-menu],[data-ar-search],[data-ar-cart],[data-ar-close],[data-ar-accordion]", document).forEach(function (button) {
      if (button.tagName === "BUTTON") button.type = "button";
      if (button.hasAttribute("data-ar-accordion") && !button.hasAttribute("aria-expanded")) button.setAttribute("aria-expanded", "false");
    });
    function closePanels() { panels.classList.remove("menu-open", "search-open", "cart-open"); document.body.classList.remove("ar-panel-open"); }
    api.qsa("[data-ar-menu]").forEach(function (button) { button.onclick = function () { closePanels(); panels.classList.add("menu-open"); document.body.classList.add("ar-panel-open"); }; });
    api.qsa("[data-ar-search]").forEach(function (button) { button.onclick = function () { closePanels(); panels.classList.add("search-open"); document.body.classList.add("ar-panel-open"); window.setTimeout(function () { var input = api.qs("input", panels); if (input) input.focus(); }, 80); }; });
    api.qsa("[data-ar-cart]").forEach(function (button) { button.onclick = function () { closePanels(); panels.classList.add("cart-open"); document.body.classList.add("ar-panel-open"); }; });
    api.qsa("[data-ar-close]", panels).forEach(function (button) { button.onclick = closePanels; });
    if (!window.__AR_V4_PANEL_EVENTS__) {
      window.__AR_V4_PANEL_EVENTS__ = true;
      document.addEventListener("click", function (event) {
        var trigger = event.target.closest && event.target.closest("[data-ar-menu],[data-ar-search],[data-ar-cart],[data-ar-close],[data-ar-accordion]");
        if (!trigger) return;
        event.preventDefault();
        event.stopPropagation();
        var shell = api.qs("#ar-shell-panels");
        if (!shell) return;
        if (trigger.hasAttribute("data-ar-close")) { shell.className = ""; document.body.classList.remove("ar-panel-open"); return; }
        if (trigger.hasAttribute("data-ar-accordion")) {
          var group = trigger.parentNode;
          var opening = !group.classList.contains("is-open");
          api.qsa("section.is-open", group.parentNode).forEach(function (open) { open.classList.remove("is-open"); var control = api.qs("[data-ar-accordion]", open); if (control) control.setAttribute("aria-expanded", "false"); });
          group.classList.toggle("is-open", opening);
          trigger.setAttribute("aria-expanded", opening ? "true" : "false");
          return;
        }
        shell.className = trigger.hasAttribute("data-ar-menu") ? "menu-open" : trigger.hasAttribute("data-ar-search") ? "search-open" : "cart-open";
        document.body.classList.add("ar-panel-open");
      });
    }
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
    api.qsa("#ozel-popup-kapat, #popup-hayir, #popup-hayir-buton, [data-popup-close], .popup-kapat", popup).forEach(function (button) { button.addEventListener("click", close); });
    window.setTimeout(function () { var dismissed = false; try { dismissed = sessionStorage.getItem(key) === "1"; } catch (ignore) {} if (!dismissed) popup.classList.add("ar-popup-visible"); }, 6500);
  };

  api.fixWishlistLinks = function (root) {
    api.qsa('a[href="/favorilerim"],a[href$="/favorilerim"]', root || document).forEach(function (link) {
      link.setAttribute("href", "/Hesabim.aspx#/Favorilerim");
    });
  };

  /*
   * Keep the visual catalogue button, but delegate the transaction to
   * Ticimax's own button. This preserves stock, variant, campaign and cart
   * rules instead of duplicating any commerce logic in the theme layer.
   */
  api.bridgeCatalogAddButtons = function () {
    if (document.documentElement.getAttribute("data-ar-cart-bridge") === "true") return;
    document.documentElement.setAttribute("data-ar-cart-bridge", "true");
    document.addEventListener("click", function (event) {
      var visualButton = event.target.closest && event.target.closest(".ny-add-to-cart");
      if (!visualButton) return;
      var card = visualButton.closest(".productItem,.ItemOrj,.ar-native-product-card");
      var nativeButton = card && card.querySelector(".btnAddToCart,.Addtobasket,.addBasket,.ar-native-add-button");
      if (!nativeButton || nativeButton === visualButton) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      nativeButton.click();
    }, true);
  };

  api.enableSmartHeader = function () {
    var header = api.qs("#ar-exact-header");
    if (!header || header.getAttribute("data-ar-smart-header") === "true") return;
    header.setAttribute("data-ar-smart-header", "true");
    var lastY = Math.max(0, window.scrollY || 0);
    var ticking = false;
    function update() {
      var y = Math.max(0, window.scrollY || 0);
      var delta = y - lastY;
      if (y < 80 || delta < -8 || document.body.classList.contains("ar-panel-open")) header.classList.remove("is-scroll-hidden");
      else if (delta > 8 && y > 180) header.classList.add("is-scroll-hidden");
      header.classList.toggle("is-compact", y > 40);
      lastY = y;
      ticking = false;
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }, { passive: true });
  };

  window.AromatherapicaTicimax = api;

  api.ready(function () {
    var path = (window.location.pathname || "").toLowerCase();
    if (/hesabim|uyelik|uyegiris|uyeol|sifremi/.test(path)) api.addPageClass("account");
    if (path.indexOf("favori") > -1) api.addPageClass("favorites");
    api.watchEditors();
    api.buildExactShell();
    api.fixWishlistLinks(document);
    api.bridgeCatalogAddButtons();
    api.enableSmartHeader();
    api.scheduleNewsletter();
    api.syncCartCount();
    api.enhanceProductCards(document);
    if (api.qs(cardSelector)) api.observeProducts(document.body);
  });
})(window, document);

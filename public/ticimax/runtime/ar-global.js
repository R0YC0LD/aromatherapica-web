(function (window, document) {
  "use strict";

  (function ensureFreshStyles() {
    // Loader owns CSS. Only inject if neither loader nor prior runtime marked assets exist.
    if (document.querySelector('link[data-ar-asset="global-css"],link[data-ar-asset="polish-css"],link[data-ar-runtime="global-v4"]')) return;
    var script = document.currentScript;
    var base = script && script.src ? script.src.replace(/ar-global\.js.*$/i, "") : "https://r0yc0ld.github.io/aromatherapica-web/ticimax/runtime/";
    var configuredBuild = window.AROMATHERAPICA_CONFIG && String(window.AROMATHERAPICA_CONFIG.version || "");
    var buildMatch = /^(\d{8})-(\d+)$/.exec(configuredBuild || "");
    var build = buildMatch ? configuredBuild : "20260803-02";
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = base + "ar-global.css?v=" + encodeURIComponent(build);
    link.setAttribute("data-ar-runtime", "global-v4");
    link.setAttribute("data-ar-asset", "global-css");
    document.head.appendChild(link);
    var polish = document.createElement("link");
    polish.rel = "stylesheet";
    polish.href = base + "ar-polish.css?v=" + encodeURIComponent(build);
    polish.setAttribute("data-ar-runtime", "polish-v4");
    polish.setAttribute("data-ar-asset", "polish-css");
    document.head.appendChild(polish);
  })();

  if (/\/admin(?:\/|$)/i.test(window.location.pathname || "")) return;
  var RUNTIME_VERSION = "20260803-02";
  if (window.__AR_GLOBAL_RUNTIME_VERSION__ === RUNTIME_VERSION) return;
  window.__AR_GLOBAL_RUNTIME_VERSION__ = RUNTIME_VERSION;

  var api = window.AromatherapicaTicimax || {};
  // Verified against live aromatherapica.com (2026-08-03). brandStory/legal pages
  // must be created in Ticimax panel — do not point them at "/" or "#".
  var AR_ROUTES = api.routes = {
    home: "/",
    brandStory: "/hakkimizda",
    cart: "/checkout",
    account: "/Hesabim",
    login: "/UyeGiris",
    register: "/UyeOl",
    forgotPassword: "/SifremiUnuttum",
    wishlist: "/Hesabim.aspx#/Favorilerim",
    contact: "/iletisim",
    blog: "/blog",
    aromatherapy: "/aromaterapi-yaglari",
    skinCare: "/cilt-bakimi",
    specialCare: "/ozel-bakim-urunleri",
    hairBody: "/sacvevucut-bakimi",
    // No /gul-sulari category exists yet; products currently list under skinCare.
    // After panel creates the category, change this to "/gul-sulari".
    gulWaters: "/Arama?q=g%C3%BCl+suyu",
    search: "/Arama",
    faq: "/sikca-sorulan-sorular",
    shipping: "/kargo-ve-teslimat",
    returns: "/iade-ve-degisim",
    kvkk: "/kvkk",
    terms: "/kullanim-kosullari",
    cookies: "/cerez-politikasi",
    contents: "/iceriklerimiz"
  };
  if (window.AROMATHERAPICA) window.AROMATHERAPICA.routes = AR_ROUTES;

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
        favorite.setAttribute("data-ar-fixed", "favorite");
        if (!favorite.getAttribute("aria-label")) favorite.setAttribute("aria-label", "Favorilere ekle");
        if (!favorite.getAttribute("aria-pressed")) favorite.setAttribute("aria-pressed", "false");
        // Keep a single visible heart: strip nested decorative icons/images.
        api.qsa("img, svg, i, span.icon, .fa, .icon", favorite).forEach(function (node) {
          node.setAttribute("aria-hidden", "true");
          node.classList.add("ar-favorite-hide");
        });
      }
    });
  };

  api.observeProducts = function (root) {
    // Single authority: prefer ar-core product observer; never attach a second body-wide observer.
    var A = window.AROMATHERAPICA;
    if (A && A.products && typeof A.products.observe === "function") {
      A.products.enhanceRoot(root || document);
      A.products.observe(root);
      return;
    }
    var target = root || document.body;
    if (!target || !window.MutationObserver || target.getAttribute("data-ar-product-observed") === "true") return;
    target.setAttribute("data-ar-product-observed", "true");
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
    api.qsa("[data-ar-cart-count], .ar-cart-badge").forEach(function (node) {
      node.textContent = count || "0";
    });
    if (nativeCount && window.MutationObserver && api.cartCountNode !== nativeCount) {
      if (api.cartCountObserver) api.cartCountObserver.disconnect();
      api.cartCountNode = nativeCount;
      api.cartCountObserver = new MutationObserver(function () { api.syncCartCount(); });
      api.cartCountObserver.observe(nativeCount, { childList: true, characterData: true, subtree: true });
    }
  };

  api.scheduleCartSync = function () {
    [80, 350, 900, 1800].forEach(function (delay) {
      window.setTimeout(api.syncCartCount, delay);
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
    // Only watch editors on admin / script management surfaces — not the full storefront body.
    var path = (window.location.pathname || "").toLowerCase();
    var isEditorSurface = /admin|script|dinamik|tasarim|editor/i.test(path) ||
      !!api.qs(".CodeMirror, .ace_editor, .monaco-editor, textarea[id*='txtbxJs'], textarea[id*='Script']");
    if (!isEditorSurface) return;
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
    // Never hide native home content here. ar-home.js adds ar-exact-home
    // only after #ar-exact-main is successfully mounted.
    var R = AR_ROUTES;
    var nativeHeader = api.qs("#headerNew");
    if (nativeHeader && !api.qs("#ar-exact-header")) {
      var header = document.createElement("header");
      header.id = "ar-exact-header";
      header.innerHTML =
        '<div class="ar-topline"><a href="' + R.aromatherapy + '">Saf aromaterapi yağlarını keşfedin <span>→</span></a><a href="' + R.aromatherapy + '">Özenli bakım, güvenli alışveriş <span>→</span></a></div>' +
        '<div class="header-main"><nav class="ar-head-nav" aria-label="Ana menü">' +
          '<button type="button" class="ar-head-button" data-ar-menu aria-label="Menüyü aç"><i class="ar-i ar-i-menu"></i></button>' +
          '<a href="' + R.aromatherapy + '">Aromaterapi</a><a href="' + R.specialCare + '">Özel Bakım</a><a href="' + R.skinCare + '">Cilt Bakımı</a><a href="' + R.brandStory + '">Markamız</a>' +
        '</nav><a class="ar-wordmark" href="' + R.home + '" aria-label="Aromatherapica ana sayfa"><img src="https://r0yc0ld.github.io/aromatherapica-web/aromatherapica-emblem.png" alt=""><span><strong>Aromatherapica</strong><small>Essential Oils &amp; Aromatherapy</small></span></a>' +
        '<div class="ar-head-actions"><button type="button" class="ar-head-button" data-ar-search aria-label="Arama yap"><i class="ar-i ar-i-search"></i></button>' +
          '<a class="ar-head-button ar-account" href="' + R.account + '" aria-label="Hesabım"><i class="ar-i ar-i-user"></i></a>' +
          '<a class="ar-head-button" href="' + R.wishlist + '" aria-label="Favorilerim"><i class="ar-i ar-i-heart"></i></a>' +
          '<button type="button" class="ar-head-button" data-ar-cart aria-label="Sepeti aç"><i class="ar-i ar-i-bag"></i><b class="ar-cart-badge">0</b></button></div></div>' +
        '<nav class="ar-category-nav" aria-label="Ürün kategorileri">' +
          '<a href="' + R.aromatherapy + '">Uçucu Yağlar</a><a href="' + R.skinCare + '">Cilt Bakımı</a><a href="' + R.specialCare + '">Özel Bakım</a>' +
          '<a href="' + R.hairBody + '">Saç Bakımı</a><a href="' + R.hairBody + '">Vücut Bakımı</a>' +
          '<a href="' + R.gulWaters + '">Gül Suları</a><a href="' + R.search + '?q=ta%C5%9F%C4%B1y%C4%B1c%C4%B1+ya%C4%9F">Taşıyıcı Yağlar</a><a href="' + R.search + '?q=hediye">Hediye</a>' +
        "</nav>";
      nativeHeader.parentNode.insertBefore(header, nativeHeader);
    }
    var exactHeader = api.qs("#ar-exact-header");
    if (exactHeader && exactHeader.parentNode !== document.body) document.body.insertBefore(exactHeader, document.body.firstChild);
    if (!api.qs("#ar-shell-panels")) {
      document.body.insertAdjacentHTML("beforeend",
        '<div id="ar-shell-panels" data-ar-fixed="mobile-menu">' +
          '<button type="button" class="ar-shell-scrim" data-ar-close aria-label="Kapat"></button>' +
          '<aside class="ar-shell-drawer" aria-label="Alışveriş menüsü"><header><strong>KEŞFET</strong><button type="button" class="ar-shell-close" data-ar-close aria-label="Kapat"><i class="ar-i ar-i-close"></i></button></header>' +
          '<nav>' +
            '<section><button type="button" data-ar-accordion aria-expanded="false"><span class="ar-menu-acc-label">Aromaterapi Yağları</span><i class="ar-i ar-i-plus" aria-hidden="true"></i></button>' +
              '<div><a href="' + R.aromatherapy + '">Tüm Aromaterapi</a><a href="' + R.search + '?q=u%C3%A7ucu+ya%C4%9F">Uçucu Yağlar</a><a href="' + R.search + '?q=ta%C5%9F%C4%B1y%C4%B1c%C4%B1+ya%C4%9F">Taşıyıcı Yağlar</a><a href="' + R.gulWaters + '">Gül Suları</a></div></section>' +
            '<section><button type="button" data-ar-accordion aria-expanded="false"><span class="ar-menu-acc-label">Cilt Bakımı</span><i class="ar-i ar-i-plus" aria-hidden="true"></i></button>' +
              '<div><a href="' + R.skinCare + '">Tüm Cilt Bakımı</a><a href="' + R.search + '?q=serum">Serumlar</a><a href="' + R.search + '?q=krem">Bakım Kremleri</a><a href="' + R.search + '?q=temizleme">Temizleme</a></div></section>' +
            '<section><button type="button" data-ar-accordion aria-expanded="false"><span class="ar-menu-acc-label">Saç ve Vücut</span><i class="ar-i ar-i-plus" aria-hidden="true"></i></button>' +
              '<div><a href="' + R.hairBody + '">Tümünü Gör</a><a href="' + R.search + '?q=sa%C3%A7">Saç Bakımı</a><a href="' + R.search + '?q=v%C3%BCcut">Vücut Bakımı</a></div></section>' +
            '<a class="ar-menu-direct" href="' + R.specialCare + '">Özel Bakım</a>' +
            '<a class="ar-menu-direct" href="' + R.search + '?q=hediye">Hediye Seçenekleri</a>' +
            '<a class="ar-menu-direct" href="' + R.brandStory + '">Markamız</a>' +
            '<a class="ar-menu-direct" href="' + R.wishlist + '">Favorilerim</a>' +
          '</nav></aside>' +
          '<div class="ar-shell-search" role="dialog" aria-modal="true" aria-label="Ürün ara"><header><strong>ARAMA</strong><button type="button" class="ar-shell-close" data-ar-close aria-label="Kapat"><i class="ar-i ar-i-close"></i></button></header>' +
            '<form action="' + R.search + '"><i class="ar-i ar-i-search"></i><input name="q" type="search" placeholder="Ürün veya içerik ara" aria-label="Ürün veya içerik ara"><button type="submit">Ara</button></form>' +
            '<div class="ar-search-chips"><a href="' + R.search + '?q=lavanta">Lavanta</a><a href="' + R.search + '?q=biberiye">Biberiye</a><a href="' + R.gulWaters + '">Gül Suyu</a><a href="' + R.skinCare + '">Cilt Bakımı</a></div></div>' +
          '<aside class="ar-cart-drawer" aria-label="Sepet"><header><strong>SEPETİM</strong><button type="button" class="ar-shell-close" data-ar-close aria-label="Kapat"><i class="ar-i ar-i-close"></i></button></header>' +
            '<div class="ar-cart-copy"><i class="ar-i ar-i-bag"></i><h2>Sepetiniz sizi bekliyor</h2><p>Ürünleriniz Ticimax sepetinde güvenle saklanır.</p><a href="' + R.cart + '">SEPETE GİT</a></div></aside>' +
        "</div>"
      );
    }
    if (!api.qs("#ar-wishlist-dock")) {
      document.body.insertAdjacentHTML("beforeend",
        '<a id="ar-wishlist-dock" href="' + R.wishlist + '" aria-label="Favorilerim"><i class="ar-i ar-i-heart"></i> Favorilerim <b>0</b></a>'
      );
    }
    var panels = api.qs("#ar-shell-panels");
    function closePanels() {
      if (!panels) return;
      panels.classList.remove("menu-open", "search-open", "cart-open");
      document.body.classList.remove("ar-panel-open", "panel-open");
      document.documentElement.classList.remove("ar-panel-open");
    }
    // Always start closed (membership/account pages were keeping overlay open).
    closePanels();
    api.qsa("[data-ar-menu],[data-ar-search],[data-ar-cart],[data-ar-close],[data-ar-accordion]", document).forEach(function (button) {
      if (button.tagName === "BUTTON") button.type = "button";
      if (button.hasAttribute("data-ar-accordion") && !button.hasAttribute("aria-expanded")) button.setAttribute("aria-expanded", "false");
    });
    api.qsa("[data-ar-menu]").forEach(function (button) {
      button.onclick = function () { closePanels(); panels.classList.add("menu-open"); document.body.classList.add("ar-panel-open"); };
    });
    api.qsa("[data-ar-search]").forEach(function (button) {
      button.onclick = function () {
        closePanels();
        panels.classList.add("search-open");
        document.body.classList.add("ar-panel-open");
        window.setTimeout(function () { var input = api.qs("input", panels); if (input) input.focus(); }, 80);
      };
    });
    api.qsa("[data-ar-cart]").forEach(function (button) {
      button.onclick = function () { closePanels(); panels.classList.add("cart-open"); document.body.classList.add("ar-panel-open"); };
    });
    api.qsa("[data-ar-close]", panels).forEach(function (button) { button.onclick = closePanels; });
    if (!window.__AR_V4_PANEL_EVENTS__) {
      window.__AR_V4_PANEL_EVENTS__ = true;
      document.addEventListener("click", function (event) {
        var trigger = event.target.closest && event.target.closest("[data-ar-menu],[data-ar-search],[data-ar-cart],[data-ar-close],[data-ar-accordion]");
        var shell = api.qs("#ar-shell-panels");
        if (!shell) return;
        if (!trigger) {
          // Outside click closes open panels (except clicks inside open drawers).
          if (!document.body.classList.contains("ar-panel-open")) return;
          if (event.target.closest && event.target.closest(".ar-shell-drawer, .ar-shell-search, .ar-cart-drawer, [data-ar-menu], [data-ar-search], [data-ar-cart]")) return;
          closePanels();
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (trigger.hasAttribute("data-ar-close")) { closePanels(); return; }
        if (trigger.hasAttribute("data-ar-accordion")) {
          var group = trigger.parentNode;
          var opening = !group.classList.contains("is-open");
          api.qsa("section.is-open", group.parentNode).forEach(function (open) {
            open.classList.remove("is-open");
            var control = api.qs("[data-ar-accordion]", open);
            if (control) control.setAttribute("aria-expanded", "false");
          });
          group.classList.toggle("is-open", opening);
          trigger.setAttribute("aria-expanded", opening ? "true" : "false");
          return;
        }
        shell.classList.remove("menu-open", "search-open", "cart-open");
        if (trigger.hasAttribute("data-ar-menu")) shell.classList.add("menu-open");
        else if (trigger.hasAttribute("data-ar-search")) shell.classList.add("search-open");
        else shell.classList.add("cart-open");
        document.body.classList.add("ar-panel-open");
      });
      document.addEventListener("keydown", function (event) { if (event.key === "Escape") closePanels(); });
      window.addEventListener("pageshow", closePanels);
      window.addEventListener("popstate", closePanels);
    }
    var count = api.qs(".favoritesCount, .favoriteCount, #spanFavoriSayisi, [class*='favori'] .count");
    var dockBadge = api.qs("#ar-wishlist-dock b");
    if (count && dockBadge) dockBadge.textContent = (count.textContent.match(/\d+/) || ["0"])[0];
  };

  api.scheduleNewsletter = function (attempt) {
    var popup = api.qs("#ozel-popup-overlay");
    if (!popup) {
      if ((attempt || 0) < 20) window.setTimeout(function () { api.scheduleNewsletter((attempt || 0) + 1); }, 250);
      return;
    }
    popup.classList.remove("ar-popup-visible");
    var key = "ar-newsletter-dismissed";
    function close() {
      api.qsa("#ozel-popup-overlay").forEach(function (current) { current.classList.remove("ar-popup-visible"); });
      document.documentElement.classList.add("ar-popup-dismissed");
      try { sessionStorage.setItem(key, "1"); } catch (ignore) {}
    }
    try {
      if (sessionStorage.getItem(key) === "1") {
        document.documentElement.classList.add("ar-popup-dismissed");
        return;
      }
    } catch (ignore) {}
    api.qsa("#ozel-popup-kapat, #popup-hayir, #popup-hayir-buton, [data-popup-close], .popup-kapat", popup).forEach(function (button) { button.addEventListener("click", close); });
    if (!window.__AR_NEWSLETTER_CLOSE_EVENTS__) {
      window.__AR_NEWSLETTER_CLOSE_EVENTS__ = true;
      document.addEventListener("click", function (event) {
        var button = event.target.closest && event.target.closest("#ozel-popup-kapat, #popup-hayir, #popup-hayir-buton, [data-popup-close], .popup-kapat");
        if (!button) return;
        event.preventDefault();
        close();
      }, true);
      document.addEventListener("keydown", function (event) { if (event.key === "Escape") close(); });
    }
    window.setTimeout(function () {
      var dismissed = false;
      try { dismissed = sessionStorage.getItem(key) === "1"; } catch (ignore) {}
      var current = api.qs("#ozel-popup-overlay");
      if (!dismissed && current) current.classList.add("ar-popup-visible");
    }, 6500);
  };

  /*
   * Ticimax injects the member profile after the hash route changes and its
   * class names vary between theme generations. Detect the native form from
   * its field labels, add layout hooks only, and leave all form controls,
   * names, values and submit handlers untouched.
   */
  api.enhanceMemberProfile = function (root) {
    if (!/hesabim|uyelik/i.test(window.location.pathname || "")) return;
    var searchRoot = root && root.querySelectorAll ? root : document;
    function normalized(value) {
      var text = String(value || "");
      try { return text.toLocaleLowerCase("tr-TR"); } catch (ignore) { return text.toLowerCase(); }
    }
    function directChild(ancestor, node) {
      var current = node;
      while (current && current.parentElement && current.parentElement !== ancestor) current = current.parentElement;
      return current && current.parentElement === ancestor ? current : null;
    }
    function commonAncestor(first, second) {
      var parents = [];
      var current = first;
      while (current) { parents.push(current); current = current.parentElement; }
      current = second;
      while (current) { if (parents.indexOf(current) > -1) return current; current = current.parentElement; }
      return null;
    }
    var labels = ["adınız", "soyadınız", "cep telefonunuz", "e-posta adresiniz", "cinsiyet", "ülke", "şehir", "öğrenim durumu", "doğum tarihi"];
    function scoreFor(element) {
      var text = normalized(element && element.textContent);
      return labels.filter(function (label) { return text.indexOf(label) > -1; }).length;
    }
    var profiles = api.qsa("form:not(#formGlobal)", searchRoot).filter(function (form) { return scoreFor(form) >= 4; });
    if (!profiles.length) {
      profiles = api.qsa("section, article, fieldset, div", searchRoot).filter(function (element) {
        if (element.id === "divIcerik" || element.id === "mainHolder" || element.id === "formGlobal") return false;
        return scoreFor(element) >= 5 && api.qsa("input:not([type='hidden']), select, textarea", element).length >= 5;
      }).sort(function (a, b) {
        var scoreDifference = scoreFor(b) - scoreFor(a);
        return scoreDifference || api.qsa("*", a).length - api.qsa("*", b).length;
      }).slice(0, 1);
      profiles = profiles.map(function (profile) {
        var content = profile.closest("#divIcerik");
        var controlCount = api.qsa("input:not([type='hidden']), select, textarea", profile).length;
        var cursor = profile.parentElement;
        while (cursor && cursor !== content && cursor.id !== "mainHolder" && cursor.id !== "formGlobal") {
          var sameFields = scoreFor(cursor) >= scoreFor(profile) &&
            api.qsa("input:not([type='hidden']), select, textarea", cursor).length === controlCount;
          if (!sameFields) break;
          if (api.qs("h1, h2, h3, button, input[type='submit']", cursor)) return cursor;
          cursor = cursor.parentElement;
        }
        return profile;
      });
    }
    profiles.forEach(function (form) {
      if (form.classList.contains("ar-member-profile-form")) return;
      form.classList.add("ar-member-profile-form");
      if (document.body) document.body.classList.add("ar-member-profile-page");
      var fields = [];
      api.qsa("input:not([type='hidden']), select, textarea", form).forEach(function (control) {
        control.classList.add("ar-member-control");
        var node = control.parentElement;
        var candidate = node;
        var depth = 0;
        while (node && node !== form && depth < 5) {
          var controls = api.qsa("input:not([type='hidden']), select, textarea", node).length;
          if (controls > 4) break;
          candidate = node;
          if (node.matches(".form-group,.formGroup,.uyeFormGroup,.formItem,.inputBox,.input-box,.control-group,.form-control,[class*='col-'],li,td")) break;
          node = node.parentElement;
          depth += 1;
        }
        if (candidate && candidate !== form) {
          candidate.classList.add("ar-member-field");
          if (fields.indexOf(candidate) === -1) fields.push(candidate);
        }
      });

      var parents = [];
      fields.forEach(function (field) {
        if (field.parentElement && field.parentElement !== form && parents.indexOf(field.parentElement) === -1) parents.push(field.parentElement);
      });
      parents.forEach(function (parent) {
        var count = fields.filter(function (field) { return field.parentElement === parent; }).length;
        if (count > 1) parent.classList.add("ar-member-field-row");
      });
      if (fields.filter(function (field) { return field.parentElement === form; }).length > 1) form.classList.add("ar-member-direct-grid");

      var content = form.closest("#divIcerik") || document.querySelector("#divIcerik");
      if (!content) return;
      var sidebarCandidates = api.qsa("aside, nav, ul, div", content).filter(function (element) {
        if (element.contains(form)) return false;
        var menuText = normalized(element.textContent);
        var hits = ["üyelik bilgilerim", "siparişlerim", "iade taleplerim", "adres defterim", "favorilerim"].filter(function (item) { return menuText.indexOf(item) > -1; }).length;
        return hits >= 3 && api.qsa("a", element).length >= 3;
      }).sort(function (a, b) { return api.qsa("*", a).length - api.qsa("*", b).length; });
      var sidebar = sidebarCandidates[0];
      if (!sidebar) return;
      var layout = commonAncestor(sidebar, form);
      if (!layout || layout === document.body || !content.contains(layout)) return;
      var sidebarColumn = directChild(layout, sidebar);
      var mainColumn = directChild(layout, form);
      if (!sidebarColumn || !mainColumn || sidebarColumn === mainColumn) return;
      layout.classList.add("ar-member-layout");
      sidebarColumn.classList.add("ar-member-sidebar");
      mainColumn.classList.add("ar-member-main");
    });
  };

  api.observeMemberProfile = function () {
    if (!/hesabim|uyelik/i.test(window.location.pathname || "")) return;
    var target = api.qs("#divIcerik") || document.body;
    if (!target || target.getAttribute("data-ar-member-observer") === "true") return;
    target.setAttribute("data-ar-member-observer", "true");
    var scheduled = false;
    var observer = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(function () { scheduled = false; api.enhanceMemberProfile(target); });
    });
    observer.observe(target, { childList: true, subtree: true });
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
      var nativeClick = event.target.closest && event.target.closest(".btnAddToCart,.Addtobasket,.addBasket,.ar-native-add-button");
      if (nativeClick) {
        api.scheduleCartSync();
        return;
      }
      var visualButton = event.target.closest && event.target.closest(".ny-add-to-cart");
      if (!visualButton) return;
      var card = visualButton.closest(".productItem,.ItemOrj,.ar-native-product-card");
      var nativeButton = card && card.querySelector(".btnAddToCart,.Addtobasket,.addBasket,.ar-native-add-button");
      if (!nativeButton || nativeButton === visualButton) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      nativeButton.click();
      api.scheduleCartSync();
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

  api.enhanceMemberAuthPages = function () {
    var path = (window.location.pathname || "").toLowerCase();
    if (!/uyegiris|uyeol|sifremi|hesabim|uyelik/.test(path)) return;
    var root = api.qs("#divIcerik, .mainContainer, #mainHolder") || document.body;
    if (root.getAttribute("data-ar-fixed") === "member-page") return;
    root.setAttribute("data-ar-fixed", "member-page");
    root.classList.add("ar-member-page");
    document.body.classList.add("ar-member-auth");
    var form = api.qs("form:not(#formGlobal)", root);
    if (form) {
      form.classList.add("ar-member-card");
      api.labelForms(form);
    }
    // Ensure overlays cannot block auth forms.
    document.body.classList.remove("ar-panel-open", "panel-open");
    var panels = api.qs("#ar-shell-panels");
    if (panels) panels.classList.remove("menu-open", "search-open", "cart-open");
  };

  window.AromatherapicaTicimax = api;

  api.ready(function () {
    var path = (window.location.pathname || "").toLowerCase();
    if (/hesabim|uyelik|uyegiris|uyeol|sifremi/.test(path)) api.addPageClass("account");
    if (/uyegiris|sifremi/.test(path)) api.addPageClass("login");
    if (/uyeol/.test(path)) api.addPageClass("register");
    if (path.indexOf("favori") > -1) api.addPageClass("favorites");
    // Membership surfaces must never boot with an open menu overlay.
    document.body.classList.remove("ar-panel-open", "panel-open");
    document.documentElement.classList.remove("ar-panel-open");
    api.watchEditors();
    api.buildExactShell();
    api.fixWishlistLinks(document);
    api.bridgeCatalogAddButtons();
    api.enableSmartHeader();
    api.scheduleNewsletter();
    api.enhanceMemberProfile(document);
    api.observeMemberProfile();
    api.enhanceMemberAuthPages();
    api.syncCartCount();
    // Product enhance/observe owned by ar-core; only fill gaps if core is absent.
    if (window.AROMATHERAPICA && window.AROMATHERAPICA.products) {
      window.AROMATHERAPICA.products.enhanceRoot(document);
      var catalog = window.AROMATHERAPICA.dom && window.AROMATHERAPICA.dom.findFirst
        ? window.AROMATHERAPICA.dom.findFirst(document, window.AROMATHERAPICA.selectors.catalog)
        : api.qs(".ProductListContent, .ProductList, #divIcerik");
      if (catalog) window.AROMATHERAPICA.products.observe(catalog);
    } else if (api.qs(cardSelector)) {
      api.enhanceProductCards(document);
      api.observeProducts(api.qs(".ProductListContent, .ProductList, #divIcerik") || document.body);
    }
    if (window.AROMATHERAPICA && typeof window.AROMATHERAPICA.registerModule === "function") {
      window.AROMATHERAPICA.registerModule("global-shell", function () { return function () {}; });
    }
  });
})(window, document);

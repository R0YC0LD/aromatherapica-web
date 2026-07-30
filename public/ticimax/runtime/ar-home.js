(function () {
  "use strict";

  var VERSION = "2026.07.28-exact-home-1";
  if (window.__AR_EXACT_HOME_VERSION__ === VERSION) return;
  window.__AR_EXACT_HOME_VERSION__ = VERSION;

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function isRealImage(url) {
    return /uploads\/urunresimleri/i.test(url || "") &&
      !/resim-hazirlaniyor|noimage|no-image|data:image/i.test(url || "");
  }

  function collectProducts() {
    var seen = {};
    var products = [];
    qsa(".bb-keep-product .productItem, #divIcerik .productItem").forEach(function (item) {
      var detail = qs(".productDetail", item);
      var nameNode = qs(".productName", item);
      var link = qs(".productName a, .productImage a", item);
      var image = qs(".productImage img", item);
      var cart = qs(".btnAddToCart", item);
      var favorite = qs(".favoriteslist", item);
      var id = detail && detail.dataset ? detail.dataset.id : "";
      if (!id || seen[id] || !nameNode || !link) return;
      seen[id] = true;

      var source = image ? (image.currentSrc || image.getAttribute("data-src") || image.src || "") : "";
      products.push({
        id: id,
        variantId: detail.dataset.variantId || "",
        category: detail.dataset.category1 || detail.dataset.category || "Aromatherapica",
        name: nameNode.textContent.replace(/\s+/g, " ").trim(),
        href: link.getAttribute("href") || "/urunler",
        image: isRealImage(source) ? source.replace(/width=240\b/i, "width=620") : "",
        price: (qs(".discountPriceSpan", item) || qs(".currentPrice", item) || {}).textContent || "",
        unique: cart && cart.dataset ? cart.dataset.unique || "" : "",
        favoriteOnclick: favorite ? favorite.getAttribute("onclick") || "" : ""
      });
    });
    return products.slice(0, 8);
  }

  function productCard(product, index) {
    var visuals = ["visual-rice", "visual-grape", "visual-calendula", "visual-cactus", "visual-lavender", "visual-rosemary", "visual-rose", "visual-hair"];
    var badges = ["Çok Sevilen", "Yeni", "Editörün Seçimi", "Günlük Ritüel", "Saf Uçucu Yağ", "Doğal Bakım", "Aromatherapica", "Özenli Seçki"];
    var media = product.image
      ? '<img src="' + esc(product.image) + '" alt="' + esc(product.name) + '" loading="' + (index < 4 ? "eager" : "lazy") + '" decoding="async">'
      : '<div class="css-product-bottle" aria-hidden="true"></div>';
    return (
      '<article class="product-card reveal" data-category="' + esc(product.category) + '">' +
        '<div class="product-image ' + visuals[index % visuals.length] + '">' +
          '<span class="product-badge">' + badges[index % badges.length] + "</span>" +
          '<button class="favorite-button" type="button" data-ar-favorite="' + index + '" aria-label="Favorilere ekle: ' + esc(product.name) + '">♡</button>' +
          '<a href="' + esc(product.href) + '" aria-label="' + esc(product.name) + '">' + media + "</a>" +
        "</div>" +
        '<div class="product-info">' +
          '<div class="product-meta"><span>' + esc(product.category) + '</span><span class="rating">★★★★★ <small>4.9</small></span></div>' +
          '<h3><a href="' + esc(product.href) + '">' + esc(product.name) + "</a></h3>" +
          '<p class="product-subtitle">Doğal içeriklerle hazırlanan özenli Aromatherapica bakımı.</p>' +
          '<div class="price-row"><strong>' + esc(product.price.trim()) + "</strong></div>" +
          '<div class="card-actions">' +
            '<button class="add-button" type="button" data-ar-add="' + index + '">Sepete ekle</button>' +
            '<a class="quick-button" href="' + esc(product.href) + '" aria-label="' + esc(product.name) + ' ürününü incele">＋</a>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function mainMarkup(products) {
    return (
      '<main id="ar-exact-main" class="ar-exact-main">' +
        '<section class="hero" id="top">' +
          '<div class="hero-visual" aria-hidden="true">' +
            '<div class="hero-orbit hero-orbit-one"></div><div class="hero-orbit hero-orbit-two"></div>' +
            '<div class="botanical-leaf leaf-one"></div><div class="botanical-leaf leaf-two"></div>' +
            '<div class="hero-bottle"><span class="bottle-cap"></span><span class="bottle-glow"></span><span class="bottle-emblem">A</span><span class="bottle-label">AROMATHERAPICA</span></div>' +
            '<p class="visual-note visual-note-top">Saf bitki özleri</p><p class="visual-note visual-note-bottom">Özenli formüller</p>' +
          "</div>" +
          '<div class="hero-copy">' +
            '<p class="eyebrow">Doğanın bilgisinden modern bakım ritüellerine</p>' +
            '<h1>Saf içerikler.<br>Özenli ritüeller.</h1>' +
            '<p class="hero-description">Bitkilerin özünü, duyulara hitap eden etkili bakım formülleriyle buluşturuyoruz. Günlük ritüelinize iyi gelecek ürünleri keşfedin.</p>' +
            '<div class="hero-actions"><a class="button button-primary" href="/cilt-bakimi">Cilt bakımını keşfet</a><a class="button button-outline" href="/aromaterapi-yaglari">Aromaterapi yağları</a></div>' +
            '<ul class="hero-assurances" aria-label="Marka değerleri"><li>Vegan seçenekler</li><li>Hayvanlar üzerinde test edilmez</li><li>Güvenli ödeme</li></ul>' +
          "</div>" +
        "</section>" +
        '<section class="gift-banner" id="delivery" aria-label="Alışveriş fırsatı"><p class="eyebrow">Aromatherapica’dan size</p><h2>İlk siparişinize özel bakım hediyesi</h2><p>Seçili alışverişlerde sürpriz ritüel ürününüz bizden.</p><a class="text-link" href="/urunler">Şimdi keşfet <span>→</span></a></section>' +
        '<section class="section products-section" id="products">' +
          '<div class="section-heading reveal"><div><p class="eyebrow">Aromatherapica seçkisi</p><h2>Çok sevilenler</h2></div><div class="product-filters" role="group" aria-label="Ürün filtreleri"><button type="button" class="is-active" data-ar-filter="Tümü">Tümü</button><button type="button" data-ar-filter="Cilt">Cilt Bakımı</button><button type="button" data-ar-filter="Yağ">Uçucu Yağlar</button><button type="button" data-ar-filter="Özel">Özel Bakım</button></div></div>' +
          '<div class="product-grid" data-ar-product-grid>' + products.map(productCard).join("") + "</div>" +
          '<div class="section-footer-action reveal"><a class="text-link" href="/urunler">Tüm ürünleri görüntüle <span>→</span></a></div>' +
        "</section>" +
        '<section class="ritual-intro" id="rituals">' +
          '<div class="ritual-intro-copy reveal"><p class="eyebrow">Kendinize ayırdığınız anlar</p><h2>Ritüelinizi seçin</h2><p>Saf bitkisel içeriklerle hazırlanan ürünleri bakım ihtiyacınıza göre keşfedin.</p><a class="text-link" href="/urunler">Tüm ürünleri gör <span>→</span></a></div>' +
          '<div class="ritual-grid">' +
            '<article class="ritual-card ritual-blue reveal"><span class="ritual-number">01</span><div class="ritual-art ritual-art-oil" aria-hidden="true"></div><div class="ritual-card-copy"><p>Saf ve konsantre</p><h3>Aromaterapi Yağları</h3><span>Ruh halinize ve günlük ritüelinize eşlik eden bitkisel özler.</span><a href="/aromaterapi-yaglari">Keşfet</a></div></article>' +
            '<article class="ritual-card ritual-clay reveal"><span class="ritual-number">02</span><div class="ritual-art ritual-art-cream" aria-hidden="true"></div><div class="ritual-card-copy"><p>Günlük bakım</p><h3>Cilt Bakım Serisi</h3><span>Cildin dengesini gözeten zengin ve nazik formüller.</span><a href="/cilt-bakimi">Keşfet</a></div></article>' +
            '<article class="ritual-card ritual-sage reveal"><span class="ritual-number">03</span><div class="ritual-art ritual-art-flower" aria-hidden="true"></div><div class="ritual-card-copy"><p>Bütünsel bakım</p><h3>Saç ve Vücut</h3><span>Günlük bakımınıza doğanın sakin ritmini taşıyan seçkiler.</span><a href="/sacvevucut-bakimi">Keşfet</a></div></article>' +
          "</div>" +
        "</section>" +
        '<section class="editorial-split" id="skin">' +
          '<div class="editorial-image reveal" aria-hidden="true"><div class="editorial-vessel"><span></span></div><div class="editorial-shadow"></div></div>' +
          '<div class="editorial-copy reveal"><p class="eyebrow">Bitkilerden ilham alan formüller</p><h2>Cildinizin ritmini dinleyin</h2><p>Pirinç kepeği, üzüm çekirdeği ve calendula gibi güçlü bitkisel içerikleri; duyusal dokular ve günlük kullanıma uygun formüllerle bir araya getiriyoruz.</p><div class="editorial-points"><div><strong>01</strong><span>İhtiyacınızı belirleyin</span></div><div><strong>02</strong><span>Doğru ürünü seçin</span></div><div><strong>03</strong><span>Ritüelinizi düzenli uygulayın</span></div></div><a class="button button-primary" href="/urunler">Bakım seçkisini keşfet</a></div>' +
        "</section>" +
        '<section class="ingredient-banner" aria-label="Öne çıkan içerikler"><div class="ingredient-track"><span>Lavanta</span><i></i><span>Calendula</span><i></i><span>Tamanu</span><i></i><span>Üzüm Çekirdeği</span><i></i><span>Pirinç Kepeği</span><i></i><span>Biberiye</span><i></i><span>Lavanta</span><i></i><span>Calendula</span><i></i><span>Tamanu</span><i></i><span>Üzüm Çekirdeği</span><i></i></div></section>' +
        '<section class="section stories-section" id="body">' +
          '<div class="section-heading reveal"><div><p class="eyebrow">Bakım günlüğü</p><h2>Doğadan gelen iyi yaşam notları</h2></div><a class="text-link" href="/blog">Tüm yazılar <span>→</span></a></div>' +
          '<div class="story-grid" id="journal">' +
            '<article class="journal-card reveal"><div class="journal-art art-rosemary" aria-hidden="true"></div><time datetime="2026-07-25">25 Temmuz 2026</time><h3>Biberiye yağını günlük rutininize nasıl eklersiniz?</h3><p>Daha odaklı ve taze hissettiren küçük aromaterapi adımları.</p><a href="/blog">Yazıyı oku</a></article>' +
            '<article class="journal-card reveal"><div class="journal-art art-ritual" aria-hidden="true"></div><time datetime="2026-07-19">19 Temmuz 2026</time><h3>Cilt bakımında sakin ve dengeli bir akşam ritüeli</h3><p>Cildinizi yormadan, ihtiyaca yönelik üç adımlı bakım.</p><a href="/blog">Yazıyı oku</a></article>' +
            '<article class="journal-card reveal"><div class="journal-art art-lavender" aria-hidden="true"></div><time datetime="2026-07-12">12 Temmuz 2026</time><h3>Lavanta: dinlenme anlarının zamansız eşlikçisi</h3><p>Lavanta kokusunu ev ve beden bakımında kullanmanın yolları.</p><a href="/blog">Yazıyı oku</a></article>' +
          "</div>" +
        "</section>" +
        '<section class="brand-statement reveal" aria-label="Aromatherapica marka yaklaşımı"><p>Doğanın bilgeliğinden ilham alıyoruz</p><h2>Aromatherapica, bitkisel içerikleri duyusal ve özenli bakım ritüelleriyle buluşturur.</h2><strong>ÖDÜNSÜZ BAKIM</strong><span>SAF. ÖZENLİ. ETKİLİ.</span></section>' +
        '<section class="conscience-section" aria-label="Sorumlu alışveriş ilkeleri"><h2 class="reveal">Özenle alışveriş</h2><div class="conscience-grid">' +
          '<article class="reveal"><i class="conscience-icon conscience-rabbit" aria-hidden="true"></i><h3>Hayvan dostu</h3><p>Ürünlerimiz hayvanlar üzerinde test edilmez.</p></article>' +
          '<article class="reveal"><i class="conscience-icon conscience-leaf" aria-hidden="true"></i><h3>Bitkisel içerikler</h3><p>Formüllerimizde doğadan gelen içeriklere öncelik veririz.</p></article>' +
          '<article class="reveal"><i class="conscience-icon conscience-drop" aria-hidden="true"></i><h3>Saf özler</h3><p>Aromaterapi seçkimiz özenle seçilmiş özlerden oluşur.</p></article>' +
          '<article class="reveal"><i class="conscience-icon conscience-recycle" aria-hidden="true"></i><h3>Sorumlu ambalaj</h3><p>Geri dönüştürülebilir ambalaj seçeneklerini destekleriz.</p></article>' +
          '<article class="reveal"><i class="conscience-icon conscience-heart" aria-hidden="true"></i><h3>İyi yaşam</h3><p>Bakımı günlük yaşamın sakin ve değerli bir parçası görürüz.</p></article>' +
        "</div></section>" +
        '<section class="newsletter reveal"><div class="newsletter-copy"><p class="eyebrow">Aromatherapica dünyasına katılın</p><h2>İlk siparişinize özel %15 indirim</h2><p>Yeni ürünler, bakım notları ve özel tekliflerden ilk siz haberdar olun.</p></div><form class="newsletter-form" data-ar-newsletter><label for="ar-newsletter-email">E-posta adresiniz</label><div><input id="ar-newsletter-email" name="email" type="email" placeholder="E-posta adresiniz" required><button type="submit">Kayıt ol</button></div><label class="consent"><input type="checkbox" required><span>İletişim izni ve aydınlatma metnini kabul ediyorum.</span></label></form></section>' +
      "</main>"
    );
  }

  function footerMarkup() {
    return (
      '<footer id="ar-exact-footer" class="site-footer">' +
        '<div class="footer-top">' +
          '<div class="footer-brand"><a class="wordmark wordmark-light ar-exact-wordmark" href="/"><i class="ar-exact-emblem" aria-hidden="true"><b>AR</b></i><span class="ar-exact-wordmark-copy"><strong>Aromatherapica</strong><small>Essential Oils &amp; Aromatherapy</small></span></a><p>Doğanın bilgisini modern bakım ritüelleriyle buluşturan, özenli ve duyusal Aromatherapica dünyası.</p><div class="social-links" aria-label="Sosyal medya bağlantıları"><a href="https://www.instagram.com/aromatherapica/" target="_blank" rel="noopener" aria-label="Instagram"><i class="social-icon social-icon-instagram" aria-hidden="true"></i></a><a href="https://www.pinterest.com/" target="_blank" rel="noopener" aria-label="Pinterest"><i class="social-icon social-icon-pinterest" aria-hidden="true"></i></a><a href="https://www.youtube.com/" target="_blank" rel="noopener" aria-label="YouTube"><i class="social-icon social-icon-youtube" aria-hidden="true"></i></a></div></div>' +
          '<div class="footer-links"><div><h2>Yardım</h2><a href="/iletisim">Müşteri Hizmetleri</a><a href="/sikca-sorulan-sorular">Sıkça Sorulan Sorular</a><a href="/kargo-ve-teslimat">Kargo ve Teslimat</a><a href="/iade-ve-degisim">İade ve Değişim</a></div><div><h2>Hesabım</h2><a href="/Hesabim">Üyelik</a><a href="/Hesabim#/Siparislerim">Siparişlerim</a><a href="/favorilerim">Favorilerim</a><a href="/kvkk">KVKK</a></div><div><h2>Aromatherapica</h2><a href="/hakkimizda">Hakkımızda</a><a href="/iceriklerimiz">İçeriklerimiz</a><a href="/blog">Bakım Günlüğü</a><a href="/iletisim">Bize Ulaşın</a></div></div>' +
        "</div>" +
        '<div class="footer-assurances"><span><i class="icon-lock" aria-hidden="true"></i> Güvenli ödeme</span><span><i class="icon-box" aria-hidden="true"></i> Özenli paketleme</span><span><i class="icon-leaf" aria-hidden="true"></i> Bitkisel içerikler</span></div>' +
        '<div class="footer-bottom"><p>© 2026 Aromatherapica. Tüm hakları saklıdır.</p><div><a href="/kullanim-kosullari">Kullanım Koşulları</a><a href="/kvkk">Gizlilik</a><a href="/cerez-politikasi">Çerezler</a></div><div class="payment-marks" aria-label="Ödeme yöntemleri"><b>VISA</b><b>MC</b><b>TROY</b></div></div>' +
      "</footer>"
    );
  }

  function bindProducts(products) {
    qsa("[data-ar-add]").forEach(function (button) {
      button.addEventListener("click", function () {
        var product = products[Number(button.getAttribute("data-ar-add"))];
        if (!product) return;
        if (typeof window.productListAddToCartV2 === "function" && product.unique) {
          window.productListAddToCartV2(product.unique, Number(product.id), Number(product.variantId), 0, 1, product.href, 0, button);
        } else {
          window.location.href = product.href;
        }
      });
    });
    qsa("[data-ar-favorite]").forEach(function (button) {
      button.addEventListener("click", function () {
        var index = Number(button.getAttribute("data-ar-favorite"));
        var product = products[index];
        button.classList.toggle("is-active");
        button.textContent = button.classList.contains("is-active") ? "♥" : "♡";
        if (product && product.favoriteOnclick) {
          var original = qsa(".bb-keep-product .productItem")[index];
          var nativeFavorite = original ? qs(".favoriteslist", original) : null;
          if (nativeFavorite) nativeFavorite.click();
        }
      });
    });
    qsa("[data-ar-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        var filter = button.getAttribute("data-ar-filter");
        qsa("[data-ar-filter]").forEach(function (item) { item.classList.toggle("is-active", item === button); });
        qsa("[data-ar-product-grid] .product-card").forEach(function (card) {
          var category = card.getAttribute("data-category") || "";
          card.classList.toggle("is-filtered-out", filter !== "Tümü" && category.indexOf(filter) === -1);
        });
      });
    });
  }

  function bindMotion() {
    var reveal = qsa("#ar-exact-main .reveal, #ar-exact-footer .reveal");
    if (!("IntersectionObserver" in window)) {
      reveal.forEach(function (node) { node.classList.add("is-visible"); });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      reveal.forEach(function (node) { observer.observe(node); });
    }

    var hero = qs("#ar-exact-main .hero");
    if (hero && window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
      hero.addEventListener("pointermove", function (event) {
        var rect = hero.getBoundingClientRect();
        var x = (event.clientX - rect.left) / Math.max(1, rect.width) - 0.5;
        var y = (event.clientY - rect.top) / Math.max(1, rect.height) - 0.5;
        hero.style.setProperty("--hero-visual-x", (-x * 10).toFixed(2) + "px");
        hero.style.setProperty("--hero-visual-y", (-y * 8).toFixed(2) + "px");
        hero.style.setProperty("--hero-copy-x", (x * 4).toFixed(2) + "px");
      });
      hero.addEventListener("pointerleave", function () {
        hero.style.removeProperty("--hero-visual-x");
        hero.style.removeProperty("--hero-visual-y");
        hero.style.removeProperty("--hero-copy-x");
      });
    }
  }

  function bindNewsletter() {
    var form = qs("[data-ar-newsletter]");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = qs('input[type="email"]', form);
      var button = qs('button[type="submit"]', form);
      if (!email || !email.checkValidity()) {
        if (email) email.reportValidity();
        return;
      }
      var nativeEmail =
        qs("#txtbxNewsletterMail") ||
        qs("#ebultenMail") ||
        qs(".custom-newsletter-section input[type='email']") ||
        qs("#customFooterContent input[type='email']");
      var nativeContainer = nativeEmail && (nativeEmail.closest("form") || nativeEmail.parentElement);
      var nativeButton = nativeContainer && qs(
        "button, input[type='submit'], .newsletter-button, [class*='Bulten'] button",
        nativeContainer
      );
      var status = qs("[data-ar-newsletter-status]", form);
      if (!status) {
        form.insertAdjacentHTML("beforeend", '<p data-ar-newsletter-status role="status" aria-live="polite"></p>');
        status = qs("[data-ar-newsletter-status]", form);
      }
      if (!nativeEmail || !nativeButton) {
        if (status) status.textContent = "Kayıt servisi şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.";
        return;
      }
      nativeEmail.value = email.value;
      nativeEmail.dispatchEvent(new Event("input", { bubbles: true }));
      nativeEmail.dispatchEvent(new Event("change", { bubbles: true }));
      if (button) button.disabled = true;
      nativeButton.click();
      if (status) status.textContent = "Kayıt isteğiniz Ticimax sistemine gönderildi.";
      window.setTimeout(function () {
        if (button) button.disabled = false;
      }, 1800);
    });
  }

  function build() {
    if (qs("#ar-exact-main")) return true;
    var anchor = qs(".ar-hero") || qs("#divIcerik");
    var originalFooter = qs("#customFooterContent");
    if (!anchor || !originalFooter) return false;
    var products = collectProducts();
    if (products.length < 4) return false;

    document.body.classList.add("ar-exact-home");
    document.documentElement.classList.add("ar-exact-home");
    anchor.insertAdjacentHTML("beforebegin", mainMarkup(products));
    originalFooter.insertAdjacentHTML("beforebegin", footerMarkup());
    bindProducts(products);
    bindMotion();
    bindNewsletter();
    return true;
  }

  function start() {
    document.documentElement.classList.add("ar-page-home");
    if (document.body) document.body.classList.add("ar-page-home");
    var attempts = 0;
    var timer = window.setInterval(function () {
      attempts += 1;
      if (build() || attempts > 40) window.clearInterval(timer);
    }, 150);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();

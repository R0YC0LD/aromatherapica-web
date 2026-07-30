/**
 * Re-sync images: reject Ticimax "resim-hazirlaniyor" placeholders.
 * Prefer real /Uploads/UrunResimleri/ assets; also scrape category/list pages.
 */
const fs = require("fs");
const path = require("path");

const STORE = "https://www.aromatherapica.com";
const CATALOG = path.join(__dirname, "..", "public", "data", "catalog.json");

function isPlaceholder(url) {
  return !url || /resim-hazirlaniyor|noimage|no-image|placeholder|default-product|resim_yok/i.test(url);
}

function isRealProductImage(url) {
  if (!url || isPlaceholder(url)) return false;
  return /ticimax\.cloud/i.test(url) && /urunresimleri|UrunResimleri/i.test(url);
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "tr-TR,tr;q=0.9",
    },
    redirect: "follow",
  });
  return { ok: res.ok, status: res.status, url: res.url, html: await res.text() };
}

function allCandidateImages(html) {
  const re =
    /https:\/\/static\.ticimax\.cloud\/(?:cdn-cgi\/image\/[^/]+\/)?\d+\/(?:[Uu]ploads\/)?(?:[Uu]run[Rr]esimleri|uploads\/urunresimleri)\/(?:thumb\/)?[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi;
  const found = html.match(re) || [];
  const cleaned = found
    .map((u) => u.replace(/\/thumb\//i, "/").replace(/cdn-cgi\/image\/[^/]+\//i, ""))
    .filter((u) => isRealProductImage(u));
  return [...new Set(cleaned)];
}

function pickBest(images, slug) {
  if (!images.length) return null;
  const slugPart = String(slug || "")
    .toLowerCase()
    .replace(/-?\d+$/, "")
    .slice(0, 18);
  const bySlug = images.find((u) => slugPart && u.toLowerCase().includes(slugPart.replace(/-/g, "")));
  if (bySlug) return bySlug;
  const bySlugDash = images.find((u) => slugPart && u.toLowerCase().includes(slugPart));
  if (bySlugDash) return bySlugDash;
  return images.find((u) => /\.png$/i.test(u)) || images[0];
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
  const products = catalog.products || [];

  // Build global image index from category / listing pages
  const listUrls = [
    `${STORE}/`,
    `${STORE}/ucucu-yaglar`,
    `${STORE}/cilt-bakimi`,
    `${STORE}/ozel-bakim`,
    `${STORE}/sac-bakimi`,
    `${STORE}/vucut-bakimi`,
    `${STORE}/gul-sulari`,
    `${STORE}/dogal-sabunlar`,
    `${STORE}/hediye-secenekleri`,
    `${STORE}/urunler`,
    `${STORE}/TumUrunler`,
    `${STORE}/kategori/tum-urunler`,
  ];

  /** @type {Map<string, string>} slug/id -> image */
  const index = new Map();

  console.log("Indexing category/list pages…");
  for (const url of listUrls) {
    try {
      const res = await fetchText(url);
      if (!res.ok || /Just a moment|challenge-platform/i.test(res.html)) {
        console.log(" skip", url, res.status);
        continue;
      }
      // product cards: href ...-ID and nearby img
      const cardRe =
        /href=["']([^"']*?-(\d{2,6}))["'][^>]*>[\s\S]{0,1200}?src=["'](https:\/\/static\.ticimax\.cloud[^"']+\.(?:jpg|jpeg|png|webp))["']/gi;
      let m;
      let hits = 0;
      while ((m = cardRe.exec(res.html))) {
        const href = m[1];
        const id = m[2];
        const img = m[3];
        if (isPlaceholder(img)) continue;
        const clean = img.replace(/cdn-cgi\/image\/[^/]+\//i, "").replace(/\/thumb\//i, "/");
        if (!isRealProductImage(clean) && !/ticimax\.cloud/i.test(clean)) continue;
        if (isPlaceholder(clean)) continue;
        index.set(String(id), clean);
        const slug = href.split("/").pop()?.replace(/-\d+$/, "") || "";
        if (slug) index.set(slug.toLowerCase(), clean);
        hits += 1;
      }
      // also collect all product images loosely
      const all = allCandidateImages(res.html);
      console.log(`  ${url} cards=${hits} imgs=${all.length}`);
    } catch (e) {
      console.log(" err", url, e.message);
    }
    await sleep(120);
  }

  let withReal = 0;
  let updated = 0;
  let stillBad = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    let imageUrl = isRealProductImage(p.imageUrl) ? p.imageUrl : null;

    if (!imageUrl) {
      imageUrl = index.get(String(p.id)) || index.get(String(p.slug).toLowerCase()) || null;
    }

    if (!imageUrl) {
      const urls = [
        p.ticimaxUrl && String(p.ticimaxUrl).replace("https://aromatherapica.com", STORE),
        `${STORE}/${p.slug}-${p.id}`,
        `${STORE}/${p.slug}`,
      ].filter(Boolean);

      for (const url of [...new Set(urls)]) {
        try {
          const res = await fetchText(url);
          if (!res.ok || /Just a moment|challenge-platform/i.test(res.html)) continue;
          const imgs = allCandidateImages(res.html);
          const best = pickBest(imgs, p.slug);
          if (best) {
            imageUrl = best;
            p.ticimaxUrl = res.url.replace("https://www.", "https://");
            break;
          }
        } catch {
          /* next */
        }
      }
      await sleep(70);
    }

    if (imageUrl && !isPlaceholder(imageUrl)) {
      withReal += 1;
      if (p.imageUrl !== imageUrl) {
        p.imageUrl = imageUrl;
        updated += 1;
      }
      const imgs = Array.isArray(p.images) ? p.images.filter((x) => x && !isPlaceholder(x)) : [];
      p.images = [imageUrl, ...imgs.filter((x) => x !== imageUrl)];
    } else {
      // clear placeholder so UI can show soft empty stage instead of fake "preparing" jpg
      if (isPlaceholder(p.imageUrl)) {
        p.imageUrl = null;
        p.images = [];
      }
      stillBad.push({ id: p.id, slug: p.slug, name: p.name });
    }

    if ((i + 1) % 25 === 0 || i === products.length - 1) {
      console.log(
        `progress ${i + 1}/${products.length} real=${withReal} updated=${updated} missing=${stillBad.length}`,
      );
      catalog.products = products;
      fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
    }
  }

  catalog.products = products;
  catalog.syncedAt = new Date().toISOString();
  catalog.syncSource = STORE;
  catalog.imageSync = { withReal, updated, missing: stillBad.length, missingList: stillBad };
  fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
  console.log(JSON.stringify({ withReal, updated, missing: stillBad.length, total: products.length }, null, 2));
  if (stillBad.length) {
    console.log("STILL MISSING (no real Ticimax image on store):");
    stillBad.forEach((f) => console.log(`  ${f.id} ${f.slug}`));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Deep sync: try each catalog product slug on Ticimax, pull image + canonical URL.
 * Usage: node scripts/sync-ticimax-products-deep.cjs
 */
const fs = require("fs");
const path = require("path");

const STORE = "https://aromatherapica.com";
const ROOT = path.join(__dirname, "..");
const CATALOG = path.join(ROOT, "public", "data", "catalog.json");

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "AromatherapicaSync/1.0", Accept: "text/html" },
    redirect: "follow",
  });
  return { ok: res.ok, status: res.status, url: res.url, html: res.ok ? await res.text() : "" };
}

function firstProductImage(html) {
  const patterns = [
    /https:\/\/static\.ticimax\.cloud\/74521\/Uploads\/UrunResimleri\/(?!thumb\/)[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi,
    /https:\/\/static\.ticimax\.cloud\/74521\/Uploads\/UrunResimleri\/thumb\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[0]) return m[0].replace("/thumb/", "/");
  }
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
  const products = catalog.products || [];
  let updated = 0;
  let found = 0;
  let missing = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const candidates = [
      `${STORE}/${p.slug}`,
      `${STORE}/${p.slug}/`,
      p.ticimaxUrl,
    ].filter(Boolean);

    let hit = null;
    for (const url of candidates) {
      try {
        const res = await fetchText(url);
        if (!res.ok) continue;
        // Skip if redirected to home / category listing without product detail
        const img = firstProductImage(res.html);
        const isProduct =
          /productDetail|ProductDetail|urunDetay|btnAddToCart|AddToCart/i.test(res.html) ||
          Boolean(img && /UrunResimleri/i.test(img));
        if (!isProduct && !img) continue;
        hit = { finalUrl: res.url, imageUrl: img };
        break;
      } catch {
        /* next */
      }
    }

    if (hit) {
      found += 1;
      if (hit.imageUrl && p.imageUrl !== hit.imageUrl) {
        p.imageUrl = hit.imageUrl;
        updated += 1;
      }
      p.ticimaxUrl = hit.finalUrl;
    } else {
      missing += 1;
    }

    if ((i + 1) % 10 === 0) {
      console.log(`progress ${i + 1}/${products.length} found=${found} updated=${updated}`);
      fs.writeFileSync(CATALOG, JSON.stringify({ ...catalog, products }, null, 2));
    }
    await sleep(120);
  }

  catalog.products = products;
  catalog.syncedAt = new Date().toISOString();
  catalog.syncSource = STORE;
  fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
  console.log({ found, updated, missing, total: products.length });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

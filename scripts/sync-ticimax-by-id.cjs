/**
 * Sync every catalog product using Ticimax SEO pattern: /{slug}-{id}
 */
const fs = require("fs");
const path = require("path");

const STORE = "https://aromatherapica.com";
const CATALOG = path.join(__dirname, "..", "public", "data", "catalog.json");

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": "AromatherapicaSync/1.0", Accept: "text/html" },
    redirect: "follow",
  });
  return { ok: res.ok, status: res.status, url: res.url, html: res.ok ? await res.text() : "" };
}

function firstProductImage(html) {
  const full = html.match(
    /https:\/\/static\.ticimax\.cloud\/74521\/[Uu]ploads\/[Uu]run[Rr]esimleri\/(?!thumb\/)[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/i,
  );
  if (full) return full[0];
  const thumb = html.match(
    /https:\/\/static\.ticimax\.cloud\/74521\/[Uu]ploads\/[Uu]run[Rr]esimleri\/thumb\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/i,
  );
  return thumb ? thumb[0].replace("/thumb/", "/") : null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
  const products = catalog.products || [];
  let updated = 0;
  let found = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const urls = [
      `${STORE}/${p.slug}-${p.id}`,
      `${STORE}/${p.slug}-${p.variantId || p.id}`,
      p.ticimaxUrl,
      `${STORE}/${p.slug}`,
    ].filter(Boolean);

    let hit = null;
    for (const url of [...new Set(urls)]) {
      try {
        const res = await fetchText(url);
        if (!res.ok) continue;
        const img = firstProductImage(res.html);
        if (!img && !/btnAddToCart|AddToCart|productDetail/i.test(res.html)) continue;
        hit = { finalUrl: res.url, imageUrl: img };
        if (img) break;
      } catch {
        /* next */
      }
    }

    if (hit) {
      found += 1;
      p.ticimaxUrl = hit.finalUrl;
      if (hit.imageUrl && p.imageUrl !== hit.imageUrl) {
        p.imageUrl = hit.imageUrl;
        updated += 1;
      }
    }

    if ((i + 1) % 15 === 0) {
      console.log(`progress ${i + 1}/${products.length} found=${found} imgs=${updated}`);
      fs.writeFileSync(CATALOG, JSON.stringify({ ...catalog, products }, null, 2));
    }
    await sleep(80);
  }

  catalog.products = products;
  catalog.syncedAt = new Date().toISOString();
  catalog.syncSource = STORE;
  fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
  console.log({ found, updated, total: products.length, withImage: products.filter((p) => p.imageUrl).length });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Pull every catalog product image from live Ticimax (www) via /{slug}-{id}.
 * Overwrites imageUrl and images[0] so the GitHub storefront never shows empty bottles.
 */
const fs = require("fs");
const path = require("path");

const STORE = "https://www.aromatherapica.com";
const CATALOG = path.join(__dirname, "..", "public", "data", "catalog.json");

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
  const html = await res.text();
  return { ok: res.ok, status: res.status, url: res.url, html };
}

function pickImage(html) {
  const patterns = [
    /https:\/\/static\.ticimax\.cloud\/74521\/[Uu]ploads\/[Uu]run[Rr]esimleri\/(?!thumb\/)[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi,
    /https:\/\/static\.ticimax\.cloud\/\d+\/[Uu]ploads\/[Uu]run[Rr]esimleri\/(?!thumb\/)[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi,
    /https:\/\/static\.ticimax\.cloud\/74521\/[Uu]ploads\/[Uu]run[Rr]esimleri\/thumb\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi,
  ];
  for (const re of patterns) {
    const matches = html.match(re);
    if (!matches || !matches.length) continue;
    const preferred =
      matches.find((u) => !/thumb/i.test(u) && !/noimage|placeholder|default/i.test(u)) ||
      matches.find((u) => !/noimage|placeholder|default/i.test(u));
    if (preferred) return preferred.replace("/thumb/", "/");
  }
  const og = html.match(
    /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
  ) || html.match(/content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
  if (og && og[1] && /ticimax\.cloud/i.test(og[1])) return og[1];
  return null;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
  const products = catalog.products || [];
  let withImage = 0;
  let updated = 0;
  let failed = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const urls = [
      p.ticimaxUrl && p.ticimaxUrl.replace("https://aromatherapica.com", STORE),
      `${STORE}/${p.slug}-${p.id}`,
      `${STORE}/${p.slug}-${p.variantId || p.id}`,
      `${STORE}/${p.slug}`,
    ].filter(Boolean);

    let imageUrl = null;
    let finalUrl = null;
    for (const url of [...new Set(urls)]) {
      try {
        const res = await fetchText(url);
        if (!res.ok) continue;
        // Cloudflare challenge?
        if (/Just a moment|cf-browser-verification|challenge-platform/i.test(res.html)) {
          continue;
        }
        const img = pickImage(res.html);
        if (img) {
          imageUrl = img;
          finalUrl = res.url;
          break;
        }
        if (/ProductDetail|productDetail|btnAddToCart|AddToCart/i.test(res.html)) {
          finalUrl = res.url;
        }
      } catch {
        /* try next */
      }
    }

    if (finalUrl) p.ticimaxUrl = finalUrl.replace("https://www.", "https://");
    if (imageUrl) {
      withImage += 1;
      if (p.imageUrl !== imageUrl) {
        p.imageUrl = imageUrl;
        updated += 1;
      }
      const imgs = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
      if (!imgs.length || imgs[0] !== imageUrl) {
        p.images = [imageUrl, ...imgs.filter((x) => x !== imageUrl)];
      }
    } else {
      failed.push({ id: p.id, slug: p.slug, name: p.name });
    }

    if ((i + 1) % 20 === 0 || i === products.length - 1) {
      console.log(
        `progress ${i + 1}/${products.length} withImage=${withImage} updated=${updated} failed=${failed.length}`,
      );
      catalog.products = products;
      catalog.syncedAt = new Date().toISOString();
      catalog.syncSource = STORE;
      fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
    }
    await sleep(90);
  }

  catalog.products = products;
  catalog.syncedAt = new Date().toISOString();
  catalog.syncSource = STORE;
  catalog.imageSync = {
    withImage,
    updated,
    failed: failed.length,
    missing: failed,
  };
  fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
  console.log(JSON.stringify({ withImage, updated, failed: failed.length, total: products.length }, null, 2));
  if (failed.length) {
    console.log("MISSING:");
    failed.slice(0, 30).forEach((f) => console.log(`  ${f.id} ${f.slug}`));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

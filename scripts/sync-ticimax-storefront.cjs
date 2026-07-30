/**
 * Sync product images (+ soft price hints) from live Ticimax storefront HTML.
 * Usage: node scripts/sync-ticimax-storefront.cjs
 */
const fs = require("fs");
const path = require("path");

const STORE = "https://aromatherapica.com";
const ROOT = path.join(__dirname, "..");
const CATALOG = path.join(ROOT, "public", "data", "catalog.json");

const CATEGORY_PATHS = [
  "/ucucu-yaglar",
  "/sabit-tasiyici-yaglar",
  "/cilt-bakimi",
  "/cilt-bakim-yaglari",
  "/sac-bakimi",
  "/vucut-bakimi",
  "/dus-jelleri",
  "/masaj-yaglari",
  "/gul-sulari",
  "/dogal-sabunlar",
  "/ozel-bakim-urunleri",
  "/urunler",
  "/",
];

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "AromatherapicaSync/1.0",
      Accept: "text/html",
    },
  });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

function decodeHtml(s) {
  return String(s || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

/** Parse product cards from Ticimax listing HTML */
function extractProducts(html) {
  const out = [];
  // Split roughly by productItem blocks
  const blocks = html.split(/class="[^"]*productItem[^"]*"/i);
  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].slice(0, 6000);
    const img =
      (block.match(
        /(?:src|data-src|data-original)=["'](https:\/\/static\.ticimax\.cloud\/74521\/Uploads\/UrunResimleri\/[^"']+)["']/i,
      ) || [])[1] ||
      (block.match(
        /(?:src|data-src)=["'](\/\/static\.ticimax\.cloud\/74521\/Uploads\/UrunResimleri\/[^"']+)["']/i,
      ) || [])[1];
    const href =
      (block.match(/productName[\s\S]{0,400}?href=["']([^"']+)["']/i) ||
        block.match(/href=["']([^"']+)["'][^>]*>\s*<img/i) ||
        block.match(/href=["'](\/[^"']+)["']/i) ||
        [])[1];
    const name =
      (block.match(/productName[\s\S]{0,400}?>([^<]{2,120})</i) || [])[1] ||
      (block.match(/alt=["']([^"']{2,120})["']/i) || [])[1];
    if (!href && !img) continue;
    let imageUrl = img ? decodeHtml(img) : null;
    if (imageUrl && imageUrl.startsWith("//")) imageUrl = "https:" + imageUrl;
    // Prefer full size over thumb when possible
    if (imageUrl) imageUrl = imageUrl.replace("/thumb/", "/");
    const cleanHref = href ? decodeHtml(href).split("?")[0] : "";
    const slug = cleanHref
      .replace(/^https?:\/\/[^/]+/i, "")
      .replace(/^\//, "")
      .replace(/\/$/, "")
      .split("/")
      .filter(Boolean)
      .pop();
    out.push({
      slug: slug || null,
      href: cleanHref.startsWith("http") ? cleanHref : cleanHref ? STORE + cleanHref : null,
      name: name ? decodeHtml(name).replace(/\s+/g, " ").trim() : null,
      imageUrl,
    });
  }
  return out;
}

function scoreMatch(a, b) {
  const na = String(a || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
  const nb = String(b || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
  if (!na || !nb) return 0;
  if (na === nb) return 100;
  if (na.includes(nb) || nb.includes(na)) return 80;
  // token overlap
  let hit = 0;
  const ta = na.match(/.{1,}/) ? [na] : [];
  void ta;
  // simple shared prefix length
  let i = 0;
  while (i < Math.min(na.length, nb.length) && na[i] === nb[i]) i += 1;
  return Math.min(70, Math.floor((i / Math.max(na.length, nb.length)) * 70));
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
  const products = catalog.products || [];
  const found = [];

  for (const cat of CATEGORY_PATHS) {
    try {
      const html = await fetchText(STORE + cat);
      const items = extractProducts(html);
      console.log(cat, "->", items.length, "cards");
      found.push(...items);
    } catch (err) {
      console.warn("skip", cat, err.message);
    }
  }

  // Dedupe by slug/image
  const bySlug = new Map();
  for (const item of found) {
    if (!item.slug && !item.imageUrl) continue;
    const key = item.slug || item.imageUrl;
    if (!bySlug.has(key) || (item.imageUrl && !bySlug.get(key).imageUrl)) {
      bySlug.set(key, item);
    }
  }
  const live = [...bySlug.values()];
  console.log("unique live products", live.length);

  let updated = 0;
  for (const p of products) {
    let best = null;
    let bestScore = 0;
    for (const liveItem of live) {
      const s = Math.max(scoreMatch(p.slug, liveItem.slug), scoreMatch(p.name, liveItem.name));
      if (s > bestScore) {
        bestScore = s;
        best = liveItem;
      }
    }
    if (best && bestScore >= 70 && best.imageUrl) {
      if (p.imageUrl !== best.imageUrl) {
        p.imageUrl = best.imageUrl;
        updated += 1;
      }
      if (best.href) p.ticimaxUrl = best.href;
      if (best.slug && !p.ticimaxSlug) p.ticimaxSlug = best.slug;
    } else if (!p.imageUrl) {
      // Heuristic CDN path from slug (common Ticimax pattern)
      const guess = `https://static.ticimax.cloud/74521/Uploads/UrunResimleri/${p.slug}.png`;
      // Don't set unverified guess as primary — leave null
      void guess;
    }
  }

  catalog.products = products;
  catalog.syncedAt = new Date().toISOString();
  catalog.syncSource = STORE;
  fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
  console.log("updated images:", updated, "/", products.length);
  console.log("wrote", CATALOG);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

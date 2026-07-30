/** Map CDN image filenames from a saved Ticimax HTML dump onto catalog.json */
const fs = require("fs");
const path = require("path");

const CATALOG = path.join(__dirname, "..", "public", "data", "catalog.json");
const HTML = path.join(process.env.TEMP || "/tmp", "arom2.html");

function normalize(s) {
  return String(s || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

const html = fs.existsSync(HTML) ? fs.readFileSync(HTML, "utf8") : "";
const imgs = [
  ...new Set(
    [...html.matchAll(/https:\/\/static\.ticimax\.cloud\/74521\/[Uu]ploads\/[Uu]run[Rr]esimleri\/(?:thumb\/)?[^"'\\\s>]+/gi)].map(
      (m) => m[0].replace("/thumb/", "/"),
    ),
  ),
];

console.log("images in dump", imgs.length);

const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
const products = catalog.products || [];
let updated = 0;

for (const p of products) {
  const slugN = normalize(p.slug);
  const nameN = normalize(p.name);
  let best = null;
  let score = 0;
  for (const img of imgs) {
    const file = normalize(img.split("/").pop().replace(/\.[a-z0-9]+$/i, ""));
    let s = 0;
    if (file.includes(slugN) || slugN.includes(file.slice(0, Math.min(file.length, slugN.length)))) s = 90;
    else if (slugN && file.startsWith(slugN.slice(0, Math.min(12, slugN.length)))) s = 75;
    else if (nameN && file.includes(nameN.slice(0, 10))) s = 60;
    if (s > score) {
      score = s;
      best = img;
    }
  }
  if (best && score >= 75) {
    if (p.imageUrl !== best) {
      p.imageUrl = best;
      updated += 1;
    }
    if (!p.ticimaxUrl) p.ticimaxUrl = `https://aromatherapica.com/${p.slug}-${p.id}`;
  } else if (!p.ticimaxUrl) {
    p.ticimaxUrl = `https://aromatherapica.com/${p.slug}-${p.id}`;
  }
}

catalog.products = products;
catalog.syncedAt = new Date().toISOString();
fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
console.log({ updated, withImage: products.filter((p) => p.imageUrl).length, total: products.length });

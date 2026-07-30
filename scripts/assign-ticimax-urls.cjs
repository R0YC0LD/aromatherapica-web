/**
 * Ensure every catalog product has a Ticimax storefront URL: /{slug}-{id}
 * Keep existing images; fill missing ticimaxUrl fields.
 */
const fs = require("fs");
const path = require("path");

const CATALOG = path.join(__dirname, "..", "public", "data", "catalog.json");
const STORE = "https://aromatherapica.com";

const catalog = JSON.parse(fs.readFileSync(CATALOG, "utf8"));
const products = catalog.products || [];
let urls = 0;

for (const p of products) {
  const url = `${STORE}/${p.slug}-${p.id}`;
  if (!p.ticimaxUrl) {
    p.ticimaxUrl = url;
    urls += 1;
  }
}

catalog.products = products;
catalog.commerce = {
  mode: "ticimax-hybrid",
  storeUrl: STORE,
  note: "Sepete ekle / ödeme Ticimax ürün ve checkout sayfalarına yönlendirilir.",
};
catalog.syncedAt = new Date().toISOString();
fs.writeFileSync(CATALOG, JSON.stringify(catalog, null, 2));
console.log({ urlsAssigned: urls, withImage: products.filter((p) => p.imageUrl).length, total: products.length });

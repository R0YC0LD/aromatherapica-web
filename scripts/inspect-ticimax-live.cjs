const fs = require("fs");
const path = require("path");

const htmlPath = path.join(process.env.TEMP || "/tmp", "arom2.html");
const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, "utf8") : "";

const imgs = [...html.matchAll(/https:\/\/static\.ticimax\.cloud\/74521\/[^"'\\\s>]+\.(?:jpg|jpeg|png|webp)/gi)].map(
  (m) => m[0],
);
const productHrefs = [...html.matchAll(/href="(\/[^"]+)"/g)]
  .map((m) => m[1])
  .filter((h) => /urun|yag|sabun|gul|masaj|cilt|dus|bakim/i.test(h));

console.log("cdn images sample", [...new Set(imgs)].slice(0, 12));
console.log("href sample", [...new Set(productHrefs)].slice(0, 40));

const catalog = JSON.parse(fs.readFileSync("public/data/catalog.json", "utf8"));
const a = catalog.products || [];
console.log("catalog", a.length, "withImage", a.filter((x) => x.imageUrl).length);
console.log("sample", a.slice(0, 2));

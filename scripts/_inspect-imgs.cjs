const STORE = "https://www.aromatherapica.com";

async function inspect(url) {
  const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
  const h = await r.text();
  const imgs = [...h.matchAll(/https:\/\/static\.ticimax\.cloud[^"'\\\s>]+/gi)].map((m) => m[0]);
  const uniq = [...new Set(imgs)];
  console.log("\n", url, "status", r.status, "imgs", uniq.length);
  uniq.slice(0, 15).forEach((x) => console.log(" ", x));
}

(async () => {
  for (const u of [
    STORE + "/hint-yagi-30-ml-539",
    STORE + "/leg-massage-oil-675",
    STORE + "/gul-suyu-250-ml-670",
    STORE + "/biberiye-ucucu-yagi-15-ml-538",
    STORE + "/lavanta-ucucu-yagi-15-ml-537",
  ]) {
    await inspect(u);
  }
})();

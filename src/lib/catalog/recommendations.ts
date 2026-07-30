/**
 * Cart / drawer product recommendations.
 * Logic: oil family (essential vs carrier) + botanical affinity pairs + category fill.
 */

export type RecommendableProduct = {
  id: number;
  variantId?: number | null;
  slug: string;
  name: string;
  categoryId?: number | null;
  categoryName?: string | null;
  price: number;
  salePrice?: number | null;
  stock: number;
  active: boolean;
  imageUrl?: string | null;
};

export type ProductRecommendation = {
  product: RecommendableProduct;
  reason: string;
  score: number;
};

/** Botanical affinities (Turkish base names → companions). */
const AFFINITIES: Record<string, string[]> = {
  lavanta: ["biberiye", "bergamot", "nane", "jojoba", "tatli badem", "badem", "gül"],
  biberiye: ["lavanta", "nane", "jojoba", "hint"],
  "cay agaci": ["lavanta", "nane", "jojoba", "aloe vera"],
  nane: ["lavanta", "okaleptus", "biberiye", "tatli badem"],
  "cin nanesi": ["lavanta", "nane", "okaleptus"],
  okaleptus: ["nane", "lavanta", "cay agaci"],
  kekik: ["lavanta", "nane", "susam", "jojoba"],
  bergamot: ["lavanta", "nane", "jojoba"],
  adacayi: ["lavanta", "biberiye", "jojoba"],
  anason: ["nane", "lavanta", "badem"],
  ardic: ["lavanta", "biberiye", "susam"],
  amber: ["lavanta", "bergamot", "jojoba"],
  feslegen: ["lavanta", "nane", "badem"],
  "defne yapragi": ["biberiye", "lavanta", "jojoba"],
  "cam terebentin": ["nane", "okaleptus", "susam"],
  "ayni sefa": ["lavanta", "badem", "kantaron"],
  aynisefa: ["lavanta", "badem", "kantaron"],
  "at kestanesi": ["kantaron", "badem", "masaj"],
  jojoba: ["lavanta", "biberiye", "cay agaci", "argan", "badem"],
  argan: ["jojoba", "badem", "lavanta", "hindistan cevizi"],
  "tatli badem": ["lavanta", "nane", "biberiye", "kantaron"],
  badem: ["lavanta", "nane", "jojoba"],
  "aci badem": ["lavanta", "jojoba"],
  "hindistan cevizi": ["lavanta", "nane", "argan", "jojoba"],
  corekotu: ["kantaron", "susam", "badem", "hint"],
  kantaron: ["lavanta", "badem", "corekotu"],
  hint: ["biberiye", "lavanta", "jojoba"],
  susam: ["kekik", "nane", "lavanta"],
  "aloe vera": ["lavanta", "cay agaci", "jojoba"],
  avokado: ["lavanta", "badem", "jojoba"],
  "bugday ozu": ["argan", "jojoba", "badem"],
  kenevir: ["lavanta", "biberiye", "jojoba"],
  babassu: ["lavanta", "jojoba", "hindistan cevizi"],
  ceviz: ["badem", "jojoba"],
  "elma cekirdegi": ["badem", "jojoba", "lavanta"],
};

const POPULAR_BOOST = new Set([
  "lavanta",
  "biberiye",
  "cay agaci",
  "nane",
  "jojoba",
  "argan",
  "tatli badem",
  "badem",
  "hindistan cevizi",
  "kantaron",
]);

function normalizeTr(input: string): string {
  return input
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/\s+/g, " ")
    .trim();
}

/** Strip size / “uçucu yağı” noise → botanical base key. */
export function oilBaseKey(name: string): string {
  let n = normalizeTr(name);
  n = n
    .replace(/\b\d+([.,]\d+)?\s*ml\b/g, "")
    .replace(/\bucucu\s*yag(i|ı)?\b/g, "")
    .replace(/\byag(i|ı)?\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return n;
}

export function isEssentialOil(product: RecommendableProduct): boolean {
  const cat = normalizeTr(product.categoryName || "");
  const name = normalizeTr(product.name || "");
  if (product.categoryId === 2) return true;
  if (cat.includes("ucucu")) return true;
  if (name.includes("ucucu")) return true;
  return false;
}

export function isCarrierOil(product: RecommendableProduct): boolean {
  const cat = normalizeTr(product.categoryName || "");
  if (product.categoryId === 3) return true;
  if (cat.includes("tasiyici") || cat.includes("sabit")) return true;
  return false;
}

function affinityFor(base: string): string[] {
  if (AFFINITIES[base]) return AFFINITIES[base];
  for (const [key, list] of Object.entries(AFFINITIES)) {
    if (base.includes(key) || key.includes(base)) return list;
  }
  return [];
}

function matchesAffinity(candidateBase: string, targets: string[]): boolean {
  return targets.some((t) => candidateBase === t || candidateBase.includes(t) || t.includes(candidateBase));
}

function defaultReason(seed: RecommendableProduct, candidate: RecommendableProduct): string {
  if (isEssentialOil(seed) && isCarrierOil(candidate)) {
    return "Uçucu yağınızı seyreltmek için taşıyıcı yağ";
  }
  if (isCarrierOil(seed) && isEssentialOil(candidate)) {
    return "Taşıyıcı yağınızla uyumlu uçucu yağ";
  }
  if (isEssentialOil(seed) && isEssentialOil(candidate)) {
    return "Birlikte güzel bir aroma ritüeli";
  }
  if ((seed.categoryId || 0) === (candidate.categoryId || 0)) {
    return "Aynı kategoriden tamamlayıcı seçim";
  }
  return "Bu ürünle sık tercih ediliyor";
}

/**
 * Rank complementary products for the seed item (usually the last added oil).
 */
export function getRecommendations(options: {
  seed: RecommendableProduct | null | undefined;
  catalog: RecommendableProduct[];
  excludeIds?: Iterable<number>;
  limit?: number;
}): ProductRecommendation[] {
  const { seed, catalog, limit = 4 } = options;
  if (!seed) return [];

  const exclude = new Set(options.excludeIds || []);
  exclude.add(seed.id);

  const seedBase = oilBaseKey(seed.name);
  const companions = affinityFor(seedBase);
  const seedEssential = isEssentialOil(seed);
  const seedCarrier = isCarrierOil(seed);

  const scored: ProductRecommendation[] = [];

  for (const product of catalog) {
    if (!product.active || product.stock <= 0) continue;
    if (exclude.has(product.id)) continue;

    const base = oilBaseKey(product.name);
    if (base && seedBase && base === seedBase) continue; // same oil, different size

    let score = 0;
    let reason = defaultReason(seed, product);

    if (companions.length && matchesAffinity(base, companions)) {
      score += 100;
      reason = `${seed.name.split(/\d/)[0].trim()} ile uyumlu tercih`;
    }

    if (seedEssential && isCarrierOil(product)) {
      score += 80;
      reason = "Uçucu yağınızı seyreltmek için taşıyıcı yağ";
    } else if (seedCarrier && isEssentialOil(product)) {
      score += 70;
      reason = "Taşıyıcı yağınızla uyumlu uçucu yağ";
    } else if (seedEssential && isEssentialOil(product)) {
      score += 45;
    } else if (seedCarrier && isCarrierOil(product)) {
      score += 30;
    }

    if (seed.categoryId && product.categoryId === seed.categoryId) {
      score += 25;
    }

    if (POPULAR_BOOST.has(base)) score += 12;

    // Prefer other oils when seed is an oil; demote care/shampoo noise
    if (seedEssential || seedCarrier) {
      if (isEssentialOil(product) || isCarrierOil(product)) score += 20;
      const n = normalizeTr(product.name + " " + (product.categoryName || ""));
      if (
        n.includes("sampuan") ||
        n.includes("krem") ||
        n.includes("dus") ||
        n.includes("sabun") ||
        n.includes("gunes") ||
        n.includes("nemlendir")
      ) {
        score -= 55;
      }
    }

    // Slight preference for mid/smaller bottles in drawer upsells
    if (/\b15\s*ml\b/i.test(product.name)) score += 4;
    if (/\b30\s*ml\b/i.test(product.name)) score += 2;

    if (score <= 0) continue;

    scored.push({ product, reason, score });
  }

  scored.sort((a, b) => b.score - a.score || a.product.name.localeCompare(b.product.name, "tr"));

  // Diversify: max 2 from same family bucket in top results
  const picked: ProductRecommendation[] = [];
  let carriers = 0;
  let essentials = 0;

  for (const item of scored) {
    if (picked.length >= limit) break;
    const carrier = isCarrierOil(item.product);
    const essential = isEssentialOil(item.product);
    if (carrier && carriers >= 2 && seedEssential) continue;
    if (essential && essentials >= 2 && seedCarrier) continue;
    picked.push(item);
    if (carrier) carriers += 1;
    if (essential) essentials += 1;
  }

  // Fill if diversification skipped too many
  if (picked.length < limit) {
    for (const item of scored) {
      if (picked.length >= limit) break;
      if (picked.some((p) => p.product.id === item.product.id)) continue;
      picked.push(item);
    }
  }

  return picked;
}

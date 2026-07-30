/** Turkish-friendly search helpers for static storefront. */

export type SearchableProduct = {
  id: number;
  slug: string;
  name: string;
  categoryName?: string | null;
  shortDesc?: string | null;
  sku?: string | null;
  imageUrl?: string | null;
  price: number;
  salePrice?: number | null;
  stock: number;
  active?: boolean;
};

export type SearchHit = SearchableProduct & {
  score: number;
  kind: "exact" | "partial" | "near";
};

const TR_MAP: Record<string, string> = {
  ı: "i",
  İ: "i",
  I: "i",
  ğ: "g",
  Ğ: "g",
  ü: "u",
  Ü: "u",
  ş: "s",
  Ş: "s",
  ö: "o",
  Ö: "o",
  ç: "c",
  Ç: "c",
};

export function normalizeSearchText(input: string): string {
  return String(input || "")
    .split("")
    .map((ch) => TR_MAP[ch] ?? ch)
    .join("")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(input: string): string[] {
  return normalizeSearchText(input).split(" ").filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return row[b.length];
}

function productBlob(p: SearchableProduct): string {
  return normalizeSearchText(
    [p.name, p.categoryName || "", p.shortDesc || "", p.sku || "", p.slug].join(" "),
  );
}

export function searchProducts(
  products: SearchableProduct[],
  query: string,
  options?: { limit?: number; fuzzy?: boolean },
): { hits: SearchHit[]; mode: "match" | "near" | "empty"; message?: string } {
  const limit = options?.limit ?? 8;
  const allowFuzzy = options?.fuzzy !== false;
  const q = query.trim();
  if (!q) return { hits: [], mode: "empty" };

  const nq = normalizeSearchText(q);
  const tokens = tokenize(q);
  if (!nq || tokens.length === 0) {
    return {
      hits: [],
      mode: "empty",
      message: "Böyle bir ürün bulunamamaktadır.",
    };
  }

  // Nonsense guard: very short random strings without vowels / digits after normalize
  const letters = nq.replace(/\s/g, "");
  if (letters.length >= 8 && !/[aeiou]/.test(letters) && !/\d/.test(letters)) {
    return {
      hits: [],
      mode: "empty",
      message: "Böyle bir ürün bulunamamaktadır.",
    };
  }

  const active = products.filter((p) => p.active !== false);
  const scored: SearchHit[] = [];

  for (const p of active) {
    const blob = productBlob(p);
    const name = normalizeSearchText(p.name);
    let score = 0;
    let kind: SearchHit["kind"] = "partial";

    if (name === nq || blob === nq) {
      score = 1000;
      kind = "exact";
    } else if (name.startsWith(nq)) {
      score = 850;
      kind = "exact";
    } else if (name.includes(nq) || blob.includes(nq)) {
      score = 700;
      kind = "partial";
    } else {
      const allTokens = tokens.every((t) => blob.includes(t));
      if (allTokens) {
        score = 560 + tokens.length * 20;
        kind = "partial";
      }
    }

    if (score > 0) scored.push({ ...p, score, kind });
  }

  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "tr"));

  if (scored.length > 0) {
    return { hits: scored.slice(0, limit), mode: "match" };
  }

  if (!allowFuzzy) {
    return {
      hits: [],
      mode: "empty",
      message: "Böyle bir ürün bulunamamaktadır.",
    };
  }

  // Near matches: token prefix / small edit distance on name words
  const near: SearchHit[] = [];
  for (const p of active) {
    const words = tokenize(p.name);
    let best = Infinity;
    for (const token of tokens) {
      for (const word of words) {
        if (word.startsWith(token) || token.startsWith(word)) {
          best = Math.min(best, 0.5);
        } else if (Math.abs(word.length - token.length) <= 2) {
          best = Math.min(best, levenshtein(word, token));
        }
      }
    }
    if (best <= 2) {
      near.push({ ...p, score: 400 - best * 40, kind: "near" });
    }
  }

  near.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "tr"));
  if (near.length > 0) {
    return {
      hits: near.slice(0, limit),
      mode: "near",
      message: "Tam eşleşme yok. Size yakın ürünler:",
    };
  }

  return {
    hits: [],
    mode: "empty",
    message: "Böyle bir ürün bulunamamaktadır.",
  };
}

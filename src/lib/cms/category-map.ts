import { slugify } from "@/lib/format";

/** Marketing nav slugs → matching rules against catalog categories / product names */
export const MARKETING_CATEGORY_RULES: Record<
  string,
  {
    label: string;
    /** Catalog category slugs (exact) including children */
    slugs?: string[];
    /** Name keywords (lowercase, Turkish-insensitive simple includes) */
    nameIncludes?: string[];
  }
> = {
  "ucucu-yaglar": {
    label: "Uçucu Yağlar",
    slugs: ["ucucu-yaglar"],
    nameIncludes: ["uçucu", "ucucu"],
  },
  "sabit-tasiyici-yaglar": {
    label: "Sabit (Taşıyıcı) Yağlar",
    slugs: ["sabit-tasiyici-yaglar"],
  },
  "cilt-bakimi": {
    label: "Cilt Bakımı",
    slugs: [
      "cilt-bakimi",
      "ince-ve-derin-cizgiler",
      "hassas-cilt",
      "nemlendiriciler",
      "lekeli-cilt",
      "gunes-kremleri",
      "cilt-bakim-yaglari",
      "guclendiriciler",
    ],
    nameIncludes: ["cilt bakım", "nemlendir", "güneş", "leke"],
  },
  "sac-bakimi": {
    label: "Saç Bakımı",
    slugs: ["sac-bakimi", "sampuanlar", "sac-bakim-kremleri", "sac-bakim-yaglari", "sac-ve-vucut-bakimi"],
    nameIncludes: ["şampuan", "sampuan", "saç"],
  },
  "vucut-bakimi": {
    label: "Vücut Bakımı",
    slugs: ["vucut-bakimi", "vucut-yaglari", "dus-jelleri", "masaj-yaglari", "sabit-tasiyici-yaglar"],
    nameIncludes: ["duş", "dus", "vücut", "vucut", "masaj"],
  },
  "ozel-bakim": {
    label: "Özel Bakım",
    slugs: ["ozel-bakim", "masaj-yaglari", "guclendiriciler", "gunes-kremleri", "hassas-cilt"],
    nameIncludes: ["masaj", "ağrı", "agri", "inforce", "artistic"],
  },
  "gul-sulari": {
    label: "Gül Suları",
    slugs: ["gul-sulari"],
    nameIncludes: ["gül suyu", "gul suyu", "gül su", "gul su"],
  },
  "dogal-sabunlar": {
    label: "Doğal Sabunlar",
    slugs: ["dogal-sabunlar"],
    nameIncludes: ["sabun"],
  },
  "hediye-secenekleri": {
    label: "Hediye Seçenekleri",
    slugs: ["hediye-secenekleri"],
    // Curated: popular gift-sized / named products
    nameIncludes: ["gül suyu", "lavanta", "hediye", "set"],
  },
  "aromaterapi-yaglari": {
    label: "Aromaterapi Yağları",
    slugs: ["aromaterapi-yaglari", "ucucu-yaglar", "sabit-tasiyici-yaglar"],
  },
  "sampuanlar": { label: "Şampuanlar", slugs: ["sampuanlar"] },
  "dus-jelleri": { label: "Duş Jelleri", slugs: ["dus-jelleri"] },
  "masaj-yaglari": { label: "Masaj Yağları", slugs: ["masaj-yaglari"] },
  "cilt-bakim-yaglari": { label: "Cilt Bakım Yağları", slugs: ["cilt-bakim-yaglari"] },
  "vucut-yaglari": { label: "Vücut Yağları", slugs: ["vucut-yaglari"] },
  "sac-bakim-kremleri": { label: "Saç Bakım Kremleri", slugs: ["sac-bakim-kremleri"] },
  "sac-bakim-yaglari": { label: "Saç Bakım Yağları", slugs: ["sac-bakim-yaglari"] },
  "ince-ve-derin-cizgiler": { label: "İnce ve Derin Çizgiler", slugs: ["ince-ve-derin-cizgiler"] },
  "hassas-cilt": { label: "Hassas Cilt", slugs: ["hassas-cilt"] },
  "nemlendiriciler": { label: "Nemlendiriciler", slugs: ["nemlendiriciler"] },
  "lekeli-cilt": { label: "Lekeli Cilt", slugs: ["lekeli-cilt"] },
  "gunes-kremleri": { label: "Güneş Kremleri", slugs: ["gunes-kremleri"] },
  "guclendiriciler": { label: "Güçlendiriciler", slugs: ["guclendiriciler"] },
  "sac-ve-vucut-bakimi": {
    label: "Saç ve Vücut Bakımı",
    slugs: ["sac-ve-vucut-bakimi", "sampuanlar", "sac-bakim-kremleri", "sac-bakim-yaglari", "vucut-yaglari", "dus-jelleri"],
  },
};

export const STORE_NAV_CATEGORIES = [
  { href: "/kategori/ucucu-yaglar", label: "Uçucu Yağlar" },
  { href: "/kategori/cilt-bakimi", label: "Cilt Bakımı" },
  { href: "/kategori/ozel-bakim", label: "Özel Bakım" },
  { href: "/kategori/sac-bakimi", label: "Saç Bakımı" },
  { href: "/kategori/vucut-bakimi", label: "Vücut Bakımı" },
  { href: "/kategori/gul-sulari", label: "Gül Suları" },
  { href: "/kategori/sabit-tasiyici-yaglar", label: "Taşıyıcı Yağlar" },
  { href: "/kategori/hediye-secenekleri", label: "Hediye" },
] as const;

export function productMatchesCategorySlug(
  product: {
    name: string;
    categoryId?: number | null;
    categoryName?: string | null;
    slug?: string;
  },
  categorySlug: string,
  catalogCategories: Array<{ id: number; slug: string; parentId: number }>,
): boolean {
  if (!categorySlug || categorySlug === "tum-urunler") return true;

  const rule = MARKETING_CATEGORY_RULES[categorySlug];
  const catById = new Map(catalogCategories.map((c) => [c.id, c]));
  const slugById = (id: number | null | undefined) => (id != null ? catById.get(id)?.slug : undefined);

  const productCatSlug = slugById(product.categoryId) || slugify(product.categoryName || "");

  // Collect descendant slugs for parent categories in catalog
  const allowedSlugs = new Set<string>(rule?.slugs || [categorySlug]);
  if (!rule) {
    const root = catalogCategories.find((c) => c.slug === categorySlug);
    if (root) {
      allowedSlugs.add(root.slug);
      for (const c of catalogCategories) {
        if (c.parentId === root.id) allowedSlugs.add(c.slug);
      }
    }
  } else {
    // Also include children of any listed parent slug
    for (const s of [...allowedSlugs]) {
      const root = catalogCategories.find((c) => c.slug === s);
      if (!root) continue;
      for (const c of catalogCategories) {
        if (c.parentId === root.id) allowedSlugs.add(c.slug);
      }
    }
  }

  if (productCatSlug && allowedSlugs.has(productCatSlug)) return true;

  // Admin panel stores STORE_NAV labels (e.g. "Hediye", "Taşıyıcı Yağlar")
  const navMatch = STORE_NAV_CATEGORIES.find((c) => c.href === `/kategori/${categorySlug}`);
  if (navMatch && (product.categoryName || "").trim() === navMatch.label) return true;

  const name = (product.name || "").toLocaleLowerCase("tr");
  const catName = (product.categoryName || "").toLocaleLowerCase("tr");
  if (rule?.nameIncludes?.some((k) => name.includes(k) || catName.includes(k))) return true;

  // Fallback: slugified category name equals request
  if (productCatSlug === categorySlug) return true;
  if (slugify(product.categoryName || "") === categorySlug) return true;

  return false;
}

export function getMarketingCategorySlugs(): string[] {
  return Object.keys(MARKETING_CATEGORY_RULES);
}

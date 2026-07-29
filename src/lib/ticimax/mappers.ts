import type {
  NormalizedCategory,
  NormalizedProduct,
  NormalizedVariant,
  TicimaxCategoryRaw,
  TicimaxProductRaw,
  TicimaxVariationRaw,
} from "@/lib/ticimax/types";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function mapCategory(raw: TicimaxCategoryRaw): NormalizedCategory {
  const name = raw.Tanim?.trim() || `Kategori ${raw.ID ?? 0}`;
  const slugFromUrl = raw.Url?.split("/").filter(Boolean).pop();
  return {
    id: raw.ID ?? 0,
    parentId: raw.PID ?? 0,
    name,
    slug: slugFromUrl || slugify(name) || String(raw.ID ?? 0),
    active: raw.Aktif !== false,
    sortOrder: raw.Sira ?? 0,
    seoTitle: raw.SeoSayfaBaslik || undefined,
    seoDescription: raw.SeoSayfaAciklama || undefined,
  };
}

export function buildCategoryTree(categories: NormalizedCategory[]): NormalizedCategory[] {
  const byId = new Map(categories.map((c) => [c.id, { ...c, children: [] as NormalizedCategory[] }]));
  const roots: NormalizedCategory[] = [];

  for (const cat of byId.values()) {
    if (cat.parentId && byId.has(cat.parentId)) {
      byId.get(cat.parentId)!.children!.push(cat);
    } else {
      roots.push(cat);
    }
  }

  const sortRecursive = (nodes: NormalizedCategory[]) => {
    nodes.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, "tr"));
    nodes.forEach((n) => n.children && sortRecursive(n.children));
  };
  sortRecursive(roots);
  return roots;
}

export function mapVariant(raw: TicimaxVariationRaw, productId: number): NormalizedVariant {
  const price = Number(raw.SatisFiyati ?? 0);
  const salePrice = raw.IndirimliFiyati && raw.IndirimliFiyati > 0 ? Number(raw.IndirimliFiyati) : undefined;
  const image = asArray(raw.Resimler)[0]?.Resim || asArray(raw.Resimler)[0]?.ResimThumb;

  return {
    id: raw.ID ?? 0,
    productId,
    sku: raw.StokKodu || undefined,
    barcode: raw.Barkod || undefined,
    price,
    salePrice: salePrice && salePrice < price ? salePrice : undefined,
    stock: Math.max(0, Number(raw.StokAdedi ?? 0)),
    vatRate: raw.KdvOrani !== undefined ? Number(raw.KdvOrani) : undefined,
    active: raw.Aktif !== false,
    options: asArray(raw.Ozellikler).map((o) => ({
      name: o.Tanim || "Seçenek",
      value: o.Deger || "",
    })),
    imageUrl: image || undefined,
  };
}

export function mapProduct(raw: TicimaxProductRaw): NormalizedProduct {
  const id = raw.ID ?? 0;
  const name = raw.UrunAdi?.trim() || `Ürün ${id}`;
  const slugFromUrl = raw.UrunUrl?.split("/").filter(Boolean).pop();
  const variants = asArray(raw.Varyasyonlar).map((v) => mapVariant(v, id));

  const primary = variants[0];
  const images = [
    ...asArray(raw.Resimler).map((r) => r.Resim || r.ResimThumb).filter(Boolean) as string[],
    ...variants.map((v) => v.imageUrl).filter(Boolean) as string[],
  ];

  const uniqueImages = [...new Set(images)];
  const price = primary?.price ?? Number(raw.SatisFiyati ?? 0);
  const salePrice = primary?.salePrice ?? (raw.IndirimliFiyati ? Number(raw.IndirimliFiyati) : undefined);
  const stock = variants.length
    ? variants.reduce((sum, v) => sum + v.stock, 0)
    : Number(raw.ToplamStokAdedi ?? 0);

  return {
    id,
    name,
    slug: slugFromUrl || slugify(name) || String(id),
    description: raw.Aciklama || undefined,
    categoryId: raw.AnaKategoriID || undefined,
    categoryName: raw.AnaKategori || undefined,
    brandId: raw.MarkaID || undefined,
    brandName: raw.Marka || undefined,
    active: raw.Aktif !== false,
    price,
    salePrice,
    stock,
    vatRate: primary?.vatRate,
    images: uniqueImages,
    variants,
    seoTitle: raw.SeoSayfaBaslik || undefined,
    seoDescription: raw.SeoSayfaAciklama || undefined,
  };
}

export function mapCategoriesFromSoapResult(result: unknown): NormalizedCategory[] {
  const list = asArray(result as TicimaxCategoryRaw | TicimaxCategoryRaw[]);
  return list.map(mapCategory).filter((c) => c.id > 0);
}

export function mapProductsFromSoapResult(result: unknown): NormalizedProduct[] {
  const list = asArray(result as TicimaxProductRaw | TicimaxProductRaw[]);
  return list.map(mapProduct).filter((p) => p.id > 0);
}

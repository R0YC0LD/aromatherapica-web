import { callTicimax } from "@/lib/ticimax/soap-client";
import {
  buildCategoryTree,
  mapCategoriesFromSoapResult,
  mapProduct,
  mapProductsFromSoapResult,
} from "@/lib/ticimax/mappers";
import type { NormalizedCategory, NormalizedProduct } from "@/lib/ticimax/types";

export async function fetchCategories(): Promise<NormalizedCategory[]> {
  const { data } = await callTicimax<unknown>("UrunServis", "SelectKategori", {
    kategoriID: 0,
    dil: "",
  });
  return buildCategoryTree(mapCategoriesFromSoapResult(data));
}

export async function fetchProducts(options?: {
  categoryId?: number;
  productId?: number;
  activeOnly?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "ASC" | "DESC";
}): Promise<NormalizedProduct[]> {
  const page = options?.page ?? 0;
  const pageSize = options?.pageSize ?? 48;

  const urunFiltre: Record<string, unknown> = {
    Aktif: options?.activeOnly === false ? -1 : 1,
    Firsat: -1,
    Indirimli: -1,
    Vitrin: -1,
    KategoriID: options?.categoryId ?? 0,
    MarkaID: 0,
    UrunKartiID: options?.productId ?? 0,
    TedarikciID: 0,
  };

  const urunSayfalama = {
    BaslangicIndex: page * pageSize,
    KayitSayisi: pageSize,
    SiralamaDegeri: options?.sortBy ?? "ID",
    SiralamaYonu: options?.sortDir ?? "DESC",
  };

  const { data } = await callTicimax<unknown>("UrunServis", "SelectUrun", {
    urunFiltre,
    urunSayfalama,
  });

  return mapProductsFromSoapResult(data).filter((p) => p.active);
}

export async function fetchProductById(productId: number): Promise<NormalizedProduct | null> {
  const products = await fetchProducts({ productId, activeOnly: false, pageSize: 1 });
  return products[0] ?? null;
}

export async function fetchVariationsByProduct(productId: number) {
  const varyasyonFiltre = {
    Aktif: -1,
    UrunKartiID: productId,
  };
  const urunSayfalama = {
    BaslangicIndex: 0,
    KayitSayisi: 200,
    SiralamaDegeri: "ID",
    SiralamaYonu: "ASC",
  };
  const selectVaryasyonAyar = { KategoriGetir: true };

  const { data } = await callTicimax<unknown>("UrunServis", "SelectVaryasyon", {
    varyasyonFiltre,
    urunSayfalama,
    selectVaryasyonAyar,
  });

  const product = mapProduct({ ID: productId, Varyasyonlar: data as never });
  return product.variants;
}

export async function fetchProductCount(categoryId?: number): Promise<number> {
  const urunFiltre = {
    Aktif: 1,
    Firsat: -1,
    Indirimli: -1,
    Vitrin: -1,
    KategoriID: categoryId ?? 0,
    MarkaID: 0,
    UrunKartiID: 0,
    TedarikciID: 0,
  };

  const { data } = await callTicimax<number>("UrunServis", "SelectUrunCount", { urunFiltre });
  return Number(data ?? 0);
}

export async function fetchBrands() {
  const { data } = await callTicimax<unknown>("UrunServis", "SelectMarka", { markaID: 0 });
  const list = Array.isArray(data) ? data : data ? [data] : [];
  return list as Array<{ ID?: number; Tanim?: string; Aktif?: boolean }>;
}

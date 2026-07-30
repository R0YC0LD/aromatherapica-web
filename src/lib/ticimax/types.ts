export type TicimaxServiceName = "UrunServis" | "SiparisServis" | "UyeServis" | "CustomServis";

export interface TicimaxSoapResult<T> {
  data: T;
  durationMs: number;
}

export interface TicimaxCategoryRaw {
  ID?: number;
  PID?: number;
  Tanim?: string;
  Url?: string;
  Aktif?: boolean;
  Sira?: number;
  SeoSayfaBaslik?: string;
  SeoSayfaAciklama?: string;
  Icerik?: string;
  Kod?: string;
}

export interface TicimaxVariationRaw {
  ID?: number;
  UrunKartiID?: number;
  StokAdedi?: number;
  SatisFiyati?: number;
  IndirimliFiyati?: number;
  Barkod?: string;
  StokKodu?: string;
  Aktif?: boolean;
  KdvOrani?: number;
  ParaBirimi?: string;
  Resimler?: Array<{ Resim?: string; ResimThumb?: string }>;
  Ozellikler?: Array<{ Tanim?: string; Deger?: string }>;
}

export interface TicimaxProductRaw {
  ID?: number;
  UrunAdi?: string;
  Aciklama?: string;
  Aktif?: boolean;
  Marka?: string;
  MarkaID?: number;
  AnaKategori?: string;
  AnaKategoriID?: number;
  SatisBirimi?: string;
  UrunUrl?: string;
  SeoSayfaBaslik?: string;
  SeoSayfaAciklama?: string;
  Varyasyonlar?: TicimaxVariationRaw[];
  Resimler?: Array<{ Resim?: string; ResimThumb?: string }>;
  ToplamStokAdedi?: number;
  IndirimliFiyati?: number;
  SatisFiyati?: number;
}

export interface NormalizedCategory {
  id: number;
  parentId: number;
  name: string;
  slug: string;
  active: boolean;
  sortOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  children?: NormalizedCategory[];
}

export interface NormalizedVariant {
  id: number;
  productId: number;
  sku?: string;
  barcode?: string;
  price: number;
  salePrice?: number;
  stock: number;
  vatRate?: number;
  active: boolean;
  options: Array<{ name: string; value: string }>;
  imageUrl?: string;
}

export interface NormalizedProduct {
  id: number;
  name: string;
  slug: string;
  description?: string;
  categoryId?: number;
  categoryName?: string;
  brandId?: number;
  brandName?: string;
  active: boolean;
  price: number;
  salePrice?: number;
  stock: number;
  vatRate?: number;
  images: string[];
  variants: NormalizedVariant[];
  seoTitle?: string;
  seoDescription?: string;
  /** Live Ticimax product page (hybrid commerce). */
  ticimaxUrl?: string;
}

export interface CartLineInput {
  variantId: number;
  productId: number;
  quantity: number;
}

export interface StockPriceValidation {
  valid: boolean;
  lines: Array<{
    variantId: number;
    productId: number;
    quantity: number;
    price: number;
    salePrice?: number;
    stock: number;
    available: boolean;
    message?: string;
  }>;
  total: number;
}

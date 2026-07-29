export type ProductOverride = {
  name?: string;
  shortDesc?: string;
  description?: string;
  price?: number;
  salePrice?: number | null;
  stock?: number;
  active?: boolean;
  categoryName?: string;
  categoryId?: number | null;
  /** data URL or https URL */
  imageUrl?: string | null;
  updatedAt?: string;
};

export type CmsSettings = {
  siteName: string;
  freeShippingThreshold: number;
  contactEmail: string;
  contactPhone: string;
  ticimaxBaseUrl: string;
  ticimaxUyeKodu: string;
  ticimaxAlanAdi: string;
  ticimaxStoreUrl: string;
  /** When true + Node server, SOAP sync is allowed */
  integrationEnabled: boolean;
  adminPasswordHint: string;
  updatedAt?: string;
};

export type CmsState = {
  products: Record<string, ProductOverride>;
  settings: CmsSettings;
  version: number;
};

export const CMS_VERSION = 1;

export const DEFAULT_CMS_SETTINGS: CmsSettings = {
  siteName: "Aromatherapica",
  freeShippingThreshold: 100000,
  contactEmail: "info@aromatherapica.com",
  contactPhone: "",
  ticimaxBaseUrl: "",
  ticimaxUyeKodu: "",
  ticimaxAlanAdi: "",
  ticimaxStoreUrl: "",
  integrationEnabled: false,
  adminPasswordHint: "admin / 12345 (değiştirin)",
};

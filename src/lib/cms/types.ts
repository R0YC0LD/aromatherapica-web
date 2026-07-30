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

export type RitualCardSetting = {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  imageUrl?: string | null;
};

export type CmsSettings = {
  siteName: string;
  /** 0 = her zaman ücretsiz; >0 = bu tutar ve üzeri ücretsiz */
  freeShippingThreshold: number;
  /** Eşik altındayken kargo ücreti (TL) */
  shippingFee: number;
  contactEmail: string;
  contactPhone: string;
  ticimaxBaseUrl: string;
  ticimaxUyeKodu: string;
  ticimaxAlanAdi: string;
  ticimaxStoreUrl: string;
  /** When true + Node server, SOAP sync is allowed */
  integrationEnabled: boolean;
  adminPasswordHint: string;

  /** Top announcement bar */
  announcementText: string;
  announcementHref: string;

  /** Header / brand */
  logoUrl: string;
  faviconUrl: string;

  /** Hero */
  heroImageUrl: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroCta1Label: string;
  heroCta1Href: string;
  heroCta2Label: string;
  heroCta2Href: string;
  heroNoteTop: string;
  heroNoteBottom: string;

  /** Featured section */
  featuredEyebrow: string;
  featuredTitle: string;
  /** Comma-separated product ids; empty = newest */
  featuredProductIds: string;

  /** Gift banner */
  giftEyebrow: string;
  giftTitle: string;
  giftText: string;

  /** Ritual / category cards on home */
  ritualEyebrow: string;
  ritualTitle: string;
  ritualCards: RitualCardSetting[];

  updatedAt?: string;
};

export type CmsState = {
  products: Record<string, ProductOverride>;
  settings: CmsSettings;
  version: number;
};

export const CMS_VERSION = 2;

export const DEFAULT_CMS_SETTINGS: CmsSettings = {
  siteName: "Aromatherapica",
  freeShippingThreshold: 0,
  shippingFee: 99,
  contactEmail: "info@aromatherapica.com",
  contactPhone: "",
  ticimaxBaseUrl: "",
  ticimaxUyeKodu: "",
  ticimaxAlanAdi: "",
  ticimaxStoreUrl: "",
  integrationEnabled: false,
  adminPasswordHint: "admin / 12345 (değiştirin)",

  announcementText: "Saf aromaterapi yağlarını keşfedin →",
  announcementHref: "/kategori/ucucu-yaglar",

  logoUrl: "/aromatherapica-emblem.png",
  faviconUrl: "/favicon.png",

  heroImageUrl: "/hero-bottle.png",
  heroEyebrow: "Doğanın bilgisinden modern bakım ritüellerine",
  heroTitle: "Saf içerikler.\nÖzenli ritüeller.",
  heroDescription:
    "Bitkilerin özünü, duyulara hitap eden etkili bakım formülleriyle buluşturuyoruz. Günlük ritüelinize iyi gelecek ürünleri keşfedin.",
  heroCta1Label: "Cilt bakımını keşfet",
  heroCta1Href: "/kategori/cilt-bakimi",
  heroCta2Label: "Aromaterapi yağları",
  heroCta2Href: "/kategori/ucucu-yaglar",
  heroNoteTop: "Saf bitki özleri",
  heroNoteBottom: "Özenli formüller",

  featuredEyebrow: "Aromatherapica seçkisi",
  featuredTitle: "Çok sevilenler",
  featuredProductIds: "",

  giftEyebrow: "Aromatherapica'dan size",
  giftTitle: "İlk siparişinize özel bakım hediyesi",
  giftText: "Seçili alışverişlerde sürpriz ritüel ürününüz bizden.",

  ritualEyebrow: "Kendinize ayırdığınız anlar",
  ritualTitle: "Ritüelinizi seçin",
  ritualCards: [
    {
      title: "Aromaterapi Yağları",
      subtitle: "Saf ve konsantre",
      description: "Ruh halinize ve günlük ritüelinize eşlik eden bitkisel özler.",
      href: "/kategori/ucucu-yaglar",
      imageUrl: null,
    },
    {
      title: "Cilt Bakım Serisi",
      subtitle: "Günlük bakım",
      description: "Cildinize özen gösteren dengeli formüller.",
      href: "/kategori/cilt-bakimi",
      imageUrl: null,
    },
    {
      title: "Saç ve Vücut",
      subtitle: "Bütünsel bakım",
      description: "Günlük bakımınıza doğanın sakin ritmini taşıyan seçkiler.",
      href: "/kategori/vucut-bakimi",
      imageUrl: null,
    },
  ],
};

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

/** Full product created from admin (not in base catalog.json). */
export type CustomProduct = {
  id: number;
  slug: string;
  name: string;
  categoryId: number | null;
  categoryName: string;
  brandName?: string | null;
  price: number;
  salePrice?: number | null;
  stock: number;
  active: boolean;
  imageUrl?: string | null;
  description?: string | null;
  shortDesc?: string | null;
  sku?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type RitualCardSetting = {
  title: string;
  subtitle: string;
  description: string;
  href: string;
  imageUrl?: string | null;
};

export type ConscienceItemSetting = {
  title: string;
  text: string;
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

  /** Newsletter popup */
  popupEnabled: boolean;
  popupTitle: string;
  popupText: string;
  popupCta: string;
  popupDismiss: string;
  popupImageUrl: string;
  popupTermsHref: string;

  /** Search bestsellers */
  searchBestsellersTitle: string;
  /** Comma-separated product ids */
  searchBestsellerIds: string;

  /** Özenle alışveriş */
  conscienceTitle: string;
  conscienceItems: ConscienceItemSetting[];

  /** Footer blurb */
  footerAbout: string;
  footerInstagram: string;
  footerPinterest: string;
  footerYoutube: string;

  updatedAt?: string;
};

export type CmsState = {
  products: Record<string, ProductOverride>;
  /** Admin-created products (published globally via storefront.json). */
  customProducts: Record<string, CustomProduct>;
  /** Soft-deleted base catalog product ids. */
  deletedProductIds: number[];
  settings: CmsSettings;
  version: number;
};

export const CMS_VERSION = 4;

export const DEFAULT_CMS_SETTINGS: CmsSettings = {
  siteName: "Aromatherapica",
  freeShippingThreshold: 0,
  shippingFee: 99,
  contactEmail: "info@aromatherapica.com",
  contactPhone: "",
  ticimaxBaseUrl: "",
  ticimaxUyeKodu: "",
  ticimaxAlanAdi: "",
  ticimaxStoreUrl: "https://aromatherapica.com",
  integrationEnabled: false,
  adminPasswordHint: "admin / 12345 (değiştirin)",

  announcementText: "Saf aromaterapi yağlarını keşfedin →",
  announcementHref: "/kategori/ucucu-yaglar",

  logoUrl: "/aromatherapica-emblem.png",
  faviconUrl: "/aromatherapica-emblem.png",

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

  popupEnabled: true,
  popupTitle: "İlk siparişinize %15 indirim",
  popupText:
    "Yeni ürünlerden ilk siz haberdar olun, özel teklifleri kaçırmayın ve indirimli alışverişe başlayın.",
  popupCta: "KAYIT OL",
  popupDismiss: "HAYIR, TEŞEKKÜRLER",
  popupImageUrl: "/hero-bottle.png",
  popupTermsHref: "/icerik/mesafeli-satis",

  searchBestsellersTitle: "ÇOK SATANLAR…",
  searchBestsellerIds: "",

  conscienceTitle: "Özenle alışveriş",
  conscienceItems: [
    {
      title: "Hayvan dostu",
      text: "Ürünlerimiz hayvanlar üzerinde test edilmez.",
      imageUrl: "/conscience/rabbit.svg",
    },
    {
      title: "Bitkisel içerikler",
      text: "Formüllerimizde doğadan gelen içeriklere öncelik veririz.",
      imageUrl: "/conscience/leaf.svg",
    },
    {
      title: "Saf özler",
      text: "Aromaterapi seçkimiz özenle seçilmiş özlerden oluşur.",
      imageUrl: "/conscience/drop.svg",
    },
    {
      title: "Sorumlu ambalaj",
      text: "Geri dönüştürülebilir ambalaj seçeneklerini destekleriz.",
      imageUrl: "/conscience/recycle.svg",
    },
    {
      title: "İyi yaşam",
      text: "Bakımı günlük yaşamın sakin ve değerli bir parçası görürüz.",
      imageUrl: "/conscience/heart.svg",
    },
  ],

  footerAbout:
    "Doğanın bilgisini modern bakım ritüelleriyle buluşturan, özenli ve duyusal Aromatherapica dünyası.",
  footerInstagram: "#instagram",
  footerPinterest: "#pinterest",
  footerYoutube: "#youtube",
};

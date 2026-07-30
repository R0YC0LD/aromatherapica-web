/** Botanical ingredient encyclopedia for PDP ingredient icons + copy. */

export type IngredientProfile = {
  key: string;
  name: string;
  latin: string;
  role: string;
  /** Round icon path under /ingredients */
  image: string;
  aliases: string[];
};

export const INGREDIENT_PROFILES: IngredientProfile[] = [
  {
    key: "lavanta",
    name: "Lavanta",
    latin: "Lavandula angustifolia",
    role: "Sakinleştirir, dengeler ve cildi yumuşak bir rahatlama hissiyle sarar.",
    image: "/ingredients/lavanta.svg",
    aliases: ["lavanta", "lavender"],
  },
  {
    key: "nane",
    name: "Nane",
    latin: "Mentha piperita",
    role: "Ferahlatır, canlandırır ve duyuları keskin bir serinlik ile uyandırır.",
    image: "/ingredients/nane-photo.jpg",
    aliases: ["nane", "cin nanesi", "mentha", "peppermint"],
  },
  {
    key: "biberiye",
    name: "Biberiye",
    latin: "Rosmarinus officinalis",
    role: "Canlandırır, odaklanmayı destekler ve saç-cilt bakımında tonik etki sunar.",
    image: "/ingredients/biberiye.svg",
    aliases: ["biberiye", "rosemary"],
  },
  {
    key: "cay-agaci",
    name: "Çay Ağacı",
    latin: "Melaleuca alternifolia",
    role: "Arındırır, dengeler ve cilt görünümünü berraklaştırmaya yardımcı olur.",
    image: "/ingredients/cay-agaci.svg",
    aliases: ["cay agaci", "çay ağacı", "tea tree"],
  },
  {
    key: "okaliptus",
    name: "Okaliptüs",
    latin: "Eucalyptus globulus",
    role: "Solunumu ferahlatır, zihni açar ve ferah bir aromaterapi deneyimi verir.",
    image: "/ingredients/okaliptus.svg",
    aliases: ["okaleptus", "okaliptus", "eucalyptus"],
  },
  {
    key: "kekik",
    name: "Kekik",
    latin: "Thymus vulgaris",
    role: "Güçlü aroması ile arındırıcı ve destekleyici bir bakım ritüeli sunar.",
    image: "/ingredients/kekik.svg",
    aliases: ["kekik", "thyme"],
  },
  {
    key: "bergamot",
    name: "Bergamot",
    latin: "Citrus bergamia",
    role: "Ruh halini aydınlatır, ferah narenciye notalarıyla denge sağlar.",
    image: "/ingredients/bergamot.svg",
    aliases: ["bergamot"],
  },
  {
    key: "jojoba",
    name: "Jojoba",
    latin: "Simmondsia chinensis",
    role: "Ciltle uyumlu nem dengesi kurar; uçucu yağlar için ideal taşıyıcıdır.",
    image: "/ingredients/jojoba.svg",
    aliases: ["jojoba"],
  },
  {
    key: "argan",
    name: "Argan",
    latin: "Argania spinosa",
    role: "Yoğun nem ve parlaklık verir; saç ve ciltte besleyici bir katman bırakır.",
    image: "/ingredients/argan.svg",
    aliases: ["argan"],
  },
  {
    key: "badem",
    name: "Badem",
    latin: "Prunus amygdalus",
    role: "Yumuşatır, besler ve masaj / seyreltme ritüellerinde nazik bir baz oluşturur.",
    image: "/ingredients/badem.svg",
    aliases: ["badem", "tatli badem", "aci badem", "almond"],
  },
  {
    key: "hindistan-cevizi",
    name: "Hindistan Cevizi",
    latin: "Cocos nucifera",
    role: "Derin nemlendirir, yumuşak bir doku bırakır ve saç bakımında sık tercih edilir.",
    image: "/ingredients/hindistan-cevizi.svg",
    aliases: ["hindistan cevizi", "coconut"],
  },
  {
    key: "kantaron",
    name: "Kantaron",
    latin: "Hypericum perforatum",
    role: "Geleneksel bakım ritüellerinde yatıştırıcı ve destekleyici yağ olarak kullanılır.",
    image: "/ingredients/kantaron.svg",
    aliases: ["kantaron", "st john"],
  },
  {
    key: "hint",
    name: "Hint Yağı",
    latin: "Ricinus communis",
    role: "Yoğun besler; saç ve kirpik bakımında klasikleşmiş bir taşıyıcı yağdır.",
    image: "/ingredients/hint.svg",
    aliases: ["hint", "castor"],
  },
  {
    key: "susam",
    name: "Susam",
    latin: "Sesamum indicum",
    role: "Antioksidan zenginliğiyle besler ve masaj yağları için pürüzsüz bir baz sunar.",
    image: "/ingredients/susam.svg",
    aliases: ["susam", "sesame"],
  },
  {
    key: "aloe",
    name: "Aloe Vera",
    latin: "Aloe barbadensis",
    role: "Serinletir, nemlendirir ve cildi yatıştırıcı bir bakım hissiyle destekler.",
    image: "/ingredients/aloe.svg",
    aliases: ["aloe", "aloe vera"],
  },
  {
    key: "avokado",
    name: "Avokado",
    latin: "Persea americana",
    role: "Zengin yağ asitleriyle besler ve kuru ciltte dolgun bir nem hissi bırakır.",
    image: "/ingredients/avokado.svg",
    aliases: ["avokado", "avocado"],
  },
  {
    key: "gul",
    name: "Gül",
    latin: "Rosa damascena",
    role: "Yumuşak bir aroma ve cilt bakımı için klasik, zarif bir bitkisel öz sunar.",
    image: "/ingredients/gul.svg",
    aliases: ["gul", "gül", "rosa"],
  },
  {
    key: "adacayi",
    name: "Adaçayı",
    latin: "Salvia officinalis",
    role: "Arındırıcı ve dengeleyici notalarla aromaterapi ritüellerini güçlendirir.",
    image: "/ingredients/adacayi.svg",
    aliases: ["adacayi", "adaçayı", "sage"],
  },
  {
    key: "feslegen",
    name: "Fesleğen",
    latin: "Ocimum basilicum",
    role: "Canlı, otumsu aromasıyla zihni ferahlatır ve bakım karışımlarına derinlik katar.",
    image: "/ingredients/feslegen.svg",
    aliases: ["feslegen", "fesleğen", "basil"],
  },
  {
    key: "corekotu",
    name: "Çörekotu",
    latin: "Nigella sativa",
    role: "Geleneksel destekleyici yağ; cilt bakımında besleyici bir dokunuş bırakır.",
    image: "/ingredients/corekotu.svg",
    aliases: ["corekotu", "çörekotu", "nigella"],
  },
];

function normalize(input: string) {
  return input
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c");
}

export function resolveIngredientsForProduct(product: {
  name: string;
  description?: string | null;
  categoryName?: string | null;
}): IngredientProfile[] {
  const hay = normalize(`${product.name} ${product.description || ""} ${product.categoryName || ""}`);
  const found: IngredientProfile[] = [];

  for (const profile of INGREDIENT_PROFILES) {
    if (profile.aliases.some((a) => hay.includes(normalize(a)))) {
      found.push(profile);
    }
  }

  if (found.length && /ucucu/.test(hay)) {
    const jojoba = INGREDIENT_PROFILES.find((p) => p.key === "jojoba");
    if (jojoba && !found.some((f) => f.key === "jojoba")) found.push(jojoba);
  }

  if (found.length === 0) {
    return INGREDIENT_PROFILES.filter((p) => ["lavanta", "jojoba", "aloe"].includes(p.key));
  }

  return found.slice(0, 6);
}

export function productStory(product: { name: string; categoryName?: string | null }) {
  const cat = product.categoryName || "bakım";
  return `${product.name}, Aromatherapica seçkisinde ${cat.toLocaleLowerCase("tr")} ritüelleri için özenle sunulur. Saf bitkisel karakterini koruyan formülü; günlük bakımınıza duyusal, sakin ve profesyonel bir dokunuş katar.`;
}

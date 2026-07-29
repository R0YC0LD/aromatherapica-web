import { describe, expect, it } from "vitest";
import { mapCategory, mapProduct, buildCategoryTree } from "@/lib/ticimax/mappers";

describe("ticimax mappers", () => {
  it("maps category and builds tree", () => {
    const parent = mapCategory({ ID: 1, PID: 0, Tanim: "Cilt Bakımı", Aktif: true, Sira: 1, Url: "/cilt-bakimi" });
    const child = mapCategory({ ID: 2, PID: 1, Tanim: "Yüz", Aktif: true, Sira: 1 });
    expect(parent.slug).toContain("cilt");
    const tree = buildCategoryTree([parent, child]);
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
  });

  it("maps product with sale price and stock", () => {
    const product = mapProduct({
      ID: 10,
      UrunAdi: "Lavanta Yağı",
      Aktif: true,
      SatisFiyati: 100,
      IndirimliFiyati: 80,
      Varyasyonlar: [
        {
          ID: 99,
          UrunKartiID: 10,
          SatisFiyati: 100,
          IndirimliFiyati: 80,
          StokAdedi: 5,
          Aktif: true,
          StokKodu: "LV-15",
        },
      ],
    });
    expect(product.id).toBe(10);
    expect(product.salePrice).toBe(80);
    expect(product.stock).toBe(5);
    expect(product.variants[0].sku).toBe("LV-15");
  });
});

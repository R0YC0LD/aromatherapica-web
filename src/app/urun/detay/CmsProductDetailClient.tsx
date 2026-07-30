"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ProductView } from "@/components/ProductView";
import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";

export default function CmsProductDetailClient() {
  const params = useSearchParams();
  const slug = (params.get("slug") || "").trim();
  const { catalog, mergeProduct, globalReady } = useCatalogOverrides();

  const product = useMemo(() => {
    if (!slug) return null;
    const found = catalog.find((p) => p.slug === slug);
    return found ? mergeProduct(found) : null;
  }, [catalog, mergeProduct, slug]);

  if (!globalReady && !product) {
    return (
      <div className="catalog-shell" style={{ padding: "48px 20px" }}>
        <p>Ürün yükleniyor…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="catalog-shell" style={{ padding: "48px 20px" }}>
        <h1>Ürün bulunamadı</h1>
        <p>Böyle bir ürün bulunamamaktadır.</p>
      </div>
    );
  }

  return <ProductView product={product} />;
}

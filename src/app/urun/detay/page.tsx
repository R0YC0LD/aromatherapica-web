import { Suspense } from "react";
import CmsProductDetailPage from "./CmsProductDetailClient";

export default function CmsProductDetailRoute() {
  return (
    <Suspense
      fallback={
        <div className="catalog-shell" style={{ padding: "48px 20px" }}>
          <p>Ürün yükleniyor…</p>
        </div>
      }
    >
      <CmsProductDetailPage />
    </Suspense>
  );
}

"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { NormalizedProduct } from "@/lib/ticimax/types";

type SortKey = "newest" | "price_asc" | "price_desc" | "name";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Yeni" },
  { key: "price_asc", label: "Fiyat ↑" },
  { key: "price_desc", label: "Fiyat ↓" },
  { key: "name", label: "İsim" },
];

function sortProducts(products: NormalizedProduct[], sort: SortKey) {
  const list = [...products];
  switch (sort) {
    case "price_asc":
      return list.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    case "price_desc":
      return list.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    case "name":
      return list.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    default:
      return list;
  }
}

export function CategoryProductGrid({
  products,
  emptyMessage,
}: {
  products: NormalizedProduct[];
  emptyMessage?: string;
}) {
  const [sort, setSort] = useState<SortKey>("newest");
  const sorted = useMemo(() => sortProducts(products, sort), [products, sort]);

  return (
    <>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", margin: "1rem 0 1.5rem" }}>
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSort(s.key)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textDecoration: sort === s.key ? "underline" : "none",
              fontWeight: sort === s.key ? 600 : 400,
              color: "inherit",
              font: "inherit",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">{emptyMessage || "Bu kategoride ürün bulunamadı."}</div>
      ) : (
        <div className="product-grid">
          {sorted.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

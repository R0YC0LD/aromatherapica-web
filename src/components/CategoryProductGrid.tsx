"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import type { NormalizedProduct } from "@/lib/ticimax/types";

type SortKey = "newest" | "price_asc" | "price_desc" | "name" | "name_desc";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Önerilen sıralama" },
  { key: "price_asc", label: "Fiyat: düşükten yükseğe" },
  { key: "price_desc", label: "Fiyat: yüksekten düşüğe" },
  { key: "name", label: "İsim: A → Z" },
  { key: "name_desc", label: "İsim: Z → A" },
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
    case "name_desc":
      return list.sort((a, b) => b.name.localeCompare(a.name, "tr"));
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const sorted = useMemo(() => sortProducts(products, sort), [products, sort]);
  const currentLabel = SORTS.find((s) => s.key === sort)?.label || "Sırala";

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <>
      <div className="catalog-toolbar">
        <p>
          <strong>{sorted.length}</strong> ürün
        </p>

        <div className="sort-menu" ref={rootRef}>
          <button
            type="button"
            className={`sort-menu-trigger${open ? " is-open" : ""}`}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span>Sırala</span>
            <strong>{currentLabel}</strong>
            <ChevronDown size={16} aria-hidden />
          </button>

          <AnimatePresence>
            {open ? (
              <motion.ul
                className="sort-menu-panel"
                role="listbox"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.22 }}
              >
                {SORTS.map((s) => (
                  <li key={s.key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={sort === s.key}
                      className={sort === s.key ? "is-active" : undefined}
                      onClick={() => {
                        setSort(s.key);
                        setOpen(false);
                      }}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </motion.ul>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state catalog-empty">{emptyMessage || "Bu kategoride ürün bulunamadı."}</div>
      ) : (
        <motion.div
          className="product-grid catalog-grid"
          key={sort}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          {sorted.map((p, index) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index * 0.03, 0.35) }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </>
  );
}

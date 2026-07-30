"use client";

import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { CategoryProductGrid } from "@/components/CategoryProductGrid";
import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import { productMatchesCategorySlug } from "@/lib/cms/category-map";
import { searchProducts } from "@/lib/search/query";
import type { NormalizedProduct } from "@/lib/ticimax/types";

export function CategorySearchAwareGrid({
  products,
  emptyMessage,
}: {
  products: NormalizedProduct[];
  emptyMessage?: string;
}) {
  const params = useSearchParams();
  const route = useParams<{ slug?: string }>();
  const categorySlug = String(route?.slug || "tum-urunler");
  const q = (params.get("q") || "").trim();
  const { catalog, mergeProduct } = useCatalogOverrides();

  const { list, notice } = useMemo(() => {
    // Prefer live CMS catalog (includes custom + deleted overlay); fall back to SSR list
    const base =
      catalog.length > 0
        ? catalog.map(mergeProduct).filter((p) => p.active)
        : products.map(mergeProduct).filter((p) => p.active);

    const inCategory = base.filter((p) =>
      productMatchesCategorySlug(
        {
          name: p.name,
          categoryId: p.categoryId,
          categoryName: p.categoryName,
          slug: p.slug,
        },
        categorySlug,
        [],
      ),
    );

    if (!q) {
      // While CMS catalog still loading, keep SSR products for the category
      if (!catalog.length) {
        return {
          list: products.map(mergeProduct).filter((p) => p.active),
          notice: null as string | null,
        };
      }
      return { list: inCategory, notice: null as string | null };
    }

    const searchable = inCategory.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      categoryName: p.categoryName,
      shortDesc: p.seoDescription,
      imageUrl: p.images[0] || null,
      price: p.price,
      salePrice: p.salePrice ?? null,
      stock: p.stock,
      active: p.active,
    }));

    // Site-wide search from header goes to tum-urunler — search all active catalog there
    const pool =
      categorySlug === "tum-urunler"
        ? base.map((p) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            categoryName: p.categoryName,
            shortDesc: p.seoDescription,
            imageUrl: p.images[0] || null,
            price: p.price,
            salePrice: p.salePrice ?? null,
            stock: p.stock,
            active: p.active,
          }))
        : searchable;

    const result = searchProducts(pool, q, { limit: 96, fuzzy: true });
    if (result.mode === "empty") {
      return { list: [] as NormalizedProduct[], notice: result.message || null };
    }

    const byId = new Map(base.map((p) => [p.id, p]));
    const hits = result.hits.map((h) => byId.get(h.id)).filter(Boolean) as NormalizedProduct[];
    return {
      list: hits,
      notice: result.mode === "near" ? result.message || null : null,
    };
  }, [catalog, products, mergeProduct, q, categorySlug]);

  return (
    <>
      {q ? (
        <div className="catalog-search-status" role="status">
          <p>
            Arama: <strong>“{q}”</strong>
          </p>
          {notice ? <p className="catalog-search-note">{notice}</p> : null}
          {!list.length ? (
            <p className="catalog-search-empty">Böyle bir ürün bulunamamaktadır.</p>
          ) : null}
        </div>
      ) : null}
      <CategoryProductGrid
        products={list}
        emptyMessage={q ? "Böyle bir ürün bulunamamaktadır." : emptyMessage}
      />
    </>
  );
}

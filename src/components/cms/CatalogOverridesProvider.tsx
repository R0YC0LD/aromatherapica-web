"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { applyProductOverride } from "@/lib/cms/merge";
import { fetchGlobalStorefront } from "@/lib/cms/remote";
import {
  resolveStorefrontCatalog,
  type CatalogRow,
} from "@/lib/cms/resolve-catalog";
import { applyRemoteCmsState, getCmsState, getProductOverride, subscribeCms } from "@/lib/cms/store";
import type { CmsSettings, ProductOverride } from "@/lib/cms/types";
import { DEFAULT_CMS_SETTINGS } from "@/lib/cms/types";
import { withBasePath } from "@/lib/paths";
import type { NormalizedProduct } from "@/lib/ticimax/types";

type Ctx = {
  settings: CmsSettings;
  overrides: Record<string, ProductOverride>;
  catalog: NormalizedProduct[];
  mergeProduct: (product: NormalizedProduct) => NormalizedProduct;
  getOverride: (id: number | string) => ProductOverride | undefined;
  revision: number;
  globalReady: boolean;
};

const CatalogOverridesContext = createContext<Ctx>({
  settings: DEFAULT_CMS_SETTINGS,
  overrides: {},
  catalog: [],
  mergeProduct: (p) => p,
  getOverride: () => undefined,
  revision: 0,
  globalReady: false,
});

export function CatalogOverridesProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);
  const [overrides, setOverrides] = useState<Record<string, ProductOverride>>({});
  const [settings, setSettings] = useState<CmsSettings>(DEFAULT_CMS_SETTINGS);
  const [baseRows, setBaseRows] = useState<CatalogRow[]>([]);
  const [globalReady, setGlobalReady] = useState(false);

  const refresh = useCallback(() => {
    const state = getCmsState();
    setOverrides(state.products);
    setSettings(state.settings);
    setRevision((r) => r + 1);
  }, []);

  useEffect(() => {
    refresh();
    return subscribeCms(refresh);
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    fetch(withBasePath("/data/catalog.json"))
      .then((r) => r.json())
      .then((data: { products?: CatalogRow[] }) => {
        if (!cancelled) setBaseRows(data.products || []);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const remote = await fetchGlobalStorefront();
        if (cancelled || !remote) return;
        const onAdmin =
          typeof window !== "undefined" && window.location.pathname.includes("/admin");
        if (!onAdmin) {
          applyRemoteCmsState(remote);
          refresh();
        }
      } catch (error) {
        console.warn("Global storefront yüklenemedi", error);
      } finally {
        if (!cancelled) setGlobalReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const catalog = useMemo(() => {
    const state = getCmsState();
    return resolveStorefrontCatalog(baseRows, state);
  }, [baseRows, revision]);

  const value = useMemo<Ctx>(
    () => ({
      settings,
      overrides,
      catalog,
      revision,
      globalReady,
      getOverride: (id) => overrides[String(id)] || getProductOverride(id),
      mergeProduct: (product) => applyProductOverride(product, overrides[String(product.id)]),
    }),
    [settings, overrides, catalog, revision, globalReady],
  );

  return (
    <CatalogOverridesContext.Provider value={value}>{children}</CatalogOverridesContext.Provider>
  );
}

export function useCatalogOverrides() {
  return useContext(CatalogOverridesContext);
}

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
import { applyRemoteCmsState, getCmsState, getProductOverride, subscribeCms } from "@/lib/cms/store";
import type { CmsSettings, ProductOverride } from "@/lib/cms/types";
import { DEFAULT_CMS_SETTINGS } from "@/lib/cms/types";
import type { NormalizedProduct } from "@/lib/ticimax/types";

type Ctx = {
  settings: CmsSettings;
  overrides: Record<string, ProductOverride>;
  mergeProduct: (product: NormalizedProduct) => NormalizedProduct;
  getOverride: (id: number | string) => ProductOverride | undefined;
  revision: number;
  globalReady: boolean;
};

const CatalogOverridesContext = createContext<Ctx>({
  settings: DEFAULT_CMS_SETTINGS,
  overrides: {},
  mergeProduct: (p) => p,
  getOverride: () => undefined,
  revision: 0,
  globalReady: false,
});

export function CatalogOverridesProvider({ children }: { children: ReactNode }) {
  const [revision, setRevision] = useState(0);
  const [overrides, setOverrides] = useState<Record<string, ProductOverride>>({});
  const [settings, setSettings] = useState<CmsSettings>(DEFAULT_CMS_SETTINGS);
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
    (async () => {
      try {
        const remote = await fetchGlobalStorefront();
        if (cancelled || !remote) return;
        // Visitors always see the published global storefront.
        // Admin unpublished local drafts remain until they open /admin and save.
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

  const value = useMemo<Ctx>(
    () => ({
      settings,
      overrides,
      revision,
      globalReady,
      getOverride: (id) => overrides[String(id)] || getProductOverride(id),
      mergeProduct: (product) => applyProductOverride(product, overrides[String(product.id)]),
    }),
    [settings, overrides, revision, globalReady],
  );

  return (
    <CatalogOverridesContext.Provider value={value}>{children}</CatalogOverridesContext.Provider>
  );
}

export function useCatalogOverrides() {
  return useContext(CatalogOverridesContext);
}

"use client";

import { useEffect } from "react";
import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import { withBasePath } from "@/lib/paths";

/** Applies CMS favicon / document title on the client (GitHub Pages friendly). */
export function SiteChromeEffects() {
  const { settings } = useCatalogOverrides();

  useEffect(() => {
    if (settings.siteName) {
      const base = document.title.includes("|")
        ? document.title.split("|").slice(1).join("|").trim()
        : "";
      if (!base) document.title = `${settings.siteName} — Doğadan Gelen Bakım Ritüelleri`;
    }

    const href = settings.faviconUrl?.startsWith("data:")
      ? settings.faviconUrl
      : withBasePath(settings.faviconUrl || "/aromatherapica-emblem.png");

    const ensureIcon = (rel: string, type?: string) => {
      let link = document.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      if (type) link.type = type;
      link.href = href;
      return link;
    };

    ensureIcon("icon", "image/png");
    ensureIcon("shortcut icon", "image/png");
    ensureIcon("apple-touch-icon");
  }, [settings.faviconUrl, settings.siteName]);

  return null;
}

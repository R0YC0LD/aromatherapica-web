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
      : withBasePath(settings.faviconUrl || "/favicon.png");

    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = href.startsWith("data:") ? "image/png" : "image/png";
    link.href = href;

    let apple = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
    if (!apple) {
      apple = document.createElement("link");
      apple.rel = "apple-touch-icon";
      document.head.appendChild(apple);
    }
    apple.href = href;
  }, [settings.faviconUrl, settings.siteName]);

  return null;
}

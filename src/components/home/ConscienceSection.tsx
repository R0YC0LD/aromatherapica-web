"use client";

import { useCatalogOverrides } from "@/components/cms/CatalogOverridesProvider";
import { withBasePath } from "@/lib/paths";

export function ConscienceSection() {
  const { settings } = useCatalogOverrides();
  const items = settings.conscienceItems?.length
    ? settings.conscienceItems
    : [];

  if (!items.length) return null;

  return (
    <section className="conscience-section" aria-label="Sorumlu alışveriş ilkeleri">
      <h2>{settings.conscienceTitle || "Özenle alışveriş"}</h2>
      <div className="conscience-grid">
        {items.map((item) => {
          const src = item.imageUrl?.startsWith("data:")
            ? item.imageUrl
            : withBasePath(item.imageUrl || "/conscience/leaf.svg");
          return (
            <article key={item.title}>
              <span className="conscience-icon has-image" aria-hidden>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

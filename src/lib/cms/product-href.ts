import { withBasePath } from "@/lib/paths";

/** Admin-created products use high ids and need a client product page on static export. */
export function isCmsCustomProductId(id: number): boolean {
  return id >= 900000;
}

export function productHref(slug: string, id?: number): string {
  if (id != null && isCmsCustomProductId(id)) {
    return `/urun/detay?slug=${encodeURIComponent(slug)}`;
  }
  return `/urun/${slug}`;
}

export function productImageSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("data:") || url.startsWith("http")) return url;
  return withBasePath(url);
}

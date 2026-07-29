import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const base =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.GITHUB_PAGES === "true"
    ? `https://r0yc0ld.github.io/aromatherapica-web`
    : "https://aromatherapica.com");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
    sitemap: `${base}/sitemap.xml`,
  };
}

import type { NextConfig } from "next";

const isGithubPages =
  process.env.GITHUB_PAGES === "true" || process.env.STATIC_EXPORT === "true";

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] || "aromatherapica-web";
const basePath = isGithubPages ? `/${repoName}` : "";

const nextConfig: NextConfig = {
  ...(isGithubPages
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: basePath,
        trailingSlash: true,
      }
    : {
        output: "standalone" as const,
      }),
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  env: {
    NEXT_PUBLIC_STATIC_EXPORT: isGithubPages ? "true" : "false",
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;

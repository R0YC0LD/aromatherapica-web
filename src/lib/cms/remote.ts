import {
  CMS_VERSION,
  DEFAULT_CMS_SETTINGS,
  type CmsSettings,
  type CmsState,
} from "@/lib/cms/types";

const REPO = "R0YC0LD/aromatherapica-web";
const BRANCH = "master";
const FILE_PATH = "public/data/storefront.json";
const TOKEN_KEY = "arom_cms_publish_token_v1";

export function getPublishToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setPublishToken(token: string) {
  if (!token) localStorage.removeItem(TOKEN_KEY);
  else localStorage.setItem(TOKEN_KEY, token.trim());
}

export function remoteStorefrontUrls(): string[] {
  const bust = Date.now();
  return [
    `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${FILE_PATH}?t=${bust}`,
    // same-origin after Pages deploy
  ];
}

export function normalizeCmsState(input: Partial<CmsState> | null | undefined): CmsState {
  const incoming = (input?.settings || {}) as Partial<CmsSettings>;
  return {
    version: CMS_VERSION,
    products: input?.products || {},
    settings: {
      ...DEFAULT_CMS_SETTINGS,
      ...incoming,
      ritualCards:
        Array.isArray(incoming.ritualCards) && incoming.ritualCards.length > 0
          ? incoming.ritualCards
          : DEFAULT_CMS_SETTINGS.ritualCards,
      conscienceItems:
        Array.isArray(incoming.conscienceItems) && incoming.conscienceItems.length > 0
          ? incoming.conscienceItems
          : DEFAULT_CMS_SETTINGS.conscienceItems,
    },
  };
}

/** Public payload — never include secrets. */
export function toPublishPayload(state: CmsState): CmsState {
  const settings = { ...state.settings };
  return {
    version: CMS_VERSION,
    products: state.products || {},
    settings,
  };
}

export async function fetchGlobalStorefront(): Promise<CmsState | null> {
  const urls = [
    ...remoteStorefrontUrls(),
    // relative path for GitHub Pages basePath
    `${typeof window !== "undefined" ? (process.env.NEXT_PUBLIC_BASE_PATH || "") : ""}/data/storefront.json?t=${Date.now()}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const json = (await res.json()) as Partial<CmsState>;
      if (!json || typeof json !== "object") continue;
      return normalizeCmsState(json);
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function publishStorefrontToGithub(
  state: CmsState,
  token: string,
): Promise<{ ok: true; htmlUrl: string } | { ok: false; error: string }> {
  if (!token.trim()) {
    return { ok: false, error: "GitHub token gerekli (admin ayarlarından)." };
  }

  const payload = toPublishPayload(state);
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2))));
  const apiBase = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`;

  try {
    let sha: string | undefined;
    const head = await fetch(`${apiBase}?ref=${BRANCH}`, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token.trim()}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (head.ok) {
      const meta = (await head.json()) as { sha?: string };
      sha = meta.sha;
    } else if (head.status !== 404) {
      const err = await head.text();
      return { ok: false, error: `GitHub okuma hatası: ${head.status} ${err.slice(0, 180)}` };
    }

    const put = await fetch(apiBase, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token.trim()}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        message: "chore: publish global storefront CMS",
        content,
        branch: BRANCH,
        sha,
      }),
    });

    if (!put.ok) {
      const err = await put.text();
      return { ok: false, error: `Yayın başarısız: ${put.status} ${err.slice(0, 220)}` };
    }

    const body = (await put.json()) as { content?: { html_url?: string } };
    return {
      ok: true,
      htmlUrl: body.content?.html_url || `https://github.com/${REPO}/blob/${BRANCH}/${FILE_PATH}`,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Yayın hatası",
    };
  }
}

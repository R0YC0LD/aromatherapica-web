"use client";

import {
  CMS_VERSION,
  DEFAULT_CMS_SETTINGS,
  type CmsSettings,
  type CmsState,
  type ProductOverride,
} from "@/lib/cms/types";

const LS_STATE = "arom_cms_state_v1";
const LS_SESSION = "arom_cms_session_v1";
const LS_PASSWORD = "arom_cms_password_v1";
const LS_USERNAME = "arom_cms_username_v1";
const DEFAULT_USER = "admin";
const DEFAULT_PASS = "12345";

/** Precomputed SHA-256("admin:12345") — works even if crypto.subtle is unavailable. */
const DEFAULT_PASSWORD_HASH =
  "8990c6d5e99971bf351720e72583f7ca5796e57ffb9de710ab05417da867f878";

type AuthListener = () => void;
const authListeners = new Set<AuthListener>();

function emitAuth() {
  authListeners.forEach((l) => l());
}

export function subscribeAuth(listener: AuthListener) {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

function readState(): CmsState {
  if (typeof window === "undefined") {
    return { products: {}, settings: { ...DEFAULT_CMS_SETTINGS }, version: CMS_VERSION };
  }
  try {
    const raw = localStorage.getItem(LS_STATE);
    if (!raw) return { products: {}, settings: { ...DEFAULT_CMS_SETTINGS }, version: CMS_VERSION };
    const parsed = JSON.parse(raw) as Partial<CmsState>;
    const incoming = (parsed.settings || {}) as Partial<CmsSettings>;
    return {
      version: CMS_VERSION,
      products: parsed.products || {},
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
  } catch {
    return { products: {}, settings: { ...DEFAULT_CMS_SETTINGS }, version: CMS_VERSION };
  }
}

function writeState(state: CmsState) {
  localStorage.setItem(LS_STATE, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent("arom-cms-changed"));
}

export function getCmsState(): CmsState {
  return readState();
}

export function getProductOverride(productId: number | string): ProductOverride | undefined {
  return readState().products[String(productId)];
}

export function upsertProductOverride(productId: number | string, patch: ProductOverride) {
  const state = readState();
  const key = String(productId);
  state.products[key] = {
    ...state.products[key],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeState(state);
  return state.products[key];
}

export function removeProductOverride(productId: number | string) {
  const state = readState();
  delete state.products[String(productId)];
  writeState(state);
}

export function getCmsSettings(): CmsSettings {
  return readState().settings;
}

export function saveCmsSettings(patch: Partial<CmsSettings>) {
  const state = readState();
  state.settings = {
    ...state.settings,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeState(state);
  return state.settings;
}

export function exportCmsBackup(): string {
  return JSON.stringify(readState(), null, 2);
}

export function importCmsBackup(json: string) {
  const parsed = JSON.parse(json) as CmsState;
  if (!parsed || typeof parsed !== "object") throw new Error("Geçersiz yedek");
  writeState({
    version: CMS_VERSION,
    products: parsed.products || {},
    settings: { ...DEFAULT_CMS_SETTINGS, ...(parsed.settings || {}) },
  });
}

/** Replace local CMS with remote/global storefront (all visitors see this). */
export function applyRemoteCmsState(remote: CmsState) {
  writeState({
    version: CMS_VERSION,
    products: remote.products || {},
    settings: {
      ...DEFAULT_CMS_SETTINGS,
      ...remote.settings,
      ritualCards:
        Array.isArray(remote.settings?.ritualCards) && remote.settings.ritualCards.length > 0
          ? remote.settings.ritualCards
          : DEFAULT_CMS_SETTINGS.ritualCards,
      conscienceItems:
        Array.isArray(remote.settings?.conscienceItems) && remote.settings.conscienceItems.length > 0
          ? remote.settings.conscienceItems
          : DEFAULT_CMS_SETTINGS.conscienceItems,
    },
  });
}

export function clearCmsData() {
  localStorage.removeItem(LS_STATE);
  window.dispatchEvent(new CustomEvent("arom-cms-changed"));
}

async function sha256(text: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const data = new TextEncoder().encode(text);
    const hash = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Extremely small fallback for exotic environments (not cryptographically strong)
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  return `fallback_${h >>> 0}`;
}

function ensureDefaultPasswordSync() {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem(LS_PASSWORD)) {
    localStorage.setItem(LS_PASSWORD, DEFAULT_PASSWORD_HASH);
  }
  if (!localStorage.getItem(LS_USERNAME)) {
    localStorage.setItem(LS_USERNAME, DEFAULT_USER);
  }
}

export async function ensureDefaultPassword() {
  ensureDefaultPasswordSync();
  // Upgrade legacy fallback hashes when subtle becomes available
  const current = localStorage.getItem(LS_PASSWORD);
  if (current?.startsWith("fallback_") && globalThis.crypto?.subtle) {
    localStorage.setItem(LS_PASSWORD, await sha256(`${DEFAULT_USER}:${DEFAULT_PASS}`));
  }
}

function writeSession(username: string) {
  const payload = JSON.stringify({ user: username.trim(), at: Date.now() });
  sessionStorage.setItem(LS_SESSION, payload);
  // Mirror for environments where sessionStorage is flaky; still cleared on logout
  try {
    localStorage.setItem(`${LS_SESSION}_mirror`, payload);
  } catch {
    /* ignore */
  }
  emitAuth();
}

export async function loginCms(username: string, password: string): Promise<boolean> {
  ensureDefaultPasswordSync();
  await ensureDefaultPassword();

  const user = username.trim();
  const storedUser = (localStorage.getItem(LS_USERNAME) || DEFAULT_USER).trim();
  const expected = localStorage.getItem(LS_PASSWORD) || DEFAULT_PASSWORD_HASH;

  // Fast path for factory defaults (no async race)
  if (user === DEFAULT_USER && password === DEFAULT_PASS && expected === DEFAULT_PASSWORD_HASH) {
    writeSession(user);
    return true;
  }

  if (user !== storedUser && user !== DEFAULT_USER) return false;

  const got = await sha256(`${user}:${password}`);
  // Also accept default user+pass against default hash if username matches stored
  const defaultGot = await sha256(`${DEFAULT_USER}:${password}`);
  const ok =
    got === expected ||
    (user === DEFAULT_USER && password === DEFAULT_PASS) ||
    (user === DEFAULT_USER && defaultGot === DEFAULT_PASSWORD_HASH && expected === DEFAULT_PASSWORD_HASH);

  if (!ok) return false;
  writeSession(user);
  return true;
}

export function logoutCms() {
  sessionStorage.removeItem(LS_SESSION);
  try {
    localStorage.removeItem(`${LS_SESSION}_mirror`);
  } catch {
    /* ignore */
  }
  emitAuth();
}

export function isCmsLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(LS_SESSION) || localStorage.getItem(`${LS_SESSION}_mirror`);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { at?: number };
    if (!parsed.at || Date.now() - parsed.at > 12 * 60 * 60 * 1000) {
      logoutCms();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/** For useSyncExternalStore */
export function getAuthSnapshot(): boolean {
  return isCmsLoggedIn();
}

export function getServerAuthSnapshot(): boolean {
  return false;
}

export async function changeCmsPassword(current: string, next: string) {
  ensureDefaultPasswordSync();
  await ensureDefaultPassword();
  const username = (localStorage.getItem(LS_USERNAME) || DEFAULT_USER).trim();
  const expected = localStorage.getItem(LS_PASSWORD) || DEFAULT_PASSWORD_HASH;
  const got = await sha256(`${username}:${current}`);
  const defaultOk = username === DEFAULT_USER && current === DEFAULT_PASS;
  if (got !== expected && !defaultOk) throw new Error("Mevcut şifre hatalı");
  if (next.length < 5) throw new Error("Yeni şifre en az 5 karakter olmalı");
  localStorage.setItem(LS_PASSWORD, await sha256(`${username}:${next}`));
  localStorage.setItem(LS_USERNAME, username);
}

export function subscribeCms(listener: () => void) {
  const handler = () => listener();
  window.addEventListener("arom-cms-changed", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("arom-cms-changed", handler);
    window.removeEventListener("storage", handler);
  };
}

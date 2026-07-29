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
const DEFAULT_USER = "admin";
const DEFAULT_PASS = "12345";

function readState(): CmsState {
  if (typeof window === "undefined") {
    return { products: {}, settings: { ...DEFAULT_CMS_SETTINGS }, version: CMS_VERSION };
  }
  try {
    const raw = localStorage.getItem(LS_STATE);
    if (!raw) return { products: {}, settings: { ...DEFAULT_CMS_SETTINGS }, version: CMS_VERSION };
    const parsed = JSON.parse(raw) as Partial<CmsState>;
    return {
      version: CMS_VERSION,
      products: parsed.products || {},
      settings: { ...DEFAULT_CMS_SETTINGS, ...(parsed.settings || {}) },
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

export function clearCmsData() {
  localStorage.removeItem(LS_STATE);
  window.dispatchEvent(new CustomEvent("arom-cms-changed"));
}

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function ensureDefaultPassword() {
  if (!localStorage.getItem(LS_PASSWORD)) {
    localStorage.setItem(LS_PASSWORD, await sha256(`${DEFAULT_USER}:${DEFAULT_PASS}`));
  }
}

export async function loginCms(username: string, password: string): Promise<boolean> {
  await ensureDefaultPassword();
  const expected = localStorage.getItem(LS_PASSWORD);
  const got = await sha256(`${username.trim()}:${password}`);
  if (got !== expected) return false;
  sessionStorage.setItem(
    LS_SESSION,
    JSON.stringify({ user: username.trim(), at: Date.now() }),
  );
  return true;
}

export function logoutCms() {
  sessionStorage.removeItem(LS_SESSION);
}

export function isCmsLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(LS_SESSION);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { at?: number };
    // 12 saat
    if (!parsed.at || Date.now() - parsed.at > 12 * 60 * 60 * 1000) {
      logoutCms();
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function changeCmsPassword(current: string, next: string, username = DEFAULT_USER) {
  await ensureDefaultPassword();
  const expected = localStorage.getItem(LS_PASSWORD);
  const got = await sha256(`${username}:${current}`);
  if (got !== expected) throw new Error("Mevcut şifre hatalı");
  if (next.length < 5) throw new Error("Yeni şifre en az 5 karakter olmalı");
  localStorage.setItem(LS_PASSWORD, await sha256(`${username}:${next}`));
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

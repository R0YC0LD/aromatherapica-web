type CacheEntry<T> = { value: T; expiresAt: number };

export class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number) {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  delete(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

export const appCache = new MemoryCache();

export const CACHE_TTL = {
  categories: 15 * 60 * 1000,
  products: 5 * 60 * 1000,
  productDetail: 2 * 60 * 1000,
  paymentTypes: 30 * 60 * 1000,
} as const;

const CACHE_PREFIX = "kc_";
const DEFAULT_TTL = 30_000; // 30 seconds

interface CacheEntry<T> {
  data: T;
  ts: number;
}

export function getCache<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.ts > ttl) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // Storage full — silently fail
  }
}

export function clearCache(pattern?: string): void {
  try {
    const prefix = CACHE_PREFIX + (pattern || "");
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(prefix)) sessionStorage.removeItem(k);
    }
  } catch {}
}

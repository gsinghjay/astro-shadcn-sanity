import type { SearchResult } from "@cloudflare/ai-search-snippet";

const SESSION_KEY_PREFIX = "search-cache:";
const TTL_MS = 5 * 60 * 1000;

const memoryCache = new Map<string, SearchResult[]>();

export function normalizeQuery(input: string): string {
  return String(input).trim().toLowerCase().replace(/\s+/g, " ");
}

function readSessionStorage(key: string): SearchResult[] | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { results: SearchResult[]; ts: number };
    if (!parsed || typeof parsed.ts !== "number" || !Array.isArray(parsed.results)) {
      return null;
    }
    if (Date.now() - parsed.ts >= TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY_PREFIX + key);
      return null;
    }
    return parsed.results;
  } catch {
    return null;
  }
}

function writeSessionStorage(key: string, results: SearchResult[]): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(
      SESSION_KEY_PREFIX + key,
      JSON.stringify({ results, ts: Date.now() }),
    );
  } catch {
    // Quota exceeded / disabled storage — degrade silently.
  }
}

export function getCached(query: string): SearchResult[] | null {
  const key = normalizeQuery(query);
  if (!key) return null;
  const memoryHit = memoryCache.get(key);
  if (memoryHit) return memoryHit;
  const sessionHit = readSessionStorage(key);
  if (sessionHit) {
    memoryCache.set(key, sessionHit);
    return sessionHit;
  }
  return null;
}

export function setCached(query: string, results: SearchResult[]): void {
  const key = normalizeQuery(query);
  if (!key) return;
  // Skip empty arrays so transient outages don't mask real results next time.
  if (!Array.isArray(results) || results.length === 0) return;
  memoryCache.set(key, results);
  writeSessionStorage(key, results);
}

export function clearCache(): void {
  memoryCache.clear();
  if (typeof sessionStorage === "undefined") return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.startsWith(SESSION_KEY_PREFIX)) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k));
  } catch {
    // Ignore storage failures.
  }
}

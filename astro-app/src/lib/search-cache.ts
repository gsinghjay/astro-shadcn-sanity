import type { SearchResult } from "@cloudflare/ai-search-snippet";

const SESSION_KEY_PREFIX = "search-cache:";
const TTL_MS = 5 * 60 * 1000;

const memoryCache = new Map<string, SearchResult[]>();

export function normalizeQuery(input: string): string {
  return String(input).trim().toLowerCase().replace(/\s+/g, " ");
}

// `typeof sessionStorage` does not catch the SecurityError thrown when
// accessing storage inside a sandboxed iframe — the access itself throws.
// Wrap every touch in try/catch and treat any failure as "no storage".
function safeStorage(): Storage | null {
  try {
    if (typeof sessionStorage === "undefined") return null;
    return sessionStorage;
  } catch {
    return null;
  }
}

function isValidResult(r: unknown): r is SearchResult {
  if (!r || typeof r !== "object") return false;
  const obj = r as Record<string, unknown>;
  return typeof obj.id === "string" && typeof obj.title === "string" && obj.type === "result";
}

function readSessionStorage(key: string): SearchResult[] | null {
  const storage = safeStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(SESSION_KEY_PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { results: SearchResult[]; ts: number };
    if (!parsed || typeof parsed.ts !== "number" || !Array.isArray(parsed.results)) {
      return null;
    }
    // Clock skew: an entry timestamped in the future would never expire under
    // `Date.now() - ts > TTL_MS` (negative diff stays under the cap forever).
    if (parsed.ts > Date.now()) {
      storage.removeItem(SESSION_KEY_PREFIX + key);
      return null;
    }
    if (Date.now() - parsed.ts > TTL_MS) {
      storage.removeItem(SESSION_KEY_PREFIX + key);
      return null;
    }
    if (!parsed.results.every(isValidResult)) {
      storage.removeItem(SESSION_KEY_PREFIX + key);
      return null;
    }
    return parsed.results;
  } catch {
    return null;
  }
}

function writeSessionStorage(key: string, results: SearchResult[]): void {
  const storage = safeStorage();
  if (!storage) return;
  try {
    storage.setItem(
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
  if (!Array.isArray(results)) return;
  // Empty arrays ARE cached (legitimate "no matches" result, full TTL).
  // Transient outages throw and never reach setCached, so caching `[]` here
  // does not mask outage states.
  memoryCache.set(key, results);
  writeSessionStorage(key, results);
}

export function clearCache(): void {
  memoryCache.clear();
  const storage = safeStorage();
  if (!storage) return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < storage.length; i++) {
      const k = storage.key(i);
      if (k && k.startsWith(SESSION_KEY_PREFIX)) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => storage.removeItem(k));
  } catch {
    // Ignore storage failures.
  }
}

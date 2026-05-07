// @vitest-environment jsdom
import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import type { SearchResult } from "@cloudflare/ai-search-snippet";

const fixture: SearchResult[] = [
  {
    id: "1",
    title: "Swiss Design",
    description: "A movement",
    type: "result",
    url: "https://example.com/a",
  },
  {
    id: "2",
    title: "Helvetica",
    description: "A typeface",
    type: "result",
    url: "https://example.com/b",
  },
];

// Fresh module instance per test isolates the module-scoped in-memory Map.
async function freshModule() {
  vi.resetModules();
  return await import("@/lib/search-cache");
}

describe("search-cache normalizeQuery", () => {
  test("trims, lowercases, and collapses whitespace", async () => {
    const { normalizeQuery } = await freshModule();
    expect(normalizeQuery("  SwIsS  desIGN  ")).toBe("swiss design");
    expect(normalizeQuery("HELLO\tWORLD")).toBe("hello world");
  });

  test("returns empty string for empty / whitespace-only input", async () => {
    const { normalizeQuery } = await freshModule();
    expect(normalizeQuery("")).toBe("");
    expect(normalizeQuery("   ")).toBe("");
  });
});

describe("search-cache layered store", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.useRealTimers();
  });

  test("memory hit returns the same array reference on repeat reads", async () => {
    const { setCached, getCached } = await freshModule();
    setCached("swiss design", fixture);
    const first = getCached("swiss design");
    const second = getCached("swiss design");
    expect(first).toBe(second);
    expect(first).toBe(fixture);
  });

  test("normalized variants share a cache slot", async () => {
    const { setCached, getCached } = await freshModule();
    setCached("  SwIsS  desIGN  ", fixture);
    expect(getCached("swiss design")).toEqual(fixture);
    expect(getCached("Swiss Design")).toEqual(fixture);
  });

  test("sessionStorage layer survives memory clear within TTL", async () => {
    // First module instance writes to both memory + sessionStorage.
    const writer = await freshModule();
    writer.setCached("typography", fixture);
    expect(sessionStorage.getItem("search-cache:typography")).not.toBeNull();
    // Fresh module = empty in-memory Map, but sessionStorage persists.
    const reader = await freshModule();
    const hit = reader.getCached("typography");
    expect(hit).toEqual(fixture);
  });

  test("sessionStorage TTL expiry returns null and removes the entry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-06T00:00:00Z"));
    const writer = await freshModule();
    writer.setCached("modernism", fixture);
    // Past 5-minute TTL.
    vi.setSystemTime(new Date("2026-05-06T00:06:00Z"));
    const reader = await freshModule();
    expect(reader.getCached("modernism")).toBeNull();
    expect(sessionStorage.getItem("search-cache:modernism")).toBeNull();
  });

  test("does NOT cache empty arrays (transient outage protection)", async () => {
    const { setCached, getCached } = await freshModule();
    setCached("nothing", []);
    expect(getCached("nothing")).toBeNull();
    expect(sessionStorage.getItem("search-cache:nothing")).toBeNull();
  });

  test("does NOT cache empty / whitespace-only queries", async () => {
    const { setCached, getCached } = await freshModule();
    setCached("   ", fixture);
    expect(getCached("   ")).toBeNull();
  });

  test("clearCache removes only search-cache:* entries from sessionStorage", async () => {
    const { setCached, clearCache, getCached } = await freshModule();
    setCached("alpha", fixture);
    setCached("beta", fixture);
    sessionStorage.setItem("unrelated:key", "untouched");
    clearCache();
    expect(getCached("alpha")).toBeNull();
    expect(getCached("beta")).toBeNull();
    expect(sessionStorage.getItem("unrelated:key")).toBe("untouched");
  });

  test("malformed sessionStorage payload is treated as miss (defensive)", async () => {
    sessionStorage.setItem("search-cache:bogus", "not json{");
    const { getCached } = await freshModule();
    expect(getCached("bogus")).toBeNull();
  });
});

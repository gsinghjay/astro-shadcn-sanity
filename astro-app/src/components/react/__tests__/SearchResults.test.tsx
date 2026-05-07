// @vitest-environment jsdom
import React, { act } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRoot, type Root } from "react-dom/client";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const { searchMock, cancelAllMock } = vi.hoisted(() => ({
  searchMock: vi.fn(),
  cancelAllMock: vi.fn(),
}));

vi.mock("@cloudflare/ai-search-snippet", () => ({
  AISearchClient: class {
    baseUrl: string;
    constructor(baseUrl: string) {
      this.baseUrl = baseUrl;
    }
    search = searchMock;
    cancelAllRequests = cancelAllMock;
  },
}));

import SearchResults from "../SearchResults";
import { clearCache } from "@/lib/search-cache";

let container: HTMLDivElement;
let root: Root;

function render(ui: React.ReactElement) {
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  act(() => {
    root.render(ui);
  });
}

function unmount() {
  act(() => {
    root.unmount();
  });
  container.remove();
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

const fixtureResults = [
  {
    id: "r1",
    title: "Swiss Typography",
    description: "Helvetica and Univers explained",
    type: "result" as const,
    url: "https://example.com/swiss",
  },
  {
    id: "r2",
    title: "Grid Systems",
    description: "Müller-Brockmann's foundational work",
    type: "result" as const,
    url: "https://example.com/grids",
  },
];

describe("SearchResults island", () => {
  beforeEach(() => {
    searchMock.mockReset();
    cancelAllMock.mockReset();
    sessionStorage.clear();
    clearCache();
    (window as unknown as { dataLayer?: unknown[] }).dataLayer = [];
    // Reset URL to /search with no query.
    window.history.replaceState({}, "", "/search");
  });

  afterEach(() => {
    if (container) unmount();
    vi.useRealTimers();
  });

  it("renders the empty-state panel when initialQuery is empty (AC 4 idle)", () => {
    render(<SearchResults apiUrl="https://worker.dev" initialQuery="" />);
    expect(container.querySelector("[data-search-empty]")).not.toBeNull();
    expect(container.querySelector("[data-search-results]")).toBeNull();
    expect(container.querySelector("[data-search-skeleton]")).toBeNull();
    expect(searchMock).not.toHaveBeenCalled();
  });

  it("renders skeleton + then results when initialQuery is set (AC 4 loading + success, AC 1 native ol/li)", async () => {
    let resolveSearch!: (value: typeof fixtureResults) => void;
    searchMock.mockImplementationOnce(
      () =>
        new Promise(res => {
          resolveSearch = res;
        }),
    );

    render(
      <SearchResults apiUrl="https://worker.dev" initialQuery="swiss design" />,
    );

    await flush();
    expect(container.querySelector("[data-search-skeleton]")).not.toBeNull();
    expect(searchMock).toHaveBeenCalledWith("swiss design", expect.objectContaining({
      maxResults: 20,
      signal: expect.any(AbortSignal),
    }));

    await act(async () => {
      resolveSearch(fixtureResults);
      await Promise.resolve();
    });
    await flush();

    const ol = container.querySelector("ol[data-search-results]");
    expect(ol).not.toBeNull();
    const items = ol!.querySelectorAll("li");
    expect(items.length).toBe(2);
    expect(items[0].querySelector("a")?.getAttribute("href")).toBe(
      "https://example.com/swiss",
    );
    expect(items[0].querySelector("h2")?.textContent).toBe("Swiss Typography");
  });

  it("renders zero-results panel when AISearchClient returns [] (AC 4 zero-results)", async () => {
    searchMock.mockResolvedValueOnce([]);
    render(<SearchResults apiUrl="https://worker.dev" initialQuery="zzz nope" />);
    await flush();
    expect(container.querySelector("[data-search-zero]")).not.toBeNull();
    expect(container.querySelector("ol[data-search-results]")).toBeNull();
  });

  it("renders error panel + retry button when AISearchClient rejects (AC 4 error)", async () => {
    searchMock.mockRejectedValueOnce(new Error("network down"));
    render(<SearchResults apiUrl="https://worker.dev" initialQuery="boom" />);
    await flush();
    const errorPanel = container.querySelector("[data-search-error]");
    expect(errorPanel).not.toBeNull();
    expect(errorPanel?.textContent).toMatch(/temporarily unavailable/i);
    expect(container.querySelector("[data-search-retry]")).not.toBeNull();
  });

  it("retry button re-runs the most recent query", async () => {
    searchMock.mockRejectedValueOnce(new Error("first fail"));
    render(<SearchResults apiUrl="https://worker.dev" initialQuery="retry me" />);
    await flush();
    expect(searchMock).toHaveBeenCalledTimes(1);

    searchMock.mockResolvedValueOnce(fixtureResults);
    const retry = container.querySelector(
      "[data-search-retry]",
    ) as HTMLButtonElement;
    await act(async () => {
      retry.click();
      await Promise.resolve();
    });
    await flush();
    expect(searchMock).toHaveBeenCalledTimes(2);
    expect(container.querySelector("ol[data-search-results]")).not.toBeNull();
  });

  it("pushes site_search_query GTM event on success with normalized query + count", async () => {
    searchMock.mockResolvedValueOnce(fixtureResults);
    render(
      <SearchResults apiUrl="https://worker.dev" initialQuery="  Swiss  " />,
    );
    await flush();
    const layer =
      (window as unknown as { dataLayer: Array<Record<string, unknown>> })
        .dataLayer;
    const evt = layer.find(e => e.event === "site_search_query");
    expect(evt).toBeDefined();
    expect(evt?.source).toBe("search-page");
    expect(evt?.query).toBe("swiss");
    expect(evt?.results_count).toBe(2);
  });

  it("pushes site_search_error GTM event on failure", async () => {
    searchMock.mockRejectedValueOnce(new Error("boom"));
    render(<SearchResults apiUrl="https://worker.dev" initialQuery="kapow" />);
    await flush();
    const layer =
      (window as unknown as { dataLayer: Array<Record<string, unknown>> })
        .dataLayer;
    const evt = layer.find(e => e.event === "site_search_error");
    expect(evt).toBeDefined();
    expect(evt?.source).toBe("search-page");
    expect(evt?.query).toBe("kapow");
  });

  it("repeat query within session hits the cache and does NOT call AISearchClient again", async () => {
    searchMock.mockResolvedValueOnce(fixtureResults);
    render(
      <SearchResults apiUrl="https://worker.dev" initialQuery="cached query" />,
    );
    await flush();
    expect(searchMock).toHaveBeenCalledTimes(1);

    // Re-mount and re-request the same query.
    unmount();
    render(
      <SearchResults apiUrl="https://worker.dev" initialQuery="cached query" />,
    );
    await flush();
    expect(searchMock).toHaveBeenCalledTimes(1); // memory hit

    const layer =
      (window as unknown as { dataLayer: Array<Record<string, unknown>> })
        .dataLayer;
    const cacheEvt = layer.find(
      e => e.source === "search-page-cache" && e.event === "site_search_query",
    );
    expect(cacheEvt).toBeDefined();
  });

  it("does NOT cache error responses (retry hits the network again)", async () => {
    searchMock.mockRejectedValueOnce(new Error("nope"));
    render(<SearchResults apiUrl="https://worker.dev" initialQuery="err q" />);
    await flush();
    expect(searchMock).toHaveBeenCalledTimes(1);

    // Re-mount with same query — cache must not have stored the failure.
    unmount();
    searchMock.mockResolvedValueOnce(fixtureResults);
    render(<SearchResults apiUrl="https://worker.dev" initialQuery="err q" />);
    await flush();
    expect(searchMock).toHaveBeenCalledTimes(2);
    expect(container.querySelector("ol[data-search-results]")).not.toBeNull();
  });

  it("popstate event re-reads ?q from location and re-runs the query", async () => {
    searchMock.mockResolvedValueOnce(fixtureResults);
    render(<SearchResults apiUrl="https://worker.dev" initialQuery="" />);
    await flush();

    window.history.pushState({}, "", "/search?q=back%20button");
    await act(async () => {
      window.dispatchEvent(new PopStateEvent("popstate"));
      await Promise.resolve();
    });
    await flush();

    expect(searchMock).toHaveBeenCalledWith(
      "back button",
      expect.objectContaining({ maxResults: 20 }),
    );
  });
});

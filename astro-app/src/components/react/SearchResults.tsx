import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AISearchClient, type SearchResult } from "@cloudflare/ai-search-snippet";
import { getCached, normalizeQuery, setCached } from "@/lib/search-cache";

const MAX_QUERY_LENGTH = 256;
const MAX_RESULTS = 20;
const DEBOUNCE_MS = 200;

type Status = "idle" | "loading" | "success" | "error";

interface State {
  status: Status;
  results: SearchResult[];
  error: string | null;
  query: string;
}

interface Props {
  apiUrl: string;
  initialQuery: string;
  placeholder?: string;
}

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function pushDataLayer(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

function normalizeRaw(raw: string): string {
  return raw.trim().slice(0, MAX_QUERY_LENGTH);
}

function buildSearchUrl(query: string): string {
  return query ? `/search?q=${encodeURIComponent(query)}` : "/search";
}

export default function SearchResults({
  apiUrl,
  initialQuery,
  placeholder = "Search the site…",
}: Props) {
  const client = useMemo(() => new AISearchClient(apiUrl), [apiUrl]);

  const [inputValue, setInputValue] = useState(initialQuery);
  const [state, setState] = useState<State>({
    status: initialQuery ? "loading" : "idle",
    results: [],
    error: null,
    query: initialQuery,
  });

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastDispatchedRef = useRef<string>("");

  const runSearch = useCallback(
    async (rawQuery: string, source: "input" | "popstate" | "retry" | "initial") => {
      const trimmed = normalizeRaw(rawQuery);
      const normalized = normalizeQuery(trimmed);

      if (!trimmed || !normalized) {
        abortRef.current?.abort();
        abortRef.current = null;
        lastDispatchedRef.current = "";
        setState({ status: "idle", results: [], error: null, query: "" });
        return;
      }

      const cached = getCached(trimmed);
      if (cached) {
        lastDispatchedRef.current = trimmed;
        setState({ status: "success", results: cached, error: null, query: trimmed });
        pushDataLayer({
          event: "site_search_query",
          source: "search-page-cache",
          query: normalized,
          results_count: cached.length,
        });
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      lastDispatchedRef.current = trimmed;

      setState(prev => ({
        status: "loading",
        results: prev.results,
        error: null,
        query: trimmed,
      }));

      try {
        const results = await client.search(trimmed, {
          maxResults: MAX_RESULTS,
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        setCached(trimmed, results);
        setState({ status: "success", results, error: null, query: trimmed });
        pushDataLayer({
          event: "site_search_query",
          source: "search-page",
          query: normalized,
          results_count: results.length,
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        const errorCode =
          err instanceof Error ? err.name || "error" : "unknown";
        setState({
          status: "error",
          results: [],
          error: "Search is temporarily unavailable. Please try again.",
          query: trimmed,
        });
        pushDataLayer({
          event: "site_search_error",
          source: "search-page",
          query: normalized,
          error_code: errorCode,
        });
      }
      void source;
    },
    [client],
  );

  // Initial render: if we already have an initial query (deep-link / SSR),
  // run it immediately. The state was seeded as "loading" above to avoid
  // a flash of empty content before the first fetch resolves.
  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery, "initial");
    }
    return () => {
      abortRef.current?.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // popstate: re-read ?q from location and re-run.
  useEffect(() => {
    if (typeof window === "undefined") return;
    function onPopState() {
      const params = new URLSearchParams(window.location.search);
      const q = normalizeRaw(params.get("q") ?? "");
      setInputValue(q);
      runSearch(q, "popstate");
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [runSearch]);

  // Debounced fetch on input change. Fires only after the user stops typing.
  useEffect(() => {
    const trimmed = normalizeRaw(inputValue);
    if (trimmed === lastDispatchedRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const url = buildSearchUrl(trimmed);
      if (typeof window !== "undefined" && window.location.pathname + window.location.search !== url) {
        window.history.pushState({}, "", url);
      }
      runSearch(trimmed, "input");
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputValue, runSearch]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = normalizeRaw(inputValue);
    const url = buildSearchUrl(trimmed);
    if (typeof window !== "undefined" && window.location.pathname + window.location.search !== url) {
      window.history.pushState({}, "", url);
    }
    runSearch(trimmed, "input");
  };

  const onRetry = () => {
    if (state.query) runSearch(state.query, "retry");
  };

  return (
    <div data-search-results-root>
      <form
        onSubmit={onSubmit}
        role="search"
        className="border-2 border-foreground bg-background"
      >
        <label className="sr-only" htmlFor="search-page-input">
          Search
        </label>
        <input
          id="search-page-input"
          type="search"
          className="w-full bg-background text-foreground placeholder:text-muted-foreground px-4 py-3 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={placeholder}
          value={inputValue}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          maxLength={MAX_QUERY_LENGTH}
          onChange={e => setInputValue(e.target.value)}
          data-search-page-input
        />
      </form>

      <div className="mt-8" aria-live="polite">
        {state.status === "idle" && (
          <div
            className="border-2 border-foreground bg-secondary p-6"
            data-search-empty
          >
            <p className="label-caps mb-2">Search</p>
            <p className="text-foreground">
              Type a query above to search the site.
            </p>
          </div>
        )}

        {state.status === "loading" && (
          <ol
            aria-busy="true"
            className="space-y-3"
            data-search-skeleton
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <li
                key={i}
                className="border-2 border-foreground bg-secondary p-4"
              >
                <div className="h-4 w-3/4 bg-foreground/20 animate-pulse" />
                <div className="mt-2 h-3 w-full bg-foreground/10 animate-pulse" />
              </li>
            ))}
          </ol>
        )}

        {state.status === "success" && state.results.length === 0 && (
          <div
            className="border-2 border-foreground bg-secondary p-6"
            data-search-zero
          >
            <p className="label-caps mb-2">No results for {state.query}</p>
            <p className="text-foreground">Try a different query.</p>
          </div>
        )}

        {state.status === "success" && state.results.length > 0 && (
          <>
            <p className="label-caps mb-4 text-muted-foreground">
              Showing {state.results.length} {state.results.length === 1 ? "result" : "results"} for {state.query}
            </p>
            <ol className="space-y-4" data-search-results>
              {state.results.map(result => {
                const href = result.url ?? "#";
                let hostname = "";
                try {
                  if (result.url) hostname = new URL(result.url).hostname;
                } catch {
                  hostname = "";
                }
                return (
                  <li
                    key={result.id}
                    className="border-2 border-foreground bg-background p-4"
                  >
                    <a
                      href={href}
                      className="underline-offset-4 hover:underline text-foreground"
                      data-gtm-category="site-search"
                      data-gtm-action="result-click"
                      data-gtm-label={result.id}
                    >
                      <h2 className="text-lg font-bold">{result.title}</h2>
                    </a>
                    {result.description && (
                      <p className="mt-1 text-foreground">{result.description}</p>
                    )}
                    {hostname && (
                      <span className="mt-2 inline-block text-xs text-muted-foreground">
                        {hostname}
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </>
        )}

        {state.status === "error" && (
          <div
            className="border-2 border-foreground bg-secondary p-6"
            data-search-error
            role="alert"
          >
            <p className="label-caps mb-2">Search error</p>
            <p className="text-foreground mb-4">{state.error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="border-2 border-foreground bg-foreground text-background px-4 py-2 label-caps hover:bg-foreground/90"
              data-search-retry
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

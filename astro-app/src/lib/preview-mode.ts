/**
 * Story 26.1 — Request-scoped Sanity Preview Mode flag.
 *
 * Replaces the build-time `PUBLIC_SANITY_VISUAL_EDITING_ENABLED` per-Worker
 * constant. Middleware reads the `__Secure-sanity-preview` cookie on every
 * request and wraps `next()` in `runWithPreviewMode(true, ...)` for
 * cookie-bearing requests; downstream `loadQuery()` callers read the flag via
 * `getPreviewMode()` and switch perspective / stega / token / useCdn per-call.
 *
 * Workerd supports `node:async_hooks.AsyncLocalStorage` when `nodejs_compat`
 * is enabled (it is — `wrangler.jsonc:compatibility_flags`). For non-Node
 * environments (Storybook, tests outside the Workers runtime) we fall back
 * to a no-op shim that always returns `false` — those environments never
 * carry a real preview cookie anyway.
 *
 * Why ALS rather than `Astro.locals`: `loadQuery()` is invoked from many
 * non-component callsites (resolvers in `lib/sanity.ts`, helpers in
 * `lib/portal/*`) that don't have an `Astro` context handy. ALS lets the
 * flag traverse the call tree without threading it through every signature.
 *
 * NEVER replace this with a module-level `let visualEditingEnabled` — that
 * would race across concurrent requests in the same isolate (CF reuses
 * isolates aggressively).
 */

interface PreviewModeStorage {
  run<T>(value: boolean, fn: () => Promise<T>): Promise<T>;
  getStore(): boolean | undefined;
}

let previewModeStorage: PreviewModeStorage;

try {
  // Node / workerd path. `node:async_hooks` is unavailable in browsers; the
  // dynamic require lets Storybook + browser bundles tree-shake it out via
  // the catch fallback below.
  const { AsyncLocalStorage } = await import("node:async_hooks");
  const als = new AsyncLocalStorage<boolean>();
  previewModeStorage = {
    run: (value, fn) => als.run(value, fn),
    getStore: () => als.getStore(),
  };
} catch {
  // Browser / Storybook fallback — preview mode is always off in environments
  // that can't carry a real preview cookie. Keeps the API shape so callers
  // don't need to handle module-load failure.
  previewModeStorage = {
    run: (_value, fn) => fn(),
    getStore: () => undefined,
  };
}

export function runWithPreviewMode<T>(
  enabled: boolean,
  fn: () => Promise<T>,
): Promise<T> {
  return previewModeStorage.run(enabled, fn);
}

export function getPreviewMode(): boolean {
  return previewModeStorage.getStore() ?? false;
}

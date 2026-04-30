// Stub for the `cloudflare:workers` virtual module that @astrojs/cloudflare v13
// exposes inside the Worker runtime. It does not exist outside `astro build`,
// so vitest fails to resolve any module that does `import { env } from
// "cloudflare:workers"`. Production code reads bindings off this `env`; tests
// that depend on a specific binding should `vi.mock("cloudflare:workers", ...)`
// at the top of the file with the shape they need.
export const env: Record<string, unknown> = {};

// `ctx` / `executionContext` helpers that some adapter code paths import.
export function getExecutionContext(): {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
} {
  return {
    waitUntil: () => {},
    passThroughOnException: () => {},
  };
}

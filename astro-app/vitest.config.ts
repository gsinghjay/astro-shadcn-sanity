/// <reference types="vitest" />
import { getViteConfig } from "astro/config";
import { resolve } from "node:path";
import react from "@vitejs/plugin-react-swc";

// Monolithic getViteConfig wrapper — Story 27.1 shape (post-PR #719).
// Story 27.2 attempted a Vitest 3 test.projects restructure (PR #720) but
// reproducibly reproduced Story 27.1's R4 goroutine-deadlock contingency on
// ubuntu-latest CI even with per-tier maxForks: 1 + sequential `--project`
// invocations: `fatal error: all goroutines are asleep - deadlock!` in
// esbuild.RunOnResolvePlugins after ~3 of 88 unit-astro files. Concluded
// that projects mode is incompatible with the Astro Vite chain in this
// codebase on this runner; restructure deferred. The failing experiment is
// captured in story-27-2-vitest-projects-restructure.md Dev Agent Record.
//
// Why SWC: Story 27.1 swapped @vitejs/plugin-react → @vitejs/plugin-react-swc
// to eliminate the Babel-vs-esbuild deadlock that broke CI under the previous
// plugin-react setup (Babel JS event loop + esbuild Go scheduler contention).
// SWC runs the JSX transform in Rust, no Go-runtime interaction.
//
// Why CI maxForks: 1 + singleFork: false: Story 27.1 push #1 (commit 5437380)
// silent-killed at file 3/134 in 13s on ubuntu-latest under unbounded parallel
// forks (kernel SIGKILL on the parent vitest process from memory pressure).
// Push #2 (commit 583b581) capped to maxForks: 1 on CI — each file still gets
// a fresh fork (no singleFork-style esbuild-state accumulation), but only one
// runs at a time. Two consecutive green CI runs followed.
//
// pool: 'threads' is non-viable here (rolled back in a9aa8d0 — conflicts
// with @astrojs/cloudflare adapter test surface); do not switch.

export default getViteConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
      "sanity:client": resolve(
        import.meta.dirname,
        "./src/lib/__tests__/__mocks__/sanity-client.ts",
      ),
      "astro:env/client": resolve(
        import.meta.dirname,
        "./src/lib/__tests__/__mocks__/astro-env-client.ts",
      ),
      "astro:env/server": resolve(
        import.meta.dirname,
        "./src/lib/__tests__/__mocks__/astro-env-server.ts",
      ),
      // The `cloudflare:workers` virtual module exists only inside the
      // Worker runtime — `@astrojs/cloudflare` v13 makes it the canonical
      // way to read bindings (`import { env } from "cloudflare:workers"`).
      // Stub it so tests that import server modules can resolve it; tests
      // that need a specific binding can vi.mock the same id.
      "cloudflare:workers": resolve(
        import.meta.dirname,
        "./src/lib/__tests__/__mocks__/cloudflare-workers.ts",
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  /* @ts-expect-error — getViteConfig types don't include test but Vitest reads it */
  test: {
    globals: true,
    // Astro 6 Container API + Vite SSR transform on cold start can push
    // .astro component renders past Vitest's 5s default under suite-wide
    // contention (we hit this on `json-ld-blocks` FaqSection at 5009ms).
    testTimeout: 15_000,
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: false,
        ...(process.env.CI ? { minForks: 1, maxForks: 1 } : {}),
      },
    },
    include: [
      "src/**/__tests__/**/*.test.ts",
      "src/**/__tests__/**/*.test.tsx",
      "../tests/integration/**/*.test.ts",
      "../studio/src/__tests__/**/*.test.ts",
      "../studio/src/tools/__tests__/**/*.test.tsx",
    ],
    exclude: ["node_modules", "dist", ".astro"],
    // Per-file `/** @vitest-environment jsdom */` pragma at the top of each
    // .test.tsx file replaces the deprecated environmentMatchGlobs.
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts", "src/scripts/**/*.ts"],
      exclude: ["src/lib/__tests__/**", "src/lib/data/**", "src/**/*.d.ts"],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "../test-results/unit-coverage",
    },
    reporters: ["default", "junit"],
    outputFile: {
      junit: "../test-results/unit-results.xml",
    },
  },
});

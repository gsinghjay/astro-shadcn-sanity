/// <reference types="vitest" />
import { getViteConfig } from "astro/config";
import { resolve } from "path";
import react from "@vitejs/plugin-react-swc";

export default getViteConfig({
  // React 19 components in this project rely on the automatic JSX runtime.
  // Astro's getViteConfig wires @astrojs/react into production builds, but
  // the Vitest transform path needs its own JSX-aware plugin or .tsx tests
  // crash at render with "ReferenceError: React is not defined".
  //
  // Why SWC, not Babel: @vitejs/plugin-react performs JSX transformation in
  // JavaScript via Babel; under fork contention on GitHub Actions ubuntu-latest
  // (2 cores / 7 GB) the Babel JS event loop blocks long enough that esbuild's
  // Go scheduler deadlocks ("fatal error: all goroutines are asleep") and
  // vitest is killed mid-run with no summary. @vitejs/plugin-react-swc runs
  // the same transform in Rust — no Go-runtime interaction, no Babel — and
  // doesn't auto-inject React Compiler, so we no longer need the include/
  // exclude scoping that previously kept @sanity/ui source out of the
  // useMemoCache crash path. Resolves Epic 27 / Story 27.1.
  plugins: [react()],
  resolve: {
    alias: {
      // Project import alias — mirrors tsconfig `paths` so test imports use
      // the same `@/foo` form as production code.
      "@": resolve(import.meta.dirname, "./src"),
      // Mock Astro virtual modules that can't resolve outside Astro build
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
    // Forks pool. Two failure modes shape the config:
    //
    // 1. singleFork:true reuses one fork for all files; esbuild service state
    //    accumulates until the Go scheduler saturates and emits "fatal error:
    //    all goroutines are asleep - deadlock!" in esbuild.RunOnResolvePlugins
    //    (locally repro'd at file ~65/134). Do not enable.
    // 2. Unbounded parallel forks on GitHub Actions ubuntu-latest (constrained
    //    CPU/memory) trigger silent kernel SIGKILL — vitest exits 1 with no
    //    summary, no JUnit, and an orphan workerd left in cleanup. First run
    //    of this story died at file 3 of 134 in 13s.
    //
    // Compromise: cap maxForks to 1 on CI so each file still gets a fresh
    // fork (no singleFork-style state accumulation) but only one runs at a
    // time (no parallel memory pressure). Local dev keeps unbounded
    // parallelism and the ~50s wall-clock win. pool:"threads" remains
    // non-viable under @astrojs/cloudflare's adapter surface (rolled back in
    // a9aa8d0); do not switch.
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
    // React component tests use jsdom; non-component tests stay in node.
    environmentMatchGlobs: [["**/*.test.tsx", "jsdom"]],
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

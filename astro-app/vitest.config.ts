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
    // Forks pool, parallel (singleFork:false). The SWC plugin swap (above)
    // removes the Babel-vs-esbuild contention; serializing forks on top of
    // that is actively harmful — local verification under singleFork:true
    // hit "fatal error: all goroutines are asleep - deadlock!" in
    // esbuild.RunOnResolvePlugins at ~65 of 134 files because esbuild
    // service state accumulates inside the single fork until the Go
    // scheduler saturates. Parallel forks give each file a fresh esbuild
    // service and run the full suite cleanly (~50s wall, 4–5 cores).
    // Story 27.1 absorbed this pool change from Story 27.2 per the epic's
    // R4 contingency; Story 27.2 retains its broader projects-restructure
    // scope. pool: "threads" remains non-viable under @astrojs/cloudflare's
    // adapter test surface (rolled back in commit a9aa8d0); do not switch.
    pool: "forks",
    poolOptions: { forks: { singleFork: false } },
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

/// <reference types="vitest" />
import { getViteConfig } from "astro/config";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export default getViteConfig({
  // React 19 components in this project rely on the automatic JSX runtime —
  // they don't `import React from 'react'`. Astro 6's getViteConfig wires
  // @astrojs/react into the production build, but the test transform falls
  // back to esbuild's classic runtime, so .tsx components crash at render
  // time with "ReferenceError: React is not defined". Add the Vite React
  // plugin so the test transform uses the automatic runtime.
  //
  // Scope to our own src/ + studio/src — @vitejs/plugin-react also runs
  // React Compiler on whatever it transforms, and inserting `React.c()`
  // calls into library source like `@sanity/ui/src/...` (which Vite hits
  // when it follows the package's `source` export) crashes at render with
  // "Cannot read properties of null (reading 'useMemoCache')".
  plugins: [
    react({
      include: [
        /\/astro-app\/src\/.*\.[jt]sx$/,
        /\/studio\/src\/.*\.[jt]sx$/,
      ],
      exclude: [/\/node_modules\//],
    }),
  ],
  resolve: {
    alias: {
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
    // Concurrent forks + @vitejs/plugin-react's Babel transform deadlocks
    // esbuild's Go runtime ("fatal error: all goroutines are asleep") and
    // kills vitest mid-run with no summary. Run all test files in a single
    // worker to keep the transform load serial and let the suite finish.
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
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

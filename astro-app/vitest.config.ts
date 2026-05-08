/// <reference types="vitest" />
import { getViteConfig } from "astro/config";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// Three-project workspace (Vitest 3.x test.projects):
//
//   unit-node   pure-Node lib / pages / actions / cloudflare / studio schemas.
//               No Astro Vite chain, no React plugin.
//   unit-astro  .astro Container API renders + tests/integration/**. Wrapped
//               via getViteConfig so the Astro Vite chain compiles .astro
//               components, resolves astro:env / sanity:client / cloudflare:
//               workers virtuals, AND handles the .css imports that come in
//               via tests/integration's `studio/src/...` cross-package paths
//               (sanity/lib/bundle.css) — those crash unit-node with
//               "Unknown file extension '.css'" without a Vite plugin chain.
//   unit-react  .test.tsx React-component tests. jsdom + plugin-react-swc
//               (Story 27.1; SWC eliminated the Babel-vs-esbuild deadlock).
//
// Per-tier CI maxForks caps replace Story 27.1's blanket top-level cap of 1.
// The unit-astro tier holds at 1 because Story 27.1's first CI push silent-
// killed under that profile (getViteConfig + parallel forks + ubuntu-latest
// 7 GB) — no evidence yet supports relaxing it. unit-node carries no plugin
// chain and gets maxForks: 2 to reclaim wall-clock; verification protocol
// 6b watches for the same silent-kill pattern. unit-react serializes 4 files
// at trivial cost to bound jsdom + React 19 hydration memory.
//
// pool: 'threads' is non-viable here (rolled back in a9aa8d0 — conflicts
// with @astrojs/cloudflare adapter test surface). singleFork is gone from
// every tier; isolate: true (default) handles vi.resetModules/stubEnv.

const isCI = !!process.env.CI;
const root = import.meta.dirname;

const aliases = {
  "@": resolve(root, "./src"),
  "sanity:client": resolve(
    root,
    "./src/lib/__tests__/__mocks__/sanity-client.ts",
  ),
  "astro:env/client": resolve(
    root,
    "./src/lib/__tests__/__mocks__/astro-env-client.ts",
  ),
  "astro:env/server": resolve(
    root,
    "./src/lib/__tests__/__mocks__/astro-env-server.ts",
  ),
  "cloudflare:workers": resolve(
    root,
    "./src/lib/__tests__/__mocks__/cloudflare-workers.ts",
  ),
  // unit-astro resolves astro:actions via getViteConfig's Astro Vite chain;
  // unit-node and unit-react don't load that chain, so map the virtual id
  // to a stub. Tests that exercise actions still vi.mock the same id.
  "astro:actions": resolve(
    root,
    "./src/lib/__tests__/__mocks__/astro-actions.ts",
  ),
};

const sharedResolve = { alias: aliases, dedupe: ["react", "react-dom"] };
const sharedTest = { globals: true, testTimeout: 15_000 };

const forkPool = (ciMaxForks: number) => ({
  pool: "forks" as const,
  poolOptions: {
    forks: {
      singleFork: false,
      ...(isCI ? { minForks: 1, maxForks: ciMaxForks } : {}),
    },
  },
});

export default defineConfig({
  test: {
    projects: [
      {
        resolve: sharedResolve,
        test: {
          ...sharedTest,
          name: "unit-node",
          environment: "node",
          ...forkPool(2),
          include: [
            "src/lib/__tests__/**/*.test.ts",
            "src/cloudflare/__tests__/**/*.test.ts",
            "src/__tests__/**/*.test.ts",
            "src/pages/**/__tests__/**/*.test.ts",
            "src/actions/__tests__/**/*.test.ts",
            "../studio/src/__tests__/**/*.test.ts",
          ],
          exclude: ["node_modules", "dist", ".astro"],
        },
      },
      // unit-astro is wrapped via getViteConfig so Astro's Vite chain compiles
      // .astro components for experimental_AstroContainer renders. Returns an
      // async fn ({mode, command}) => Promise<UserConfig> — Vitest's projects
      // array supports that form.
      getViteConfig({
        resolve: sharedResolve,
        // @ts-expect-error — getViteConfig types don't include `test`
        test: {
          ...sharedTest,
          name: "unit-astro",
          environment: "node",
          ...forkPool(1),
          include: [
            "src/components/**/__tests__/**/*.test.ts",
            "../tests/integration/**/*.test.ts",
          ],
          exclude: ["node_modules", "dist", ".astro"],
        },
      }),
      {
        plugins: [react()],
        resolve: sharedResolve,
        test: {
          ...sharedTest,
          name: "unit-react",
          environment: "jsdom",
          ...forkPool(1),
          include: [
            "src/**/__tests__/**/*.test.tsx",
            "../studio/src/tools/__tests__/**/*.test.tsx",
          ],
          exclude: ["node_modules", "dist", ".astro"],
        },
      },
    ],
    // Workspace-wide reporter / coverage / output config — applies to every
    // project (per Vitest 3.x semantics; do NOT duplicate per-project).
    coverage: {
      provider: "v8",
      include: ["src/lib/**/*.ts", "src/scripts/**/*.ts"],
      exclude: ["src/lib/__tests__/**", "src/lib/data/**", "src/**/*.d.ts"],
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "../test-results/unit-coverage",
    },
    reporters: ["default", "junit"],
    outputFile: { junit: "../test-results/unit-results.xml" },
  },
});

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
// CI maxForks: 1 per tier — but per-tier caps alone are NOT enough on
// ubuntu-latest. PR #720 pushes #1 and #2 reproduced Story 27.1's OOM-shape
// silent kill (~7–9 files in ~14–18s, exit 1, no summary, no JUnit) even
// with unit-node = 1, because Vitest's projects mode runs the projects
// THEMSELVES in parallel — a single `vitest run` invocation can hold one
// fork per project simultaneously (3 concurrent forks at peak), and that
// total is enough to blow the runner's 7 GB. CI works around this by
// running projects sequentially via the `test:unit:ci` script (three
// `vitest run --project <name>` invocations chained with `&&`); local dev
// keeps the parallel single-invocation form via `npm run test:unit`. The
// per-tier maxForks: 1 cap stays as defense-in-depth so a future regression
// to `npm run test:unit` on CI surfaces as one specific tier's silent kill
// rather than a confusing cross-tier interleave.
//
// pool: 'threads' is non-viable here (rolled back in a9aa8d0 — conflicts
// with @astrojs/cloudflare adapter test surface). singleFork is gone from
// every tier; isolate: true (default) handles vi.resetModules/stubEnv.

const isCI = !!process.env.CI;
const root = import.meta.dirname;

// Aliases shared by every project — applied via sharedResolve below.
const sharedAliases = {
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
};

// Stubs for Astro virtual modules that don't exist outside getViteConfig.
// MUST NOT be merged into unit-astro's resolve.alias — getViteConfig provides
// the real virtuals there, and a stub at the same id would shadow them
// (e.g. defineAction's .orThrow / .safe attachments would disappear,
// breaking action handler tests). Apply only to unit-node + unit-react.
const astroVirtualStubs = {
  "astro:actions": resolve(
    root,
    "./src/lib/__tests__/__mocks__/astro-actions.ts",
  ),
  "astro:middleware": resolve(
    root,
    "./src/lib/__tests__/__mocks__/astro-middleware.ts",
  ),
};

const sharedResolve = { alias: sharedAliases, dedupe: ["react", "react-dom"] };
const stubbedResolve = {
  alias: { ...sharedAliases, ...astroVirtualStubs },
  dedupe: ["react", "react-dom"],
};
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
        resolve: stubbedResolve,
        test: {
          ...sharedTest,
          name: "unit-node",
          environment: "node",
          ...forkPool(1),
          include: [
            "src/lib/__tests__/**/*.test.ts",
            "src/cloudflare/__tests__/**/*.test.ts",
            "src/__tests__/**/*.test.ts",
            "src/pages/**/__tests__/**/*.test.ts",
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
            "src/actions/__tests__/**/*.test.ts",
            "../tests/integration/**/*.test.ts",
            "../studio/src/__tests__/**/*.test.ts",
          ],
          exclude: ["node_modules", "dist", ".astro"],
        },
      }),
      {
        plugins: [react()],
        resolve: stubbedResolve,
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

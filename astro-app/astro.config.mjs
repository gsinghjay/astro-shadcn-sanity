import fs from "node:fs";
import { defineConfig, envField, fontProviders } from "astro/config";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import llms from "astro-llms-md";

const env = loadEnv(import.meta.env.MODE, process.cwd(), "");

// Per-env public vars come from wrangler.jsonc (single source of truth for
// Workers deploy: env[CLOUDFLARE_ENV].vars at runtime, and bake-at-build-time
// here via the lookup below). Top-level vars block = capstone defaults.
// CLOUDFLARE_ENV is set by the deploy:* npm scripts; absent in local dev.
const wranglerVars = (() => {
  const cfEnv = process.env.CLOUDFLARE_ENV;
  if (!cfEnv) return {};
  try {
    const raw = fs.readFileSync(new URL("./wrangler.jsonc", import.meta.url), "utf8");
    const stripped = raw.replace(
      /("(?:\\.|[^"\\])*")|\/\*[\s\S]*?\*\/|\/\/.*$/gm,
      (_m, str) => str ?? "",
    );
    const cfg = JSON.parse(stripped);
    // Capstone vars now live in cfg.env.capstone after the env-block refactor;
    // fall back to top-level cfg for backward compat.
    const block = cfg.env?.[cfEnv] ?? (cfEnv === "capstone" ? cfg : null);
    return block?.vars ?? {};
  } catch (err) {
    console.warn(`[astro.config] Failed to read wrangler.jsonc for CLOUDFLARE_ENV=${cfEnv}:`, err.message);
    return {};
  }
})();

// Mirror wrangler vars into process.env so astro:env (and any direct
// process.env reads inside src/) see the per-environment values during
// `astro build`. Wrangler-block values win over .env so the deploy stays
// authoritative; existing process.env entries (e.g. set by CI) still win
// over wrangler so explicit overrides keep working.
for (const [key, value] of Object.entries(wranglerVars)) {
  if (process.env[key] === undefined && typeof value === "string") {
    process.env[key] = value;
  }
}

// Config-scope vars — astro:env is NOT available here (config runs before init).
// Precedence: wrangler.jsonc env block > .env / process.env > fallback.
const pick = (key, fallback) =>
  wranglerVars[key] || env[key] || process.env[key] || fallback;

const projectId = pick("PUBLIC_SANITY_STUDIO_PROJECT_ID", null) || pick("PUBLIC_SANITY_PROJECT_ID", "placeholder");
const dataset = pick("PUBLIC_SANITY_DATASET", null) || pick("PUBLIC_SANITY_STUDIO_DATASET", "production");
const siteUrl = pick("PUBLIC_SITE_URL", "http://localhost:4321");
const studioUrlBase = pick("PUBLIC_SANITY_STUDIO_URL", "http://localhost:3333");
const studioWorkspace = dataset === "rwc" ? "/rwc" : "/capstone";
const studioUrl = `${studioUrlBase.replace(/\/$/, "")}${studioWorkspace}`;
// Coerce to string before comparison: wrangler.jsonc permits literal boolean
// `true`/`false` in `vars` blocks alongside the string forms we use today.
// Without this, a contributor flipping to the JSON-literal form would silently
// skip the SSR flip below (and the `useCdn` toggle further down) with no log.
const visualEditingEnabled = String(pick("PUBLIC_SANITY_VISUAL_EDITING_ENABLED", ""));

// Story 5.22: preview Workers (visual editing on) flip these content routes to
// SSR so newly-published Sanity pages and global chrome (logo / nav / footer
// from siteSettings) surface immediately. Production keeps them prerendered to
// stay inside the LCP <=2000ms gate. Astro v5+ removed dynamic `prerender`
// exports — the supported pattern is the `astro:route:setup` hook below, which
// overrides `route.prerender` based on the build-time VE flag (per
// docs.astro.build/en/reference/integrations-reference/#astroroutesetup).
// Each entry is matched against `route.component` via `endsWith` — same idiom
// the official docs use. Values are bare suffixes so the check works whether
// the runtime hands us a project-relative `src/pages/...` path or an absolute
// `/abs/.../src/pages/...` one.
const PREVIEW_SSR_ROUTES = [
  'src/pages/index.astro',
  'src/pages/[...slug].astro',
  'src/pages/events/index.astro',
  'src/pages/events/[slug].astro',
  'src/pages/sponsors/index.astro',
  'src/pages/sponsors/[slug].astro',
  'src/pages/articles/index.astro',
  'src/pages/articles/[slug].astro',
  'src/pages/articles/category/[slug].astro',
  'src/pages/authors/index.astro',
  'src/pages/authors/[slug].astro',
  'src/pages/projects/index.astro',
  'src/pages/projects/[slug].astro',
  'src/pages/gallery/index.astro',
];

const previewSsrIntegration = {
  name: 'preview-ssr-content-routes',
  hooks: {
    'astro:route:setup': ({ route }) => {
      if (visualEditingEnabled !== 'true') return;
      if (PREVIEW_SSR_ROUTES.some((suffix) => route.component.endsWith(suffix))) {
        route.prerender = false;
      }
    },
  },
};

export default defineConfig({
  output: "server",
  site: siteUrl,
  env: {
    schema: {
      // --- Client-side public vars ---
      PUBLIC_GTM_ID: envField.string({
        context: "client",
        access: "public",
        optional: true,
        default: "",
      }),
      PUBLIC_SANITY_VISUAL_EDITING_ENABLED: envField.boolean({
        context: "client",
        access: "public",
        default: false,
      }),
      PUBLIC_SANITY_LIVE_CONTENT_ENABLED: envField.boolean({
        context: "client",
        access: "public",
        default: false,
      }),
      PUBLIC_SITE_URL: envField.string({
        context: "client",
        access: "public",
        default: "http://localhost:4321",
      }),
      PUBLIC_SANITY_STUDIO_URL: envField.string({
        context: "client",
        access: "public",
        default: "http://localhost:3333",
      }),
      PUBLIC_SANITY_DATASET: envField.string({
        context: "client",
        access: "public",
        default: "production",
      }),
      PUBLIC_SITE_ID: envField.string({
        context: "client",
        access: "public",
        default: "capstone",
      }),
      PUBLIC_SITE_THEME: envField.enum({
        context: "client",
        access: "public",
        values: ["red", "blue", "green"],
        default: "red",
      }),

      // --- Server-side public vars ---
      PUBLIC_SANITY_STUDIO_PROJECT_ID: envField.string({
        context: "server",
        access: "public",
      }),
      PUBLIC_SANITY_STUDIO_DATASET: envField.string({
        context: "server",
        access: "public",
        default: "production",
      }),

      // --- Server-side secrets ---
      SANITY_API_READ_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      // Worker-only Sanity API token (Viewer permissions) used by
      // /api/portal/admin/acceptances to verify project membership of the
      // claimed Studio user id forwarded as `X-Sanity-User-Id`. Sanity API
      // tokens are `sk`-prefixed (24.1.5).
      SANITY_PROJECT_READ_TOKEN: envField.string({
        context: "server",
        access: "secret",
        startsWith: "sk",
        optional: true,
      }),
      STUDIO_ORIGIN: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
    },
    validateSecrets: true,
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: ["100 900"],
      styles: ["normal", "italic"],
      fallbacks: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
    },
  ],
  adapter: cloudflare({
    // Adapter v13 default is 'cloudflare-binding' (Cloudflare Images runtime
    // binding). Stay on 'compile' until vitest gets a workerd-aware pool —
    // flipping the default switches @astrojs/cloudflare into Workers test
    // mode and the existing forks-pool suite collapses with `require is not
    // defined`. Sanity images bypass <Image> via urlFor() so the build-time
    // service is fine in production. Track in a follow-up spike.
    imageService: 'compile',
  }),
  vite: {
    plugins: [
      tailwindcss(),
      // Pre-compile CJS-only deps so they work in the workerd dev / vitest
      // environment introduced by adapter v13. picomatch is reachable via
      // @astrojs/react and uses a bare `require`. Removing this still trips
      // "require is not defined" at vitest startup as of adapter 13.2 + react 5.0.
      {
        name: "optimize-cjs-for-workerd",
        configEnvironment(environment) {
          if (environment !== "client") {
            return {
              optimizeDeps: {
                include: ["picomatch", "@astrojs/react > picomatch"],
              },
            };
          }
        },
      },
    ],
    ssr: {
      noExternal: ["nanostores", "@nanostores/react"],
    },
  },
  integrations: [
    previewSsrIntegration,
    sanity({
      projectId,
      dataset,
      useCdn: visualEditingEnabled !== 'true',
      apiVersion: "2025-03-01",
      stega: {
        studioUrl,
      },
    }),
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/portal/') &&
        !page.includes('/auth/') &&
        !page.includes('/student/') &&
        !page.includes('/demo/'),
    }),
    // Gate astro-llms-md on visual editing OFF: stega-encoded HTML leaks
    // private-use Unicode markers into the .md/.txt output otherwise.
    ...(visualEditingEnabled === 'true'
      ? []
      : [
          llms({
            siteUrl,
            contentSelector: 'main',
            titleSelector: 'h1',
            exclude: [
              '404', '404.html', '_astro', '**.xml', '**.txt', 'node_modules',
              '**/portal/**', '**/auth/**', '**/student/**', '**/demo/**', '**/api/**',
            ],
            generateIndividualMd: true,
            generateLlmsTxt: true,
            generateLlmsFullTxt: true,
            verbose: false,
          }),
        ]),
  ],
});

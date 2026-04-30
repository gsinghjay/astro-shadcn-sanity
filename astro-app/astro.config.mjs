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
const visualEditingEnabled = pick("PUBLIC_SANITY_VISUAL_EDITING_ENABLED", "");

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
      STUDIO_ADMIN_TOKEN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
        startsWith: "sat_",
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
    // Adapter v13 default is 'cloudflare-binding' (Images runtime binding).
    // Pin to 'compile' to preserve current behavior — Sanity images bypass
    // <Image> already, so adopting the binding is a separate spike.
    imageService: 'compile',
  }),
  vite: {
    plugins: [
      tailwindcss(),
      // Pre-compile CJS-only deps so they work in the workerd dev environment introduced
      // by adapter v13. picomatch is reachable via @astrojs/react and uses bare `require`.
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
        !page.includes('/demo/') &&
        page !== '/search' &&
        !page.startsWith('/search/'),
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
              '**/portal/**', '**/auth/**', '**/student/**', '**/demo/**',
            ],
            generateIndividualMd: true,
            generateLlmsTxt: true,
            generateLlmsFullTxt: true,
            verbose: false,
          }),
        ]),
  ],
});

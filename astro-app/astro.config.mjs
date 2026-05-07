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

// @astrojs/cloudflare's astro:config:done hook unconditionally loads .dev.vars
// into process.env via Object.assign(process.env, parsed) — even for production
// builds. That fires AFTER this config file returns and silently overwrites
// wrangler-block values for any key present in both (e.g. BETTER_AUTH_URL),
// which broke Better Auth's trustedOrigins check on prod (Story 24.2 baked
// the resolved BETTER_AUTH_URL into the bundle, the .dev.vars `localhost:4321`
// landed instead of the wrangler `https://www.ywcccapstone1.com`, every
// sign-in 403'd with "Invalid origin"). Re-apply wrangler vars at
// astro:build:start — that hook fires AFTER astro:config:done but BEFORE the
// rollup phase reads process.env to inline astro:env public vars.
const wranglerOverrideIntegration = {
  name: "override-from-wrangler-vars",
  hooks: {
    "astro:build:start": () => {
      for (const [key, value] of Object.entries(wranglerVars)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
    },
  },
};

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
      // SanityLiveUpdater.astro reads these from a client-side <script> block;
      // ContactForm reads PUBLIC_TURNSTILE_SITE_KEY from frontmatter rendered
      // server-side but they're public values surfaced to the markup either way.
      // PROJECT_ID has no safe fallback — required-client-public so a
      // misconfigured Worker fails at build instead of silently going dark.
      PUBLIC_SANITY_STUDIO_PROJECT_ID: envField.string({
        context: "client",
        access: "public",
      }),
      PUBLIC_SANITY_STUDIO_DATASET: envField.string({
        context: "client",
        access: "public",
        default: "production",
      }),
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({
        context: "client",
        access: "public",
        default: "",
      }),
      // Bridges the astro-app portal to platform-api (Epic 12 / Story 12.8a). Optional
      // because RWC + *-preview Workers don't carry the var; the helper in
      // src/lib/platform-api-client.ts short-circuits with PlatformApiAuthError
      // when unset, so callers fail loudly instead of hitting `undefined` at runtime.
      PUBLIC_PLATFORM_API_BASE_URL: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),

      // --- Server-side public vars (capstone-only — optional for rwc parity) ---
      // rwc_us / rwc_intl wrangler blocks don't carry these. optional:true
      // closes the audit's parity-gap item; createAuth() throws fail-loud at
      // runtime if portal/auth code paths actually need them.
      BETTER_AUTH_URL: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
      GITHUB_CLIENT_ID: envField.string({
        context: "server",
        access: "public",
        optional: true,
      }),
      RESEND_FROM_EMAIL: envField.string({
        context: "server",
        access: "public",
        optional: true,
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

      // --- Server-side secrets (portal / auth / write paths) ---
      // The `capstone` (prod) and `capstone_preview` (staging) Workers both
      // run the portal — capstone_preview shares prod D1/KV bindings so its
      // build needs the same secrets. RWC + RWC-preview Workers stay
      // content-only (no D1/KV/DO bindings) and portal/auth/api routes return
      // 503 there. Marking these `optional` for non-portal envs lets
      // `astro:env/server` return undefined at runtime instead of throwing
      // EnvInvalidVariables on every request when the bundle imports
      // `actions/index.ts` (which transitively reads these). Capstone +
      // capstone_preview stay strict so a missing secret fails the build
      // immediately.
      ...(process.env.CLOUDFLARE_ENV === "capstone" ||
      process.env.CLOUDFLARE_ENV === "capstone_preview"
        ? {
            BETTER_AUTH_SECRET: envField.string({ context: "server", access: "secret" }),
            GITHUB_CLIENT_SECRET: envField.string({ context: "server", access: "secret" }),
            GOOGLE_CLIENT_ID: envField.string({ context: "server", access: "secret" }),
            GOOGLE_CLIENT_SECRET: envField.string({ context: "server", access: "secret" }),
            RESEND_API_KEY: envField.string({ context: "server", access: "secret" }),
            TURNSTILE_SECRET_KEY: envField.string({ context: "server", access: "secret" }),
            SANITY_API_WRITE_TOKEN: envField.string({ context: "server", access: "secret" }),
          }
        : {
            BETTER_AUTH_SECRET: envField.string({ context: "server", access: "secret", optional: true }),
            GITHUB_CLIENT_SECRET: envField.string({ context: "server", access: "secret", optional: true }),
            GOOGLE_CLIENT_ID: envField.string({ context: "server", access: "secret", optional: true }),
            GOOGLE_CLIENT_SECRET: envField.string({ context: "server", access: "secret", optional: true }),
            RESEND_API_KEY: envField.string({ context: "server", access: "secret", optional: true }),
            TURNSTILE_SECRET_KEY: envField.string({ context: "server", access: "secret", optional: true }),
            SANITY_API_WRITE_TOKEN: envField.string({ context: "server", access: "secret", optional: true }),
          }),
      DISCORD_WEBHOOK_URL: envField.string({ context: "server", access: "secret", optional: true }),
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
    wranglerOverrideIntegration,
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
              '**/portal/**', '**/auth/**', '**/student/**', '**/demo/**', '**/api/**',
              'search', '**/search/**',
            ],
            generateIndividualMd: true,
            generateLlmsTxt: true,
            generateLlmsFullTxt: true,
            verbose: false,
          }),
        ]),
  ],
});

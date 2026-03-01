/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

interface ImportMetaEnv {
  readonly PUBLIC_SANITY_STUDIO_PROJECT_ID: string;
  readonly PUBLIC_SANITY_STUDIO_DATASET: string;
  readonly PUBLIC_SANITY_DATASET: string;
  readonly PUBLIC_SANITY_VISUAL_EDITING_ENABLED: string;
  readonly PUBLIC_SANITY_LIVE_CONTENT_ENABLED: string;
  readonly PUBLIC_SANITY_STUDIO_URL: string;
  readonly PUBLIC_SITE_ID: string;
  readonly PUBLIC_SITE_THEME: "red" | "blue" | "green";
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_GTM_ID: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type Runtime = import("@astrojs/cloudflare").Runtime<{
  CF_ACCESS_TEAM_DOMAIN: string;
  CF_ACCESS_AUD: string;
  TURNSTILE_SECRET_KEY: string;
  DISCORD_WEBHOOK_URL: string;
  SANITY_API_WRITE_TOKEN: string;
  PORTAL_DB: D1Database;
}>;

declare namespace App {
  interface Locals extends Runtime {
    user?: { email: string };
  }
}

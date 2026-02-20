/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

type Runtime = import("@astrojs/cloudflare").Runtime<{
  CF_ACCESS_TEAM_DOMAIN: string;
  CF_ACCESS_AUD: string;
  TURNSTILE_SECRET_KEY: string;
  DISCORD_WEBHOOK_URL: string;
  SANITY_API_WRITE_TOKEN: string;
}>;

declare namespace App {
  interface Locals extends Runtime {
    user?: { email: string };
  }
}

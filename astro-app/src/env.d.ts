/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />

type Runtime = import("@astrojs/cloudflare").Runtime<{
  CF_ACCESS_TEAM_DOMAIN: string;
  CF_ACCESS_AUD: string;
}>;

declare namespace App {
  interface Locals extends Runtime {
    user?: { email: string };
  }
}

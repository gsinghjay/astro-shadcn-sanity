import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";

const env = loadEnv(import.meta.env.MODE, process.cwd(), "");

// Fallback to process.env for Cloudflare Pages builds (no .env file on CF)
const projectId = env.PUBLIC_SANITY_STUDIO_PROJECT_ID || process.env.PUBLIC_SANITY_STUDIO_PROJECT_ID || env.PUBLIC_SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset = env.PUBLIC_SANITY_DATASET || process.env.PUBLIC_SANITY_DATASET || env.PUBLIC_SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_STUDIO_DATASET || "production";
const siteUrl = env.PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || "http://localhost:4321";
const studioUrl = env.PUBLIC_SANITY_STUDIO_URL || process.env.PUBLIC_SANITY_STUDIO_URL || "http://localhost:3333";
const gtmId = env.PUBLIC_GTM_ID || process.env.PUBLIC_GTM_ID || "";
const visualEditingEnabled = env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED || process.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED || "";
const liveContentEnabled = env.PUBLIC_SANITY_LIVE_CONTENT_ENABLED || process.env.PUBLIC_SANITY_LIVE_CONTENT_ENABLED || "";

export default defineConfig({
  output: "static",
  site: siteUrl,
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["nanostores", "@nanostores/react"],
    },
    define: {
      // Explicitly pass PUBLIC_* vars through Vite's define for .astro files.
      // The @astrojs/cloudflare adapter's define: { "process.env": "process.env" }
      // prevents Vite from picking these up via its normal envPrefix mechanism.
      "import.meta.env.PUBLIC_GTM_ID": JSON.stringify(gtmId),
      "import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED": JSON.stringify(visualEditingEnabled),
      "import.meta.env.PUBLIC_SANITY_LIVE_CONTENT_ENABLED": JSON.stringify(liveContentEnabled),
    },
  },
  integrations: [
    sanity({
      projectId,
      dataset,
      useCdn: !(env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED || process.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED),
      apiVersion: "2025-03-01",
      stega: {
        studioUrl,
      },
    }),
    react(),
  ],
});

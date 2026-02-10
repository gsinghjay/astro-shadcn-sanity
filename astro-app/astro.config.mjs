import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";

const env = loadEnv(import.meta.env.MODE, process.cwd(), "");

// Fallback to process.env for Cloudflare Pages git integration builds (no .env file)
const projectId = env.PUBLIC_SANITY_STUDIO_PROJECT_ID || process.env.PUBLIC_SANITY_STUDIO_PROJECT_ID || env.PUBLIC_SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset = env.PUBLIC_SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_STUDIO_DATASET || env.PUBLIC_SANITY_DATASET || process.env.PUBLIC_SANITY_DATASET || "production";
const isVisualEditing = (env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED || process.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED) === "true";
const siteUrl = env.PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || "http://localhost:4321";

export default defineConfig({
  output: isVisualEditing ? "server" : "static",
  site: siteUrl,
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sanity({
      projectId,
      dataset,
      useCdn: false,
      apiVersion: "2024-12-08",
      stega: {
        studioUrl: "https://ywcccapstone.sanity.studio",
      },
    }),
    react(),
  ],
});

import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";

const {
  PUBLIC_SANITY_STUDIO_PROJECT_ID,
  PUBLIC_SANITY_STUDIO_DATASET,
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_SANITY_DATASET,
  PUBLIC_SITE_URL,
} = loadEnv(import.meta.env.MODE, process.cwd(), "");

// Fallback to placeholder values so builds succeed with placeholder data when .env is missing
const projectId = PUBLIC_SANITY_STUDIO_PROJECT_ID || PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset = PUBLIC_SANITY_STUDIO_DATASET || PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  output: "static",
  site: PUBLIC_SITE_URL || "http://localhost:4321",
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
    icon(),
    react(),
  ],
});

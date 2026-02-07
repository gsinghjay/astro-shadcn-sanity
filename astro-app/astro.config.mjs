import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

const {
  PUBLIC_SANITY_STUDIO_PROJECT_ID,
  PUBLIC_SANITY_STUDIO_DATASET,
  PUBLIC_SANITY_PROJECT_ID,
  PUBLIC_SANITY_DATASET,
} = loadEnv(import.meta.env.MODE, process.cwd(), "");

// Fallback to placeholder values so builds succeed with placeholder data when .env is missing
const projectId = PUBLIC_SANITY_STUDIO_PROJECT_ID || PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset = PUBLIC_SANITY_STUDIO_DATASET || PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  output: "static",
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sanity({
      projectId,
      dataset,
      useCdn: false,
      apiVersion: "2024-12-08",
    }),
    icon(),
  ],
});

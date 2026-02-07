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

const projectId = PUBLIC_SANITY_STUDIO_PROJECT_ID || PUBLIC_SANITY_PROJECT_ID;
const dataset = PUBLIC_SANITY_STUDIO_DATASET || PUBLIC_SANITY_DATASET;

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

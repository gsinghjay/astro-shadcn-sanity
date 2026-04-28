import { defineConfig, envField, fontProviders } from "astro/config";
import { loadEnv } from "vite";
import sanity from "@sanity/astro";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

const env = loadEnv(import.meta.env.MODE, process.cwd(), "");

// Config-scope vars — astro:env is NOT available here (config runs before init).
// Keep loadEnv() / process.env only for values consumed directly by defineConfig.
const projectId = env.PUBLIC_SANITY_STUDIO_PROJECT_ID || process.env.PUBLIC_SANITY_STUDIO_PROJECT_ID || env.PUBLIC_SANITY_PROJECT_ID || process.env.PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset = env.PUBLIC_SANITY_DATASET || process.env.PUBLIC_SANITY_DATASET || env.PUBLIC_SANITY_STUDIO_DATASET || process.env.PUBLIC_SANITY_STUDIO_DATASET || "production";
const siteUrl = env.PUBLIC_SITE_URL || process.env.PUBLIC_SITE_URL || "http://localhost:4321";
const studioUrlBase = env.PUBLIC_SANITY_STUDIO_URL || process.env.PUBLIC_SANITY_STUDIO_URL || "http://localhost:3333";
const studioWorkspace = dataset === "rwc" ? "/rwc" : "/capstone";
const studioUrl = `${studioUrlBase.replace(/\/$/, "")}${studioWorkspace}`;
const visualEditingEnabled = env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED || process.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED || "";

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
    },
    validateSecrets: true,
  },
  experimental: {
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
  },
  adapter: cloudflare({ platformProxy: { enabled: true } }),
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ["nanostores", "@nanostores/react"],
    },
  },
  integrations: [
    sanity({
      projectId,
      dataset,
      useCdn: !visualEditingEnabled,
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
        !page.includes('/demo/'),
    }),
  ],
});

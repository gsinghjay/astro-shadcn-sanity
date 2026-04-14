/**
 * Mock for the `astro:env/client` Astro virtual module.
 * Provides typed env vars for unit testing.
 *
 * Values mirror the defaults declared in astro.config.mjs env.schema.
 * Tests that need different values should use vi.mock() to override.
 */
export const PUBLIC_GTM_ID = "";
export const PUBLIC_SANITY_VISUAL_EDITING_ENABLED = false;
export const PUBLIC_SANITY_LIVE_CONTENT_ENABLED = false;
export const PUBLIC_SITE_URL = "http://localhost:4321";
export const PUBLIC_SANITY_STUDIO_URL = "http://localhost:3333";
export const PUBLIC_SANITY_DATASET = "production";
export const PUBLIC_SITE_ID = "capstone";
export const PUBLIC_SITE_THEME = "red";

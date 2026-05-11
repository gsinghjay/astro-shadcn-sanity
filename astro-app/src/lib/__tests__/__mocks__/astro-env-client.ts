/**
 * Mock for the `astro:env/client` Astro virtual module.
 * Provides typed env vars for unit testing.
 *
 * Values mirror the defaults declared in astro.config.mjs env.schema.
 * Tests that need different values should use vi.mock() to override.
 */
export const PUBLIC_GTM_ID = "";
// PUBLIC_SANITY_VISUAL_EDITING_ENABLED retained for backward-compat with RWC
// preview Workers + tests under Story 5.22 that mock the build-time gate.
// Capstone's preview mode is request-scoped (Story 26.1) — wrap call sites in
// runWithPreviewMode() from @/lib/preview-mode instead.
export const PUBLIC_SANITY_VISUAL_EDITING_ENABLED = false;
export const PUBLIC_SANITY_LIVE_CONTENT_ENABLED = false;
export const PUBLIC_SITE_URL = "http://localhost:4321";
export const PUBLIC_SANITY_STUDIO_URL = "http://localhost:3333";
export const PUBLIC_SANITY_DATASET = "production";
export const PUBLIC_SITE_ID = "capstone";
export const PUBLIC_SITE_THEME = "red";
export const PUBLIC_SANITY_STUDIO_PROJECT_ID = "test-project-id";
export const PUBLIC_SANITY_STUDIO_DATASET = "production";
export const PUBLIC_TURNSTILE_SITE_KEY = "";
export const PUBLIC_PLATFORM_API_BASE_URL: string | undefined = undefined;

/**
 * Mock for the `astro:env/server` Astro virtual module.
 * Provides typed env vars for unit testing.
 *
 * Values mirror the defaults declared in astro.config.mjs env.schema.
 * Tests that need different values should use vi.mock() to override.
 */
export const PUBLIC_SANITY_STUDIO_PROJECT_ID = "test-project-id";
export const PUBLIC_SANITY_STUDIO_DATASET = "production";
export const SANITY_API_READ_TOKEN: string | undefined = undefined;

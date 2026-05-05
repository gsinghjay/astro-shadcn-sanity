/**
 * Mock for the `astro:env/server` Astro virtual module.
 * Provides typed env vars for unit testing.
 *
 * Values mirror the defaults declared in astro.config.mjs env.schema.
 * Tests that need different values should use vi.mock() to override.
 *
 * `PUBLIC_SANITY_STUDIO_PROJECT_ID` and `PUBLIC_SANITY_STUDIO_DATASET` are
 * intentionally NOT exported here — they are `context: "client"` in the
 * schema (Story 5.20 Task 6.3 Option A) and must be mocked from
 * `astro:env/client` instead. See `astro-env-client.ts` in this folder.
 */
export const SANITY_API_READ_TOKEN: string | undefined = undefined;

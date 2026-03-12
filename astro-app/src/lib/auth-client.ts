/**
 * Client-side Better Auth client for authenticated pages (student + sponsor).
 * Provides typed methods for sign-in, sign-out, and session retrieval.
 * Imported by portal login, student pages, and denied page for client-side auth interactions.
 *
 * Note: Full type inference for custom fields (e.g., role) requires
 * `createAuthClient<typeof auth>()` but the server auth type can't be
 * imported client-side due to server-only dependencies (drizzle, resend).
 */
import { createAuthClient } from 'better-auth/client';
import { magicLinkClient } from 'better-auth/client/plugins';

// Better Auth requires an absolute URL. In the browser (where this module runs),
// build the full origin; in test/SSR contexts fall back to relative path.
const baseURL = typeof window !== 'undefined'
  ? `${window.location.origin}/api/auth`
  : '/api/auth';

export const authClient = createAuthClient({
  baseURL,
  plugins: [magicLinkClient()],
});

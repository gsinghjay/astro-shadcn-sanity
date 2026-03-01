/**
 * Client-side Better Auth client for student pages.
 * Provides typed methods for sign-in, sign-out, and session retrieval.
 * Imported by student portal pages (Story 16.3+) for client-side auth interactions.
 */
import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: '/api/auth',
});

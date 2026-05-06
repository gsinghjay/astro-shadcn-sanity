/**
 * Authenticated client for platform-api (Epic 12 / Story 12.8a).
 *
 * Bridges astro-app's Better Auth session cookie to platform-api's
 * OAuth2 password-grant scaffold. The cookie value IS the bearer token —
 * platform-api validates it against the shared D1 `session` row.
 *
 * Helper short-circuits with PlatformApiAuthError when:
 *   - PUBLIC_PLATFORM_API_BASE_URL is unset (RWC + *-preview Workers)
 *   - the request carries no Better Auth session cookie
 *   - middleware did not populate Astro.locals.user
 *
 * Never logs the raw token value.
 */
import { PUBLIC_PLATFORM_API_BASE_URL } from 'astro:env/client';
import { log } from '@/lib/log';
import type { AstroGlobal } from 'astro';

export type PlatformApiAuthErrorCode = 'no_session' | 'not_configured' | 'no_email';

export class PlatformApiAuthError extends Error {
  constructor(public readonly code: PlatformApiAuthErrorCode) {
    super(`platform-api auth: ${code}`);
    this.name = 'PlatformApiAuthError';
  }
}

export interface PlatformApiClient {
  fetch: (path: string, init?: RequestInit) => Promise<Response>;
}

/** Mirrors middleware.ts:extractSessionToken — handles `__Secure-` prefix. */
function readSessionToken(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:__Secure-)?better-auth\.session_token=([^;]+)/);
  return match?.[1] ?? null;
}

export function createPlatformApiClient(astro: AstroGlobal): PlatformApiClient {
  if (!PUBLIC_PLATFORM_API_BASE_URL) {
    throw new PlatformApiAuthError('not_configured');
  }

  const token = readSessionToken(astro.request.headers.get('cookie'));
  const email = astro.locals.user?.email ?? null;

  if (!token) {
    log.warn('platform-api-no-session', { email });
    throw new PlatformApiAuthError('no_session');
  }
  if (!email) {
    log.warn('platform-api-no-email');
    throw new PlatformApiAuthError('no_email');
  }

  const base = PUBLIC_PLATFORM_API_BASE_URL.replace(/\/$/, '');

  return {
    fetch: (path, init = {}) =>
      fetch(`${base}${path}`, {
        ...init,
        headers: {
          ...(init.headers ?? {}),
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      }),
  };
}

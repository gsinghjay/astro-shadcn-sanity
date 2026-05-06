import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { AstroGlobal } from 'astro';

// astro:env/client is mocked via vitest's __mocks__ alias; per-case overrides use vi.doMock.
// `vi.hoisted` keeps the dynamic-import pattern compatible with the hoisted mock setup.

function buildAstro(opts: {
  cookieHeader?: string | null;
  email?: string | null;
}): AstroGlobal {
  return {
    request: new Request('http://localhost/portal', {
      headers: opts.cookieHeader != null ? { cookie: opts.cookieHeader } : {},
    }),
    locals: opts.email !== undefined ? { user: opts.email == null ? undefined : { email: opts.email, name: 'X', role: 'sponsor' } } : {},
  } as unknown as AstroGlobal;
}

describe('createPlatformApiClient', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    fetchSpy = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchSpy);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
    vi.doUnmock('astro:env/client');
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('happy path → injects Authorization: Bearer <token> on outbound request', async () => {
    vi.doMock('astro:env/client', () => ({
      PUBLIC_PLATFORM_API_BASE_URL: 'https://platform-api.example.com',
    }));
    const { createPlatformApiClient } = await import('../platform-api-client');

    const astro = buildAstro({
      cookieHeader: 'better-auth.session_token=tok-abc-123; other=ignored',
      email: 'sponsor@example.com',
    });

    const client = createPlatformApiClient(astro);
    const resp = await client.fetch('/api/v1/platform/health');

    expect(resp.status).toBe(204);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://platform-api.example.com/api/v1/platform/health');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok-abc-123');
    expect((init.headers as Record<string, string>).Accept).toBe('application/json');
  });

  it('handles __Secure- prefixed cookie name (production cookie config)', async () => {
    vi.doMock('astro:env/client', () => ({
      PUBLIC_PLATFORM_API_BASE_URL: 'https://platform-api.example.com',
    }));
    const { createPlatformApiClient } = await import('../platform-api-client');

    const astro = buildAstro({
      cookieHeader: '__Secure-better-auth.session_token=secure-tok-456',
      email: 'sponsor@example.com',
    });

    const client = createPlatformApiClient(astro);
    await client.fetch('/api/v1/forms/submissions');

    const init = fetchSpy.mock.calls[0]![1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer secure-tok-456');
  });

  it('strips a trailing slash from the base URL before joining the path', async () => {
    vi.doMock('astro:env/client', () => ({
      PUBLIC_PLATFORM_API_BASE_URL: 'https://platform-api.example.com/',
    }));
    const { createPlatformApiClient } = await import('../platform-api-client');

    const astro = buildAstro({
      cookieHeader: 'better-auth.session_token=tok',
      email: 'sponsor@example.com',
    });

    createPlatformApiClient(astro).fetch('/api/v1/x');

    const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://platform-api.example.com/api/v1/x');
  });

  it('no_session → throws PlatformApiAuthError when cookie is absent', async () => {
    vi.doMock('astro:env/client', () => ({
      PUBLIC_PLATFORM_API_BASE_URL: 'https://platform-api.example.com',
    }));
    const { createPlatformApiClient, PlatformApiAuthError } = await import('../platform-api-client');

    const astro = buildAstro({ cookieHeader: null, email: 'sponsor@example.com' });

    expect(() => createPlatformApiClient(astro)).toThrow(PlatformApiAuthError);
    try {
      createPlatformApiClient(astro);
    } catch (err) {
      expect((err as InstanceType<typeof PlatformApiAuthError>).code).toBe('no_session');
    }
  });

  it('no_email → throws PlatformApiAuthError when locals.user is missing', async () => {
    vi.doMock('astro:env/client', () => ({
      PUBLIC_PLATFORM_API_BASE_URL: 'https://platform-api.example.com',
    }));
    const { createPlatformApiClient, PlatformApiAuthError } = await import('../platform-api-client');

    const astro = buildAstro({
      cookieHeader: 'better-auth.session_token=tok-abc',
      email: null,
    });

    try {
      createPlatformApiClient(astro);
      throw new Error('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(PlatformApiAuthError);
      expect((err as InstanceType<typeof PlatformApiAuthError>).code).toBe('no_email');
    }
  });

  it('not_configured → throws PlatformApiAuthError when env var is unset', async () => {
    vi.doMock('astro:env/client', () => ({
      PUBLIC_PLATFORM_API_BASE_URL: undefined,
    }));
    const { createPlatformApiClient, PlatformApiAuthError } = await import('../platform-api-client');

    const astro = buildAstro({
      cookieHeader: 'better-auth.session_token=tok',
      email: 'sponsor@example.com',
    });

    try {
      createPlatformApiClient(astro);
      throw new Error('expected throw');
    } catch (err) {
      expect(err).toBeInstanceOf(PlatformApiAuthError);
      expect((err as InstanceType<typeof PlatformApiAuthError>).code).toBe('not_configured');
    }
  });

  it('never logs the raw token value', async () => {
    vi.doMock('astro:env/client', () => ({
      PUBLIC_PLATFORM_API_BASE_URL: 'https://platform-api.example.com',
    }));
    const { createPlatformApiClient } = await import('../platform-api-client');

    const sensitiveToken = 'super-secret-bearer-token-value-do-not-log';

    // no_session path emits log.warn — verify the warn call doesn't include any token
    try {
      createPlatformApiClient(buildAstro({ cookieHeader: null, email: 'a@b.com' }));
    } catch {
      /* expected throw */
    }

    // Happy path: should not log at all
    const client = createPlatformApiClient(
      buildAstro({
        cookieHeader: `better-auth.session_token=${sensitiveToken}`,
        email: 'a@b.com',
      }),
    );
    await client.fetch('/api/v1/platform/health');

    const allLogCalls = [
      ...logSpy.mock.calls,
      ...warnSpy.mock.calls,
      ...errorSpy.mock.calls,
    ].map(args => JSON.stringify(args));

    for (const line of allLogCalls) {
      expect(line).not.toContain(sensitiveToken);
    }
  });
});

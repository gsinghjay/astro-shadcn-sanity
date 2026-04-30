import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// astro:middleware is a virtual module — defineMiddleware is an identity function
vi.mock('astro:middleware', () => ({
  defineMiddleware: (fn: any) => fn,
}));

const {
  mockGetDrizzle,
  mockCreateAuth,
  mockGetSession,
  mockCheckSponsorWhitelist,
  mockKvGet,
  mockKvPut,
  mockKvDelete,
  mockCheckLimit,
  mockD1Run,
  mockD1First,
  mockD1Bind,
  mockD1Prepare,
  mockEnv,
} = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockGetDrizzle = vi.fn().mockReturnValue({ __drizzle: true });
  const mockCreateAuth = vi.fn().mockReturnValue({ api: { getSession: mockGetSession } });
  const mockCheckSponsorWhitelist = vi.fn().mockResolvedValue(false);
  const mockKvGet = vi.fn();
  const mockKvPut = vi.fn().mockResolvedValue(undefined);
  const mockKvDelete = vi.fn().mockResolvedValue(undefined);
  const mockCheckLimit = vi.fn();
  const mockD1Run = vi.fn().mockResolvedValue({});
  const mockD1First = vi.fn().mockResolvedValue({ agreement_accepted_at: null });
  const mockD1Bind = vi.fn().mockReturnValue({ run: mockD1Run, first: mockD1First });
  const mockD1Prepare = vi.fn().mockReturnValue({ bind: mockD1Bind });
  // Adapter v13 reads bindings via `import { env } from "cloudflare:workers"`
  // — `locals.runtime.env` is gone. Tests share this object reference with
  // the cloudflare:workers mock and mutate it through beforeEach.
  const mockEnv: Record<string, any> = {
    PORTAL_DB: { prepare: mockD1Prepare },
    GOOGLE_CLIENT_ID: 'test-google-id',
    GOOGLE_CLIENT_SECRET: 'test-google-secret',
    GITHUB_CLIENT_ID: 'test-github-id',
    GITHUB_CLIENT_SECRET: 'test-github-secret',
    BETTER_AUTH_SECRET: 'test-auth-secret',
    BETTER_AUTH_URL: 'http://localhost:4321',
    RESEND_API_KEY: 'test-resend-key',
    SESSION_CACHE: undefined,
    RATE_LIMITER: undefined,
  };
  return {
    mockGetDrizzle,
    mockCreateAuth,
    mockGetSession,
    mockCheckSponsorWhitelist,
    mockKvGet,
    mockKvPut,
    mockKvDelete,
    mockCheckLimit,
    mockD1Run,
    mockD1First,
    mockD1Bind,
    mockD1Prepare,
    mockEnv,
  };
});

vi.mock('@/lib/db', () => ({ getDrizzle: mockGetDrizzle }));
vi.mock('@/lib/auth-config', () => ({
  createAuth: mockCreateAuth,
  checkSponsorWhitelist: mockCheckSponsorWhitelist,
}));
vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

import { onRequest } from '../middleware';

function createMockRateLimiter() {
  return {
    idFromName: vi.fn().mockReturnValue('mock-do-id'),
    get: vi.fn().mockReturnValue({ checkLimit: mockCheckLimit }),
  };
}

function createMockContext(pathname: string, options?: { headers?: Record<string, string>; overrides?: Partial<App.Locals> }) {
  return {
    url: new URL(`http://localhost:4321${pathname}`),
    request: new Request(`http://localhost:4321${pathname}`, { headers: options?.headers }),
    // `runtime.env` is no longer read by middleware (adapter v13 — see
    // cloudflare:workers mock above). Keep a runtime stub so tests that pass
    // overrides at this level don't break, but the source of truth is mockEnv.
    locals: { runtime: { env: mockEnv }, ...options?.overrides } as unknown as App.Locals,
    redirect: vi.fn((url: string) => new Response(null, { status: 302, headers: { Location: url } })),
  };
}

const mockNext = vi.fn(async () => new Response('ok', { status: 200 }));

describe('middleware — unified auth routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.DEV = false;
    mockEnv.SESSION_CACHE = undefined;
    mockEnv.RATE_LIMITER = undefined;
    mockGetDrizzle.mockReturnValue({ __drizzle: true });
    mockCreateAuth.mockReturnValue({ api: { getSession: mockGetSession } });
    mockKvGet.mockReset();
    mockKvPut.mockReset().mockResolvedValue(undefined);
    mockKvDelete.mockReset().mockResolvedValue(undefined);
    mockCheckLimit.mockReset();
    mockCheckSponsorWhitelist.mockReset().mockResolvedValue(false);
    mockD1Run.mockReset().mockResolvedValue({});
    mockD1First.mockReset().mockResolvedValue({ agreement_accepted_at: null });
    mockD1Bind.mockReset().mockReturnValue({ run: mockD1Run, first: mockD1First });
    mockD1Prepare.mockReset().mockReturnValue({ bind: mockD1Bind });
  });

  afterEach(() => {
    import.meta.env.DEV = false;
  });

  describe('Public routes', () => {
    it('calls next() without auth for public route /about', async () => {
      const ctx = createMockContext('/about');
      await onRequest(ctx as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockGetSession).not.toHaveBeenCalled();
      expect(ctx.locals.user).toBeUndefined();
    });

    it('passes through /api/auth/callback without intercepting', async () => {
      const ctx = createMockContext('/api/auth/callback');
      await onRequest(ctx as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(ctx.locals.user).toBeUndefined();
    });

    it('passes through /portal/login without auth check', async () => {
      const ctx = createMockContext('/portal/login');
      await onRequest(ctx as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockGetSession).not.toHaveBeenCalled();
      expect(ctx.locals.user).toBeUndefined();
    });

    it('passes through /portal/denied without auth check', async () => {
      const ctx = createMockContext('/portal/denied');
      await onRequest(ctx as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(ctx.locals.user).toBeUndefined();
    });

    it('passes through /portal/login/ with trailing slash', async () => {
      const ctx = createMockContext('/portal/login/');
      await onRequest(ctx as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockGetSession).not.toHaveBeenCalled();
      expect(ctx.locals.user).toBeUndefined();
    });

    it('does not intercept /portalinfo (strict prefix match)', async () => {
      const ctx = createMockContext('/portalinfo');
      await onRequest(ctx as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(ctx.locals.user).toBeUndefined();
    });

    it('does not intercept /studentinfo (strict prefix match)', async () => {
      const ctx = createMockContext('/studentinfo');
      await onRequest(ctx as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(ctx.locals.user).toBeUndefined();
    });

    it('passes through /portal/denied/ with trailing slash', async () => {
      const ctx = createMockContext('/portal/denied/');
      await onRequest(ctx as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(ctx.locals.user).toBeUndefined();
    });
  });

  describe('Portal routes — Better Auth sponsor session', () => {
    const sessionCookie = 'better-auth.session_token=sponsor-token-123; Path=/';

    it('sets role "sponsor" on valid session with sponsor role', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'sponsor@company.com', name: 'Test Sponsor', role: 'sponsor' },
        session: { id: 's1', token: 'tok' },
      });
      const ctx = createMockContext('/portal/index', { headers: { cookie: sessionCookie } });

      await onRequest(ctx as any, mockNext);

      expect(ctx.locals.user).toEqual({
        email: 'sponsor@company.com',
        name: 'Test Sponsor',
        role: 'sponsor',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('redirects to /portal/login with redirect param on no session', async () => {
      mockGetSession.mockResolvedValue(null);
      const ctx = createMockContext('/portal/dashboard');

      const result = (await onRequest(ctx as any, mockNext)) as Response;

      expect(result.status).toBe(302);
      expect(result.headers.get('Location')).toBe('/portal/login?redirect=%2Fportal%2Fdashboard');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('redirects non-whitelisted email accessing /portal/* to /portal/denied and destroys session', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '2', email: 'random@test.com', name: 'Random User', role: 'student' },
        session: { id: 's2', token: 'tok2' },
      });
      mockCheckSponsorWhitelist.mockResolvedValue(false);
      const ctx = createMockContext('/portal/index', { headers: { cookie: sessionCookie } });

      const result = (await onRequest(ctx as any, mockNext)) as Response;

      expect(result.status).toBe(302);
      expect(result.headers.get('Location')).toBe('/portal/denied');
      expect(result.headers.get('Set-Cookie')).toContain('better-auth.session_token=;');
      expect(result.headers.get('Set-Cookie')).toContain('Max-Age=0');
      expect(mockCheckSponsorWhitelist).toHaveBeenCalledWith('random@test.com');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('clears KV cache on denied redirect', async () => {
      mockEnv.SESSION_CACHE = { get: mockKvGet, put: mockKvPut, delete: mockKvDelete };
      mockKvGet.mockResolvedValue(null);
      mockGetSession.mockResolvedValue({
        user: { id: '2', email: 'random@test.com', name: 'Random User', role: 'student' },
        session: { id: 's2', token: 'tok2' },
      });
      mockCheckSponsorWhitelist.mockResolvedValue(false);
      const ctx = createMockContext('/portal/index', { headers: { cookie: sessionCookie } });

      await onRequest(ctx as any, mockNext);

      expect(mockKvDelete).toHaveBeenCalledWith('sponsor-token-123');
    });

    it('escalates role to sponsor when Sanity whitelist matches', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '3', email: 'new-sponsor@company.com', name: 'New Sponsor', role: 'student' },
        session: { id: 's3', token: 'tok3' },
      });
      mockCheckSponsorWhitelist.mockResolvedValue(true);
      const ctx = createMockContext('/portal/index', { headers: { cookie: sessionCookie } });

      await onRequest(ctx as any, mockNext);

      expect(ctx.locals.user).toEqual({
        email: 'new-sponsor@company.com',
        name: 'New Sponsor',
        role: 'sponsor',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('persists escalated role to D1 on whitelist match', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '3', email: 'new-sponsor@company.com', name: 'New Sponsor', role: 'student' },
        session: { id: 's3', token: 'tok3' },
      });
      mockCheckSponsorWhitelist.mockResolvedValue(true);
      const ctx = createMockContext('/portal/index', { headers: { cookie: sessionCookie } });

      await onRequest(ctx as any, mockNext);

      expect(mockD1Prepare).toHaveBeenCalledWith('UPDATE user SET role = ? WHERE LOWER(email) = ?');
      expect(mockD1Bind).toHaveBeenCalledWith('sponsor', 'new-sponsor@company.com');
      expect(mockD1Run).toHaveBeenCalled();
    });

    it('continues when D1 role update fails (fire-and-forget)', async () => {
      mockD1Run.mockRejectedValue(new Error('D1 write failed'));
      mockGetSession.mockResolvedValue({
        user: { id: '3', email: 'new-sponsor@company.com', name: 'New Sponsor', role: 'student' },
        session: { id: 's3', token: 'tok3' },
      });
      mockCheckSponsorWhitelist.mockResolvedValue(true);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const ctx = createMockContext('/portal/index', { headers: { cookie: sessionCookie } });

      await onRequest(ctx as any, mockNext);

      // Should still proceed — D1 update is fire-and-forget
      expect(ctx.locals.user?.role).toBe('sponsor');
      expect(mockNext).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('sponsor session in KV cache → cache hit works', async () => {
      mockEnv.SESSION_CACHE = { get: mockKvGet, put: mockKvPut, delete: mockKvDelete };
      mockKvGet.mockResolvedValue({ email: 'cached-sponsor@co.com', name: 'Cached Sponsor', role: 'sponsor' });
      const ctx = createMockContext('/portal/dashboard', { headers: { cookie: sessionCookie } });

      await onRequest(ctx as any, mockNext);

      expect(mockKvGet).toHaveBeenCalledWith('sponsor-token-123', { type: 'json' });
      expect(ctx.locals.user).toEqual({ email: 'cached-sponsor@co.com', name: 'Cached Sponsor', role: 'sponsor' });
      expect(mockGetSession).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('routes /portal/api/me through portal auth (not public)', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'sponsor@test.com', name: 'Sponsor', role: 'sponsor' },
        session: { id: 's1' },
      });
      const ctx = createMockContext('/portal/api/me', { headers: { cookie: sessionCookie } });

      await onRequest(ctx as any, mockNext);

      expect(ctx.locals.user).toEqual({ email: 'sponsor@test.com', name: 'Sponsor', role: 'sponsor' });
    });
  });

  describe('Student routes — Better Auth session', () => {
    const studentCookie = 'better-auth.session_token=student-tok-456; Path=/';

    it('sets role "student" and name on valid session', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'student@test.com', name: 'Test Student', role: 'student' },
        session: { id: 's1', token: 'tok' },
      });
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: studentCookie } });

      await onRequest(ctx as any, mockNext);

      expect(ctx.locals.user).toEqual({
        email: 'student@test.com',
        name: 'Test Student',
        role: 'student',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('redirects to /auth/login with redirect param on no session', async () => {
      mockGetSession.mockResolvedValue(null);
      const ctx = createMockContext('/student/dashboard');

      const result = (await onRequest(ctx as any, mockNext)) as Response;

      expect(result.status).toBe(302);
      expect(result.headers.get('Location')).toBe('/auth/login?redirect=%2Fstudent%2Fdashboard');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('returns 403 when sponsor accesses /student/* route', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'sponsor@test.com', name: 'Sponsor', role: 'sponsor' },
        session: { id: 's1', token: 'tok' },
      });
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: studentCookie } });

      const result = (await onRequest(ctx as any, mockNext)) as Response;

      expect(result.status).toBe(403);
      const text = await result.text();
      expect(text).toBe('Forbidden');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('returns 503 on D1/auth Error exception', async () => {
      mockGetSession.mockRejectedValue(new Error('D1_ERROR: database unavailable'));
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: studentCookie } });

      const result = (await onRequest(ctx as any, mockNext)) as Response;

      expect(result.status).toBe(503);
      const text = await result.text();
      expect(text).toBe('Service Unavailable');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('creates auth with correct env vars', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'student@test.com', name: 'Student', role: 'student' },
        session: { id: 's1' },
      });
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: studentCookie } });

      await onRequest(ctx as any, mockNext);

      expect(mockCreateAuth).toHaveBeenCalledWith({
        db: { __drizzle: true },
        env: {
          GOOGLE_CLIENT_ID: 'test-google-id',
          GOOGLE_CLIENT_SECRET: 'test-google-secret',
          GITHUB_CLIENT_ID: 'test-github-id',
          GITHUB_CLIENT_SECRET: 'test-github-secret',
          BETTER_AUTH_SECRET: 'test-auth-secret',
          BETTER_AUTH_URL: 'http://localhost:4321',
          RESEND_API_KEY: 'test-resend-key',
        },
        requestOrigin: 'http://localhost:4321',
      });
    });
  });

  describe('Runtime env guard', () => {
    // Adapter v13 reads bindings from `cloudflare:workers` directly, so the
    // pre-migration `locals.runtime.env === undefined` guard no longer
    // applies — the equivalent failure mode now is "PORTAL_DB binding is
    // missing", which throws during auth and falls through to the 503 catch.
    it('returns 503 when PORTAL_DB binding is missing', async () => {
      const originalDb = mockEnv.PORTAL_DB;
      mockEnv.PORTAL_DB = undefined;
      mockGetSession.mockRejectedValue(new Error('PORTAL_DB binding missing'));
      try {
        const ctx = createMockContext('/portal/index', {
          headers: { cookie: 'better-auth.session_token=tok; Path=/' },
        });

        const result = (await onRequest(ctx as any, mockNext)) as Response;

        expect(result.status).toBe(503);
        expect(mockNext).not.toHaveBeenCalled();
      } finally {
        mockEnv.PORTAL_DB = originalDb;
      }
    });
  });

  describe('Cookie extraction — __Secure- prefix', () => {
    it('extracts session token from __Secure- prefixed cookie', async () => {
      const secureCookie = '__Secure-better-auth.session_token=secure-tok-789; Path=/';
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'student@test.com', name: 'Student', role: 'student' },
        session: { id: 's1' },
      });
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: secureCookie } });

      await onRequest(ctx as any, mockNext);

      expect(ctx.locals.user).toEqual({ email: 'student@test.com', name: 'Student', role: 'student' });
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Dev mode bypass', () => {
    it('sets role "sponsor" with dev email and name for portal routes', async () => {
      import.meta.env.DEV = true;
      const ctx = createMockContext('/portal/index');

      await onRequest(ctx as any, mockNext);

      expect(ctx.locals.user).toEqual({ email: 'dev@example.com', name: 'Dev Sponsor', role: 'sponsor' });
      expect(mockGetSession).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('sets role "student" with dev name for student routes', async () => {
      import.meta.env.DEV = true;
      const ctx = createMockContext('/student/dashboard');

      await onRequest(ctx as any, mockNext);

      expect(ctx.locals.user).toEqual({
        email: 'dev-student@example.com',
        name: 'Dev Student',
        role: 'student',
      });
      expect(mockGetSession).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('does not set user on public routes even in dev mode', async () => {
      import.meta.env.DEV = true;
      const ctx = createMockContext('/about');

      await onRequest(ctx as any, mockNext);

      expect(ctx.locals.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('KV session cache', () => {
    const sessionCookie = 'better-auth.session_token=test-token-123; Path=/';

    beforeEach(() => {
      mockEnv.SESSION_CACHE = { get: mockKvGet, put: mockKvPut, delete: mockKvDelete };
    });

    it('uses cached session from KV on cache hit (student)', async () => {
      mockKvGet.mockResolvedValue({ email: 'cached@test.com', name: 'Cached Student', role: 'student' });
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: sessionCookie } });

      await onRequest(ctx as any, mockNext);

      expect(mockKvGet).toHaveBeenCalledWith('test-token-123', { type: 'json' });
      expect(ctx.locals.user).toEqual({ email: 'cached@test.com', name: 'Cached Student', role: 'student' });
      expect(mockGetSession).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('falls through to D1 on KV cache miss and caches result with role', async () => {
      mockKvGet.mockResolvedValue(null);
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'student@test.com', name: 'Test Student', role: 'student' },
        session: { id: 's1' },
      });
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: sessionCookie } });

      await onRequest(ctx as any, mockNext);

      expect(mockKvGet).toHaveBeenCalledWith('test-token-123', { type: 'json' });
      expect(mockGetSession).toHaveBeenCalled();
      expect(mockKvPut).toHaveBeenCalledWith(
        'test-token-123',
        JSON.stringify({ email: 'student@test.com', name: 'Test Student', role: 'student' }),
        { expirationTtl: 300 },
      );
      expect(ctx.locals.user).toEqual({ email: 'student@test.com', name: 'Test Student', role: 'student' });
    });

    it('skips KV when no session cookie is present', async () => {
      mockGetSession.mockResolvedValue(null);
      const ctx = createMockContext('/student/dashboard');

      await onRequest(ctx as any, mockNext);

      expect(mockKvGet).not.toHaveBeenCalled();
      expect(mockKvPut).not.toHaveBeenCalled();
    });

    it('does not write KV on redirect (no session)', async () => {
      mockKvGet.mockResolvedValue(null);
      mockGetSession.mockResolvedValue(null);
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: sessionCookie } });

      const result = (await onRequest(ctx as any, mockNext)) as Response;

      expect(result.status).toBe(302);
      expect(mockKvPut).not.toHaveBeenCalled();
    });

    it('returns 503 when KV get() throws (KV outage)', async () => {
      mockKvGet.mockRejectedValue(new Error('KV unavailable'));
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: sessionCookie } });

      const result = (await onRequest(ctx as any, mockNext)) as Response;

      expect(result.status).toBe(503);
      const text = await result.text();
      expect(text).toBe('Service Unavailable');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('works without KV configured (SESSION_CACHE undefined)', async () => {
      mockEnv.SESSION_CACHE = undefined;
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'student@test.com', name: 'Test Student', role: 'student' },
        session: { id: 's1' },
      });
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: sessionCookie } });

      await onRequest(ctx as any, mockNext);

      expect(mockKvGet).not.toHaveBeenCalled();
      expect(mockKvPut).not.toHaveBeenCalled();
      expect(ctx.locals.user).toEqual({ email: 'student@test.com', name: 'Test Student', role: 'student' });
    });
  });

  describe('Rate limiting — Durable Object', () => {
    beforeEach(() => {
      mockEnv.RATE_LIMITER = createMockRateLimiter();
      mockCheckLimit.mockResolvedValue({ allowed: true, remaining: 99, retryAfterMs: 0 });
    });

    it('returns 429 with Retry-After when rate limit exceeded', async () => {
      mockCheckLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfterMs: 30_000 });
      const ctx = createMockContext('/portal/index', {
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      const result = (await onRequest(ctx as any, mockNext)) as Response;

      expect(result.status).toBe(429);
      expect(result.headers.get('Retry-After')).toBe('30');
      expect(result.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(result.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('passes through to auth when rate limit OK', async () => {
      mockCheckLimit.mockResolvedValue({ allowed: true, remaining: 95, retryAfterMs: 0 });
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'sponsor@test.com', name: 'Sponsor', role: 'sponsor' },
        session: { id: 's1' },
      });
      const ctx = createMockContext('/portal/index', {
        headers: { 'CF-Connecting-IP': '1.2.3.4', cookie: 'better-auth.session_token=tok123' },
      });

      await onRequest(ctx as any, mockNext);

      expect(mockCheckLimit).toHaveBeenCalledWith(60_000, 100);
      expect(mockNext).toHaveBeenCalled();
    });

    it('fails open when DO throws an error', async () => {
      mockCheckLimit.mockRejectedValue(new Error('DO unavailable'));
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'sponsor@test.com', name: 'Sponsor', role: 'sponsor' },
        session: { id: 's1' },
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const ctx = createMockContext('/portal/index', {
        headers: { 'CF-Connecting-IP': '1.2.3.4', cookie: 'better-auth.session_token=tok123' },
      });

      await onRequest(ctx as any, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[middleware] Rate limiter error, failing open:',
        expect.any(Error),
      );
      expect(mockNext).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('uses "unknown" fallback key when CF-Connecting-IP header is missing', async () => {
      mockCheckLimit.mockResolvedValue({ allowed: true, remaining: 99, retryAfterMs: 0 });
      mockGetSession.mockResolvedValue(null);
      const ctx = createMockContext('/portal/index');

      await onRequest(ctx as any, mockNext);

      expect(mockEnv.RATE_LIMITER.idFromName).toHaveBeenCalledWith('ip:unknown');
    });

    it('rate limits student routes too', async () => {
      mockCheckLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfterMs: 5_000 });
      const ctx = createMockContext('/student/dashboard', {
        headers: { 'CF-Connecting-IP': '5.6.7.8' },
      });

      const result = (await onRequest(ctx as any, mockNext)) as Response;

      expect(result.status).toBe(429);
      expect(result.headers.get('Retry-After')).toBe('5');
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockGetSession).not.toHaveBeenCalled();
    });

    it('skips rate limiting in dev mode', async () => {
      import.meta.env.DEV = true;
      const ctx = createMockContext('/portal/index', {
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      await onRequest(ctx as any, mockNext);

      expect(mockCheckLimit).not.toHaveBeenCalled();
      expect(ctx.locals.user).toEqual({ email: 'dev@example.com', name: 'Dev Sponsor', role: 'sponsor' });
      expect(mockNext).toHaveBeenCalled();
    });

    it('skips rate limiting when RATE_LIMITER binding is not configured', async () => {
      mockEnv.RATE_LIMITER = undefined;
      mockGetSession.mockResolvedValue(null);
      const ctx = createMockContext('/portal/index', {
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      await onRequest(ctx as any, mockNext);

      expect(mockCheckLimit).not.toHaveBeenCalled();
    });

    it('does not rate limit public routes', async () => {
      const ctx = createMockContext('/about', {
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      await onRequest(ctx as any, mockNext);

      expect(mockCheckLimit).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('rounds Retry-After up to nearest second', async () => {
      mockCheckLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfterMs: 1_500 });
      const ctx = createMockContext('/portal/index', {
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      const result = (await onRequest(ctx as any, mockNext)) as Response;

      expect(result.status).toBe(429);
      expect(result.headers.get('Retry-After')).toBe('2');
    });
  });
});

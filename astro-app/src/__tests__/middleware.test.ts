import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// astro:middleware is a virtual module — defineMiddleware is an identity function
vi.mock('astro:middleware', () => ({
  defineMiddleware: (fn: any) => fn,
}));

const { mockValidateAccessJWT, mockGetDrizzle, mockCreateAuth, mockGetSession } = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockValidateAccessJWT = vi.fn();
  const mockGetDrizzle = vi.fn().mockReturnValue({ __drizzle: true });
  const mockCreateAuth = vi.fn().mockReturnValue({ api: { getSession: mockGetSession } });
  return { mockValidateAccessJWT, mockGetDrizzle, mockCreateAuth, mockGetSession };
});

vi.mock('@/lib/auth', () => ({ validateAccessJWT: mockValidateAccessJWT }));
vi.mock('@/lib/db', () => ({ getDrizzle: mockGetDrizzle }));
vi.mock('@/lib/student-auth', () => ({ createAuth: mockCreateAuth }));

import { onRequest } from '../middleware';

const mockKvGet = vi.fn();
const mockKvPut = vi.fn().mockResolvedValue(undefined);
const mockCheckLimit = vi.fn();

const mockEnv = {
  CF_ACCESS_TEAM_DOMAIN: 'https://test.cloudflareaccess.com',
  CF_ACCESS_AUD: 'test-aud',
  PORTAL_DB: {},
  GOOGLE_CLIENT_ID: 'test-google-id',
  GOOGLE_CLIENT_SECRET: 'test-google-secret',
  BETTER_AUTH_SECRET: 'test-auth-secret',
  BETTER_AUTH_URL: 'http://localhost:4321',
  SESSION_CACHE: undefined as any,
  RATE_LIMITER: undefined as any,
};

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
    locals: { runtime: { env: mockEnv }, ...options?.overrides } as unknown as App.Locals,
    redirect: vi.fn((url: string) => new Response(null, { status: 302, headers: { Location: url } })),
  };
}

const mockNext = vi.fn(() => new Response('ok', { status: 200 }));

describe('middleware — three-branch routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.DEV = false;
    mockEnv.SESSION_CACHE = undefined;
    mockEnv.RATE_LIMITER = undefined;
    mockGetDrizzle.mockReturnValue({ __drizzle: true });
    mockCreateAuth.mockReturnValue({ api: { getSession: mockGetSession } });
    mockKvGet.mockReset();
    mockKvPut.mockReset().mockResolvedValue(undefined);
    mockCheckLimit.mockReset();
  });

  afterEach(() => {
    import.meta.env.DEV = false;
  });

  describe('Branch 1: Public routes', () => {
    it('calls next() without auth for public route /about', async () => {
      const ctx = createMockContext('/about');
      await onRequest(ctx as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockValidateAccessJWT).not.toHaveBeenCalled();
      expect(mockGetSession).not.toHaveBeenCalled();
      expect(ctx.locals.user).toBeUndefined();
    });

    it('passes through /api/auth/callback without intercepting', async () => {
      const ctx = createMockContext('/api/auth/callback');
      await onRequest(ctx as any, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockValidateAccessJWT).not.toHaveBeenCalled();
      expect(mockGetSession).not.toHaveBeenCalled();
      expect(ctx.locals.user).toBeUndefined();
    });
  });

  describe('Branch 2: Portal routes — CF Access JWT', () => {
    it('sets role "sponsor" on successful JWT validation for /portal/index', async () => {
      mockValidateAccessJWT.mockResolvedValue({ email: 'sponsor@test.com' });
      const ctx = createMockContext('/portal/index');

      await onRequest(ctx as any, mockNext);

      expect(mockValidateAccessJWT).toHaveBeenCalledWith(ctx.request, mockEnv);
      expect(ctx.locals.user).toEqual({ email: 'sponsor@test.com', role: 'sponsor' });
      expect(mockNext).toHaveBeenCalled();
    });

    it('routes /portal/api/me through portal branch (not public)', async () => {
      mockValidateAccessJWT.mockResolvedValue({ email: 'sponsor@test.com' });
      const ctx = createMockContext('/portal/api/me');

      await onRequest(ctx as any, mockNext);

      expect(mockValidateAccessJWT).toHaveBeenCalled();
      expect(ctx.locals.user).toEqual({ email: 'sponsor@test.com', role: 'sponsor' });
    });

    it('returns 401 on failed JWT validation', async () => {
      mockValidateAccessJWT.mockResolvedValue(null);
      const ctx = createMockContext('/portal/index');

      const result = await onRequest(ctx as any, mockNext);

      expect(result.status).toBe(401);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('Branch 3: Student routes — Better Auth session', () => {
    it('sets role "student" and name on valid session', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'student@test.com', name: 'Test Student' },
        session: { id: 's1', token: 'tok' },
      });
      const ctx = createMockContext('/student/dashboard');

      await onRequest(ctx as any, mockNext);

      expect(ctx.locals.user).toEqual({
        email: 'student@test.com',
        name: 'Test Student',
        role: 'student',
      });
      expect(mockNext).toHaveBeenCalled();
    });

    it('redirects to sign-in on no session', async () => {
      mockGetSession.mockResolvedValue(null);
      const ctx = createMockContext('/student/dashboard');

      const result = await onRequest(ctx as any, mockNext);

      expect(result.status).toBe(302);
      expect(result.headers.get('Location')).toBe('/auth/student-login');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('returns 503 on D1/auth Error exception', async () => {
      mockGetSession.mockRejectedValue(new Error('D1_ERROR: database unavailable'));
      const ctx = createMockContext('/student/dashboard');

      const result = await onRequest(ctx as any, mockNext);

      expect(result.status).toBe(503);
      const text = await result.text();
      expect(text).toBe('Service Unavailable');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('returns 503 on non-Error exception (string thrown)', async () => {
      mockGetSession.mockRejectedValue('unexpected string error');
      const ctx = createMockContext('/student/dashboard');

      const result = await onRequest(ctx as any, mockNext);

      expect(result.status).toBe(503);
      const text = await result.text();
      expect(text).toBe('Service Unavailable');
    });

    it('creates auth with correct env vars', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'student@test.com', name: 'Student' },
        session: { id: 's1' },
      });
      const ctx = createMockContext('/student/dashboard');

      await onRequest(ctx as any, mockNext);

      expect(mockCreateAuth).toHaveBeenCalledWith({
        db: { __drizzle: true },
        env: {
          GOOGLE_CLIENT_ID: 'test-google-id',
          GOOGLE_CLIENT_SECRET: 'test-google-secret',
          BETTER_AUTH_SECRET: 'test-auth-secret',
          BETTER_AUTH_URL: 'http://localhost:4321',
        },
        requestOrigin: 'http://localhost:4321',
      });
    });
  });

  describe('Dev mode bypass', () => {
    it('sets role "sponsor" with dev email for portal routes', async () => {
      import.meta.env.DEV = true;
      const ctx = createMockContext('/portal/index');

      await onRequest(ctx as any, mockNext);

      expect(ctx.locals.user).toEqual({ email: 'dev@example.com', role: 'sponsor' });
      expect(mockValidateAccessJWT).not.toHaveBeenCalled();
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
      mockEnv.SESSION_CACHE = { get: mockKvGet, put: mockKvPut };
    });

    it('uses cached session from KV on cache hit', async () => {
      mockKvGet.mockResolvedValue({ email: 'cached@test.com', name: 'Cached Student' });
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: sessionCookie } });

      await onRequest(ctx as any, mockNext);

      expect(mockKvGet).toHaveBeenCalledWith('test-token-123', { type: 'json' });
      expect(ctx.locals.user).toEqual({ email: 'cached@test.com', name: 'Cached Student', role: 'student' });
      expect(mockGetSession).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('falls through to D1 on KV cache miss and caches result', async () => {
      mockKvGet.mockResolvedValue(null);
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'student@test.com', name: 'Test Student' },
        session: { id: 's1' },
      });
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: sessionCookie } });

      await onRequest(ctx as any, mockNext);

      expect(mockKvGet).toHaveBeenCalledWith('test-token-123', { type: 'json' });
      expect(mockGetSession).toHaveBeenCalled();
      expect(mockKvPut).toHaveBeenCalledWith(
        'test-token-123',
        JSON.stringify({ email: 'student@test.com', name: 'Test Student' }),
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

      const result = await onRequest(ctx as any, mockNext);

      expect(result.status).toBe(302);
      expect(mockKvPut).not.toHaveBeenCalled();
    });

    it('returns 503 when KV get() throws (KV outage)', async () => {
      mockKvGet.mockRejectedValue(new Error('KV unavailable'));
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: sessionCookie } });

      const result = await onRequest(ctx as any, mockNext);

      expect(result.status).toBe(503);
      const text = await result.text();
      expect(text).toBe('Service Unavailable');
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('skips KV when cookie has no session token key', async () => {
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'student@test.com', name: 'Test Student' },
        session: { id: 's1' },
      });
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: 'other_cookie=abc; foo=bar' } });

      await onRequest(ctx as any, mockNext);

      expect(mockKvGet).not.toHaveBeenCalled();
      expect(mockGetSession).toHaveBeenCalled();
      expect(ctx.locals.user).toEqual({ email: 'student@test.com', name: 'Test Student', role: 'student' });
    });

    it('extracts session token when it appears after other cookies', async () => {
      mockKvGet.mockResolvedValue({ email: 'cached@test.com', name: 'Cached' });
      const multiCookie = 'theme=dark; lang=en; better-auth.session_token=multi-token-456; other=val';
      const ctx = createMockContext('/student/dashboard', { headers: { cookie: multiCookie } });

      await onRequest(ctx as any, mockNext);

      expect(mockKvGet).toHaveBeenCalledWith('multi-token-456', { type: 'json' });
      expect(ctx.locals.user).toEqual({ email: 'cached@test.com', name: 'Cached', role: 'student' });
    });

    it('works without KV configured (SESSION_CACHE undefined)', async () => {
      mockEnv.SESSION_CACHE = undefined;
      mockGetSession.mockResolvedValue({
        user: { id: '1', email: 'student@test.com', name: 'Test Student' },
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

    it('returns 429 with Retry-After and X-RateLimit-Remaining headers when rate limit exceeded', async () => {
      mockCheckLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfterMs: 30_000 });
      const ctx = createMockContext('/portal/index', {
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      const result = await onRequest(ctx as any, mockNext);

      expect(result.status).toBe(429);
      expect(result.headers.get('Retry-After')).toBe('30');
      expect(result.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(result.headers.get('X-RateLimit-Limit')).toBe('100');
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockValidateAccessJWT).not.toHaveBeenCalled();
    });

    it('passes through to auth when rate limit OK', async () => {
      mockCheckLimit.mockResolvedValue({ allowed: true, remaining: 95, retryAfterMs: 0 });
      mockValidateAccessJWT.mockResolvedValue({ email: 'sponsor@test.com' });
      const ctx = createMockContext('/portal/index', {
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      await onRequest(ctx as any, mockNext);

      expect(mockCheckLimit).toHaveBeenCalledWith(60_000, 100);
      expect(mockValidateAccessJWT).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });

    it('fails open when DO throws an error (DO outage)', async () => {
      mockCheckLimit.mockRejectedValue(new Error('DO unavailable'));
      mockValidateAccessJWT.mockResolvedValue({ email: 'sponsor@test.com' });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const ctx = createMockContext('/portal/index', {
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      await onRequest(ctx as any, mockNext);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[middleware] Rate limiter error, failing open:',
        expect.any(Error),
      );
      expect(mockValidateAccessJWT).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('uses "unknown" fallback key when CF-Connecting-IP header is missing', async () => {
      mockCheckLimit.mockResolvedValue({ allowed: true, remaining: 99, retryAfterMs: 0 });
      mockValidateAccessJWT.mockResolvedValue({ email: 'sponsor@test.com' });
      const ctx = createMockContext('/portal/index');

      await onRequest(ctx as any, mockNext);

      expect(mockEnv.RATE_LIMITER.idFromName).toHaveBeenCalledWith('ip:unknown');
      expect(mockNext).toHaveBeenCalled();
    });

    it('derives DO name from CF-Connecting-IP header', async () => {
      mockCheckLimit.mockResolvedValue({ allowed: true, remaining: 99, retryAfterMs: 0 });
      mockValidateAccessJWT.mockResolvedValue({ email: 'sponsor@test.com' });
      const ctx = createMockContext('/portal/index', {
        headers: { 'CF-Connecting-IP': '10.20.30.40' },
      });

      await onRequest(ctx as any, mockNext);

      expect(mockEnv.RATE_LIMITER.idFromName).toHaveBeenCalledWith('ip:10.20.30.40');
    });

    it('rate limits student routes too', async () => {
      mockCheckLimit.mockResolvedValue({ allowed: false, remaining: 0, retryAfterMs: 5_000 });
      const ctx = createMockContext('/student/dashboard', {
        headers: { 'CF-Connecting-IP': '5.6.7.8' },
      });

      const result = await onRequest(ctx as any, mockNext);

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
      expect(ctx.locals.user).toEqual({ email: 'dev@example.com', role: 'sponsor' });
      expect(mockNext).toHaveBeenCalled();
    });

    it('skips rate limiting when RATE_LIMITER binding is not configured', async () => {
      mockEnv.RATE_LIMITER = undefined;
      mockValidateAccessJWT.mockResolvedValue({ email: 'sponsor@test.com' });
      const ctx = createMockContext('/portal/index', {
        headers: { 'CF-Connecting-IP': '1.2.3.4' },
      });

      await onRequest(ctx as any, mockNext);

      expect(mockCheckLimit).not.toHaveBeenCalled();
      expect(mockValidateAccessJWT).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
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

      const result = await onRequest(ctx as any, mockNext);

      expect(result.status).toBe(429);
      expect(result.headers.get('Retry-After')).toBe('2');
    });
  });
});

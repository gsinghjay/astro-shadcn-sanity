import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('astro:middleware', () => ({
  defineMiddleware: (fn: unknown) => fn,
}));

const {
  mockGetDrizzle,
  mockCreateAuth,
  mockGetSession,
  mockCheckSponsorWhitelist,
  mockKvGet,
  mockKvPut,
  mockKvDelete,
  mockD1Run,
  mockD1First,
  mockD1Bind,
  mockD1Prepare,
  mockEnv,
  mockGetRev,
} = vi.hoisted(() => {
  const mockGetSession = vi.fn();
  const mockGetDrizzle = vi.fn().mockReturnValue({ __drizzle: true });
  const mockCreateAuth = vi.fn().mockReturnValue({ api: { getSession: mockGetSession } });
  const mockCheckSponsorWhitelist = vi.fn().mockResolvedValue(false);
  const mockKvGet = vi.fn();
  const mockKvPut = vi.fn().mockResolvedValue(undefined);
  const mockKvDelete = vi.fn().mockResolvedValue(undefined);
  const mockD1Run = vi.fn().mockResolvedValue({});
  const mockD1First = vi.fn().mockResolvedValue({ agreement_accepted_at: null, agreement_version: null });
  const mockD1Bind = vi.fn().mockReturnValue({ run: mockD1Run, first: mockD1First });
  const mockD1Prepare = vi.fn().mockReturnValue({ bind: mockD1Bind });
  const mockGetRev = vi.fn();
  // Adapter v13 reads bindings via `import { env } from "cloudflare:workers"`,
  // not `locals.runtime.env`. This object is the single source of truth: the
  // mocked module returns it AND tests mutate it through beforeEach.
  const mockEnv: Record<string, unknown> = {
    PORTAL_DB: { prepare: mockD1Prepare },
    GOOGLE_CLIENT_ID: 'g',
    GOOGLE_CLIENT_SECRET: 'gs',
    GITHUB_CLIENT_ID: 'gh',
    GITHUB_CLIENT_SECRET: 'ghs',
    BETTER_AUTH_SECRET: 'sec',
    BETTER_AUTH_URL: 'http://localhost:4321',
    RESEND_API_KEY: 'rs',
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
    mockD1Run,
    mockD1First,
    mockD1Bind,
    mockD1Prepare,
    mockEnv,
    mockGetRev,
  };
});

vi.mock('@/lib/db', () => ({ getDrizzle: mockGetDrizzle }));
vi.mock('@/lib/auth-config', () => ({
  createAuth: mockCreateAuth,
  checkSponsorWhitelist: mockCheckSponsorWhitelist,
}));
vi.mock('cloudflare:workers', () => ({ env: mockEnv }));
vi.mock('@/lib/sanity', () => ({ getSponsorAgreementRev: mockGetRev }));

import { onRequest, _resetAgreementRevCache } from '../middleware';

const CURRENT_REV = 'rev-current-xyz';

function createMockContext(pathname: string, headers?: Record<string, string>) {
  return {
    url: new URL(`http://localhost:4321${pathname}`),
    request: new Request(`http://localhost:4321${pathname}`, { headers }),
    locals: {} as unknown as App.Locals,
    redirect: vi.fn((url: string) => new Response(null, { status: 302, headers: { Location: url } })),
  };
}

const mockNext = vi.fn(async () => new Response('ok', { status: 200 }));
const sessionCookie = 'better-auth.session_token=tok; Path=/';

describe('middleware — sponsor agreement gate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _resetAgreementRevCache();
    import.meta.env.DEV = false;
    mockEnv.SESSION_CACHE = undefined;
    mockEnv.RATE_LIMITER = undefined;
    mockKvGet.mockReset();
    mockKvPut.mockReset().mockResolvedValue(undefined);
    mockKvDelete.mockReset().mockResolvedValue(undefined);
    mockD1Run.mockReset().mockResolvedValue({});
    mockD1First.mockReset().mockResolvedValue({ agreement_accepted_at: null, agreement_version: null });
    mockD1Bind.mockReset().mockReturnValue({ run: mockD1Run, first: mockD1First });
    mockD1Prepare.mockReset().mockReturnValue({ bind: mockD1Bind });
    mockCheckSponsorWhitelist.mockReset().mockResolvedValue(false);
    mockGetRev.mockReset().mockResolvedValue(CURRENT_REV);
  });

  afterEach(() => {
    import.meta.env.DEV = false;
    _resetAgreementRevCache();
  });

  it('sponsor with NULL acceptance sets requiresAgreement=true on gated portal route', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 's@co.com', name: 'Sponsor', role: 'sponsor' },
      session: { id: 's1', token: 'tok' },
    });
    mockD1First.mockResolvedValueOnce({ agreement_accepted_at: null, agreement_version: null });

    const ctx = createMockContext('/portal/', { cookie: sessionCookie });
    await onRequest(ctx as never, mockNext);

    expect(ctx.locals.user?.role).toBe('sponsor');
    expect(ctx.locals.requiresAgreement).toBe(true);
    expect(mockD1Prepare).toHaveBeenCalledWith(
      'SELECT agreement_accepted_at, agreement_version FROM user WHERE LOWER(email) = ?',
    );
    expect(mockD1Bind).toHaveBeenCalledWith('s@co.com');
  });

  it('sponsor with matching version sets requiresAgreement=false (no prompt)', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 's@co.com', name: 'Sponsor', role: 'sponsor' },
      session: { id: 's1', token: 'tok' },
    });
    mockD1First.mockResolvedValueOnce({ agreement_accepted_at: 1234567890, agreement_version: CURRENT_REV });

    const ctx = createMockContext('/portal/', { cookie: sessionCookie });
    await onRequest(ctx as never, mockNext);

    expect(ctx.locals.requiresAgreement).toBe(false);
  });

  it('sponsor with mismatched version sets requiresAgreement=true (drift re-prompt)', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 's@co.com', name: 'Sponsor', role: 'sponsor' },
      session: { id: 's1', token: 'tok' },
    });
    mockD1First.mockResolvedValueOnce({
      agreement_accepted_at: 1234567890,
      agreement_version: 'rev-stale-old',
    });

    const ctx = createMockContext('/portal/', { cookie: sessionCookie });
    await onRequest(ctx as never, mockNext);

    expect(ctx.locals.requiresAgreement).toBe(true);
  });

  it('grandfathered sponsor (acceptedAt set, version NULL) is treated as drift → prompt', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 's@co.com', name: 'Sponsor', role: 'sponsor' },
      session: { id: 's1', token: 'tok' },
    });
    mockD1First.mockResolvedValueOnce({
      agreement_accepted_at: 1234567890,
      agreement_version: null,
    });

    const ctx = createMockContext('/portal/', { cookie: sessionCookie });
    await onRequest(ctx as never, mockNext);

    expect(ctx.locals.requiresAgreement).toBe(true);
  });

  it('Sanity rev fetch failure fails open — accepted sponsor with NULL rev does NOT re-prompt', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 's@co.com', name: 'Sponsor', role: 'sponsor' },
      session: { id: 's1', token: 'tok' },
    });
    mockD1First.mockResolvedValueOnce({
      agreement_accepted_at: 1234567890,
      agreement_version: 'rev-pinned',
    });
    mockGetRev.mockResolvedValueOnce(null);

    const ctx = createMockContext('/portal/', { cookie: sessionCookie });
    await onRequest(ctx as never, mockNext);

    expect(ctx.locals.requiresAgreement).toBe(false);
  });

  it('student role does NOT trigger gate — flag is false', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'stu@co.com', name: 'Student', role: 'student' },
      session: { id: 's2', token: 'tok' },
    });

    const ctx = createMockContext('/student/', { cookie: sessionCookie });
    await onRequest(ctx as never, mockNext);

    expect(ctx.locals.requiresAgreement).toBe(false);
    expect(mockD1Prepare).not.toHaveBeenCalledWith(
      'SELECT agreement_accepted_at, agreement_version FROM user WHERE LOWER(email) = ?',
    );
  });

  it('public portal path /portal/login does not set the flag', async () => {
    const ctx = createMockContext('/portal/login');
    await onRequest(ctx as never, mockNext);

    expect(ctx.locals.requiresAgreement).toBeUndefined();
  });

  it('agreement accept endpoint runs through middleware (populates locals.user) but skips the gate', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 's@co.com', name: 'Sponsor', role: 'sponsor' },
      session: { id: 's1', token: 'tok' },
    });
    const ctx = createMockContext('/api/portal/agreement/accept', { cookie: sessionCookie });
    await onRequest(ctx as never, mockNext);

    expect(ctx.locals.user?.role).toBe('sponsor');
    expect(ctx.locals.requiresAgreement).toBe(false);
    expect(mockNext).toHaveBeenCalled();
  });

  it('portal API route returns 401 JSON (not redirect) when no session present', async () => {
    mockGetSession.mockResolvedValue(null);
    const ctx = createMockContext('/api/portal/agreement/accept', { cookie: sessionCookie });
    const res = (await onRequest(ctx as never, mockNext)) as Response;
    expect(res.status).toBe(401);
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('portal API route returns 403 JSON (not redirect) when non-sponsor hits it', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '2', email: 'stu@co.com', name: 'Student', role: 'student' },
      session: { id: 's2', token: 'tok' },
    });
    mockCheckSponsorWhitelist.mockResolvedValue(false);
    const ctx = createMockContext('/api/portal/agreement/accept', { cookie: sessionCookie });
    const res = (await onRequest(ctx as never, mockNext)) as Response;
    expect(res.status).toBe(403);
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('dev mode bypass sets requiresAgreement=false without DB lookup', async () => {
    import.meta.env.DEV = true;
    const ctx = createMockContext('/portal/');
    await onRequest(ctx as never, mockNext);

    expect(ctx.locals.user?.role).toBe('sponsor');
    expect(ctx.locals.requiresAgreement).toBe(false);
    expect(mockD1Prepare).not.toHaveBeenCalled();
  });

  it('uses cached agreementVersion + acceptedAt from KV when present (no D1 call)', async () => {
    mockEnv.SESSION_CACHE = { get: mockKvGet, put: mockKvPut, delete: mockKvDelete } as unknown;
    mockKvGet.mockResolvedValue({
      email: 's@co.com',
      name: 'Sponsor',
      role: 'sponsor',
      agreementAcceptedAt: 111,
      agreementVersion: CURRENT_REV,
    });

    const ctx = createMockContext('/portal/', { cookie: sessionCookie });
    await onRequest(ctx as never, mockNext);

    expect(ctx.locals.requiresAgreement).toBe(false);
    expect(mockD1Prepare).not.toHaveBeenCalledWith(
      'SELECT agreement_accepted_at, agreement_version FROM user WHERE LOWER(email) = ?',
    );
  });

  it('KV cache missing the version field triggers D1 lookup and re-caches', async () => {
    mockEnv.SESSION_CACHE = { get: mockKvGet, put: mockKvPut, delete: mockKvDelete } as unknown;
    mockKvGet.mockResolvedValue({
      email: 's@co.com',
      name: 'Sponsor',
      role: 'sponsor',
      agreementAcceptedAt: 111,
      // agreementVersion omitted — simulates pre-story cached session
    });
    mockD1First.mockResolvedValueOnce({ agreement_accepted_at: 111, agreement_version: CURRENT_REV });

    const ctx = createMockContext('/portal/', { cookie: sessionCookie });
    await onRequest(ctx as never, mockNext);

    expect(ctx.locals.requiresAgreement).toBe(false);
    expect(mockD1Prepare).toHaveBeenCalledWith(
      'SELECT agreement_accepted_at, agreement_version FROM user WHERE LOWER(email) = ?',
    );
    expect(mockKvPut).toHaveBeenCalledWith(
      'tok',
      expect.stringContaining(`"agreementVersion":"${CURRENT_REV}"`),
      expect.objectContaining({ expirationTtl: 300 }),
    );
  });

  it('D1 lookup failure fails closed (flag stays true — blocks portal access on outage)', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 's@co.com', name: 'Sponsor', role: 'sponsor' },
      session: { id: 's1', token: 'tok' },
    });
    mockD1First.mockRejectedValueOnce(new Error('D1 down'));
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ctx = createMockContext('/portal/', { cookie: sessionCookie });
    await onRequest(ctx as never, mockNext);

    expect(ctx.locals.requiresAgreement).toBe(true);
    expect(errSpy).toHaveBeenCalled();
    errSpy.mockRestore();
  });

  it('caches Sanity rev across requests (only one fetch within TTL)', async () => {
    mockGetSession.mockResolvedValue({
      user: { id: '1', email: 's@co.com', name: 'Sponsor', role: 'sponsor' },
      session: { id: 's1', token: 'tok' },
    });
    mockD1First.mockResolvedValue({ agreement_accepted_at: 111, agreement_version: CURRENT_REV });

    const ctx1 = createMockContext('/portal/', { cookie: sessionCookie });
    await onRequest(ctx1 as never, mockNext);
    const ctx2 = createMockContext('/portal/', { cookie: sessionCookie });
    await onRequest(ctx2 as never, mockNext);
    const ctx3 = createMockContext('/portal/', { cookie: sessionCookie });
    await onRequest(ctx3 as never, mockNext);

    expect(mockGetRev).toHaveBeenCalledTimes(1);
  });
});

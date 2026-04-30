import { describe, it, expect, vi, beforeEach } from 'vitest';

// Adapter v13: accept.ts reads bindings via `cloudflare:workers`, not
// `locals.runtime.env`. Hoist mocks so the cloudflare:workers stub can wire
// them in before the route module loads. setEnv() rewrites the live env
// object's keys for one test (instead of swapping the object — the import is
// already bound to the original reference).
const {
  mockD1Run,
  mockD1First,
  mockD1Bind,
  mockD1Prepare,
  mockKvGet,
  mockKvPut,
  mockKvDelete,
  mockEnv,
  mockGetRev,
} = vi.hoisted(() => {
  const mockD1Run = vi.fn();
  const mockD1First = vi.fn();
  const mockD1Bind = vi.fn().mockReturnValue({ run: mockD1Run, first: mockD1First });
  const mockD1Prepare = vi.fn().mockReturnValue({ bind: mockD1Bind });
  const mockKvGet = vi.fn();
  const mockKvPut = vi.fn().mockResolvedValue(undefined);
  const mockKvDelete = vi.fn().mockResolvedValue(undefined);
  const mockGetRev = vi.fn();
  const mockEnv: Record<string, unknown> = {
    PORTAL_DB: { prepare: mockD1Prepare },
    SESSION_CACHE: { get: mockKvGet, put: mockKvPut, delete: mockKvDelete },
  };
  return {
    mockD1Run,
    mockD1First,
    mockD1Bind,
    mockD1Prepare,
    mockKvGet,
    mockKvPut,
    mockKvDelete,
    mockEnv,
    mockGetRev,
  };
});

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));
vi.mock('@/lib/sanity', () => ({ getSponsorAgreementRev: mockGetRev }));

const { POST, ALL } = await import('../accept');

function setEnv(next: Record<string, unknown>): void {
  for (const k of Object.keys(mockEnv)) delete mockEnv[k];
  Object.assign(mockEnv, next);
}

function buildEnv(overrides: Partial<{ PORTAL_DB: unknown; SESSION_CACHE: unknown }> = {}) {
  return {
    PORTAL_DB: { prepare: mockD1Prepare },
    SESSION_CACHE: { get: mockKvGet, put: mockKvPut, delete: mockKvDelete },
    ...overrides,
  };
}

function buildCtx(opts: {
  pathname?: string;
  origin?: string;
  requestOrigin?: string | null;
  referer?: string | null;
  user?: { email: string; role: 'sponsor' | 'student' } | null;
  cookie?: string;
  ip?: string | null;
  userAgent?: string | null;
  env?: ReturnType<typeof buildEnv> | null;
  method?: string;
}) {
  const origin = opts.origin ?? 'https://example.com';
  const pathname = opts.pathname ?? '/api/portal/agreement/accept';
  const headers: Record<string, string> = {};
  if (opts.requestOrigin !== null) headers.origin = opts.requestOrigin ?? origin;
  if (opts.referer) headers.referer = opts.referer;
  if (opts.cookie) headers.cookie = opts.cookie;
  if (opts.ip) headers['cf-connecting-ip'] = opts.ip;
  if (opts.userAgent) headers['user-agent'] = opts.userAgent;

  // Adapter v13: env now comes from the cloudflare:workers mock, not locals.
  if (opts.env === null) {
    setEnv({});
  } else if (opts.env !== undefined) {
    setEnv(opts.env);
  } else {
    setEnv(buildEnv());
  }
  return {
    url: new URL(`${origin}${pathname}`),
    request: new Request(`${origin}${pathname}`, {
      method: opts.method ?? 'POST',
      headers,
    }),
    locals: {
      user: opts.user === undefined ? { email: 's@co.com', role: 'sponsor' } : opts.user,
    } as unknown,
  };
}

describe('POST /api/portal/agreement/accept', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockD1Run.mockReset().mockResolvedValue({ meta: { changes: 1 } });
    mockD1First.mockReset().mockResolvedValue({ agreement_accepted_at: null });
    mockD1Bind.mockReset().mockReturnValue({ run: mockD1Run, first: mockD1First });
    mockD1Prepare.mockReset().mockReturnValue({ bind: mockD1Bind });
    mockKvGet.mockReset().mockResolvedValue(null);
    mockKvPut.mockReset().mockResolvedValue(undefined);
    mockKvDelete.mockReset().mockResolvedValue(undefined);
    mockGetRev.mockReset().mockResolvedValue('rev-abc123');
  });

  it('returns 403 when both Origin and Referer are missing', async () => {
    const ctx = buildCtx({ requestOrigin: null });
    const res = await POST(ctx as never);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'forbidden_origin' });
  });

  it('returns 403 when Origin mismatches and no Referer', async () => {
    const ctx = buildCtx({ requestOrigin: 'https://evil.example' });
    const res = await POST(ctx as never);
    expect(res.status).toBe(403);
  });

  it('falls back to Referer header when Origin is absent (Safari/ITP)', async () => {
    const ctx = buildCtx({
      requestOrigin: null,
      referer: 'https://example.com/portal/',
      cookie: 'better-auth.session_token=tok-xyz; Path=/',
    });
    const res = await POST(ctx as never);
    expect(res.status).toBe(200);
  });

  it('returns 401 when no user in locals', async () => {
    const ctx = buildCtx({ user: null });
    const res = await POST(ctx as never);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
  });

  it('returns 403 when user role is not sponsor', async () => {
    const ctx = buildCtx({ user: { email: 'stu@co.com', role: 'student' } });
    const res = await POST(ctx as never);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'forbidden' });
  });

  it('returns 503 when PORTAL_DB binding is missing', async () => {
    const ctx = buildCtx({ env: null });
    const res = await POST(ctx as never);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'service_unavailable' });
  });

  it('returns 404 when user row does not exist (vs. 409 already_accepted)', async () => {
    mockD1First.mockResolvedValue(null);
    const ctx = buildCtx({});
    const res = await POST(ctx as never);
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'user_not_found' });
    expect(mockD1Run).not.toHaveBeenCalled();
  });

  it('returns 409 only when row is accepted AND version matches current Sanity rev', async () => {
    mockD1First.mockResolvedValue({ agreement_accepted_at: 1690000000000, agreement_version: 'rev-abc123' });
    const ctx = buildCtx({});
    const res = await POST(ctx as never);
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'already_accepted' });
    expect(mockD1Run).not.toHaveBeenCalled();
  });

  it('allows re-acceptance (200) when row is accepted but version is NULL (grandfathered drift)', async () => {
    mockD1First.mockResolvedValue({ agreement_accepted_at: 1690000000000, agreement_version: null });
    const ctx = buildCtx({ cookie: 'better-auth.session_token=tok-xyz; Path=/' });
    const res = await POST(ctx as never);
    expect(res.status).toBe(200);
    expect(mockD1Run).toHaveBeenCalledTimes(1);
    expect(mockKvDelete).toHaveBeenCalledWith('tok-xyz');
  });

  it('allows re-acceptance (200) when version is stale (drift against current rev)', async () => {
    mockD1First.mockResolvedValue({ agreement_accepted_at: 1690000000000, agreement_version: 'rev-stale-old' });
    const ctx = buildCtx({});
    const res = await POST(ctx as never);
    expect(res.status).toBe(200);
    expect(mockD1Run).toHaveBeenCalledTimes(1);
  });

  it('returns 409 when accepted with NULL version AND Sanity rev fetch fails (cannot prove drift)', async () => {
    mockGetRev.mockResolvedValue(null);
    mockD1First.mockResolvedValue({ agreement_accepted_at: 1690000000000, agreement_version: null });
    const ctx = buildCtx({});
    const res = await POST(ctx as never);
    // Without current rev, can't distinguish "real drift" from "Sanity outage on already-accepted user".
    // Fail safe: keep the legacy timestamp-only semantics so we don't double-write on every request.
    expect(res.status).toBe(409);
    expect(mockD1Run).not.toHaveBeenCalled();
  });

  it('writes acceptedAt + agreementVersion + IP + UA, lowercases email, and invalidates KV', async () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    const ctx = buildCtx({
      cookie: 'better-auth.session_token=tok-xyz; Path=/',
      user: { email: 'S@CO.com', role: 'sponsor' },
      ip: '203.0.113.7',
      userAgent: 'Mozilla/5.0 (Test)',
    });

    const res = await POST(ctx as never);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ acceptedAt: 1700000000000 });

    expect(mockD1Prepare).toHaveBeenCalledWith(
      'SELECT agreement_accepted_at, agreement_version FROM user WHERE LOWER(email) = ?',
    );
    expect(mockD1Prepare).toHaveBeenCalledWith(
      'UPDATE user SET agreement_accepted_at = ?, agreement_version = ?, agreement_accepted_ip = ?, agreement_accepted_user_agent = ? WHERE LOWER(email) = ?',
    );
    // Email is normalized to lowercase before binding
    expect(mockD1Bind).toHaveBeenCalledWith('s@co.com');
    expect(mockD1Bind).toHaveBeenCalledWith(
      1700000000000,
      'rev-abc123',
      '203.0.113.7',
      'Mozilla/5.0 (Test)',
      's@co.com',
    );
    // KV invalidation: delete the cached session so middleware re-reads D1 next request.
    expect(mockKvDelete).toHaveBeenCalledWith('tok-xyz');
    expect(mockKvPut).not.toHaveBeenCalled();
    nowSpy.mockRestore();
  });

  it('writes NULL agreement_version when Sanity rev fetch fails (fail-open)', async () => {
    mockGetRev.mockResolvedValue(null);
    const ctx = buildCtx({
      cookie: 'better-auth.session_token=tok-xyz; Path=/',
      ip: '203.0.113.7',
      userAgent: 'UA',
    });

    const res = await POST(ctx as never);
    expect(res.status).toBe(200);
    // Second bind() call is the UPDATE — version arg must be null.
    const updateBind = mockD1Bind.mock.calls.find((args) => args.length === 5);
    expect(updateBind).toBeDefined();
    expect(updateBind?.[1]).toBeNull();
  });

  it('binds NULL when cf-connecting-ip and user-agent headers are missing (local dev)', async () => {
    const ctx = buildCtx({ cookie: 'better-auth.session_token=tok-xyz; Path=/' });
    await POST(ctx as never);
    const updateBind = mockD1Bind.mock.calls.find((args) => args.length === 5);
    expect(updateBind?.[2]).toBeNull();
    expect(updateBind?.[3]).toBeNull();
  });

  it('succeeds even when cookie is missing — KV invalidation skipped', async () => {
    const ctx = buildCtx({});
    const res = await POST(ctx as never);
    expect(res.status).toBe(200);
    expect(mockKvPut).not.toHaveBeenCalled();
    expect(mockKvDelete).not.toHaveBeenCalled();
  });

  it('non-POST method handler returns 405 with Allow: POST', async () => {
    const res = await ALL(null as never);
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('POST');
  });
});

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
} = vi.hoisted(() => {
  const mockD1Run = vi.fn();
  const mockD1First = vi.fn();
  const mockD1Bind = vi.fn().mockReturnValue({ run: mockD1Run, first: mockD1First });
  const mockD1Prepare = vi.fn().mockReturnValue({ bind: mockD1Bind });
  const mockKvGet = vi.fn();
  const mockKvPut = vi.fn().mockResolvedValue(undefined);
  const mockKvDelete = vi.fn().mockResolvedValue(undefined);
  const mockEnv: Record<string, unknown> = {
    PORTAL_DB: { prepare: mockD1Prepare },
    SESSION_CACHE: { get: mockKvGet, put: mockKvPut, delete: mockKvDelete },
  };
  return { mockD1Run, mockD1First, mockD1Bind, mockD1Prepare, mockKvGet, mockKvPut, mockKvDelete, mockEnv };
});

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

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
  env?: ReturnType<typeof buildEnv> | null;
  method?: string;
}) {
  const origin = opts.origin ?? 'https://example.com';
  const pathname = opts.pathname ?? '/api/portal/agreement/accept';
  const headers: Record<string, string> = {};
  if (opts.requestOrigin !== null) headers.origin = opts.requestOrigin ?? origin;
  if (opts.referer) headers.referer = opts.referer;
  if (opts.cookie) headers.cookie = opts.cookie;

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

  it('returns 409 when row exists with non-null acceptance', async () => {
    mockD1First.mockResolvedValue({ agreement_accepted_at: 1690000000000 });
    const ctx = buildCtx({});
    const res = await POST(ctx as never);
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'already_accepted' });
    expect(mockD1Run).not.toHaveBeenCalled();
  });

  it('returns 200 on sponsor with NULL acceptance, lowercases email, refreshes KV with new timestamp', async () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    mockKvGet.mockResolvedValue({
      email: 's@co.com',
      name: 'Sponsor',
      role: 'sponsor',
      agreementAcceptedAt: null,
    });
    const ctx = buildCtx({
      cookie: 'better-auth.session_token=tok-xyz; Path=/',
      user: { email: 'S@CO.com', role: 'sponsor' },
    });

    const res = await POST(ctx as never);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ acceptedAt: 1700000000000 });

    expect(mockD1Prepare).toHaveBeenCalledWith(
      'SELECT agreement_accepted_at FROM user WHERE LOWER(email) = ?',
    );
    expect(mockD1Prepare).toHaveBeenCalledWith(
      'UPDATE user SET agreement_accepted_at = ? WHERE LOWER(email) = ?',
    );
    // Email is normalized to lowercase before binding
    expect(mockD1Bind).toHaveBeenCalledWith('s@co.com');
    expect(mockD1Bind).toHaveBeenCalledWith(1700000000000, 's@co.com');
    // KV is rewritten with the fresh timestamp, not deleted (avoids stale-cache reprompt)
    expect(mockKvPut).toHaveBeenCalledWith(
      'tok-xyz',
      expect.stringContaining('"agreementAcceptedAt":1700000000000'),
      expect.objectContaining({ expirationTtl: 300 }),
    );
    expect(mockKvDelete).not.toHaveBeenCalled();
    nowSpy.mockRestore();
  });

  it('deletes KV entry when no cached session was present (nothing to refresh)', async () => {
    mockKvGet.mockResolvedValue(null);
    const ctx = buildCtx({
      cookie: 'better-auth.session_token=tok-xyz; Path=/',
    });
    const res = await POST(ctx as never);
    expect(res.status).toBe(200);
    expect(mockKvPut).not.toHaveBeenCalled();
    expect(mockKvDelete).toHaveBeenCalledWith('tok-xyz');
  });

  it('succeeds even when cookie is missing — KV refresh skipped', async () => {
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

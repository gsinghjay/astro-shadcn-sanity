import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

const PROJECT_ID = '49nk9b0w';
const ORIGIN = 'https://capstone.sanity.studio';
const READ_TOKEN = 'sktest_membership_check_token';
const ADMIN_USER_ID = 'pZxAdmin01';
const NON_MEMBER_USER_ID = 'pZyOutside9';
const SANITY_MEMBER_URL = `https://api.sanity.io/v2024-10-01/projects/${PROJECT_ID}/users/`;

// Adapter v13: acceptances.ts reads bindings via `cloudflare:workers`, not
// `locals.runtime.env`. Hoist mocks so the cloudflare:workers stub can wire
// them in before the route module loads. `mockEnv` is the live env object —
// tests mutate it (or buildEnv overrides) by calling `setEnv` between cases.
const {
  mockD1All,
  mockD1Bind,
  mockD1Prepare,
  mockEnv,
  defaultEnv,
  mockGetRev,
  fetchMock,
  fetchCalls,
} = vi.hoisted(() => {
  const mockD1All = vi.fn();
  const mockD1Bind = vi.fn().mockImplementation(() => ({ all: mockD1All }));
  const mockD1Prepare = vi.fn().mockReturnValue({ bind: mockD1Bind, all: mockD1All });
  const defaultEnv: Record<string, unknown> = {
    PORTAL_DB: { prepare: mockD1Prepare },
    STUDIO_ORIGIN: 'https://capstone.sanity.studio',
  };
  const mockEnv: Record<string, unknown> = { ...defaultEnv };
  const mockGetRev = vi.fn();
  const fetchCalls: { url: string; init?: RequestInit }[] = [];
  // `fetchMock` is configured per test via `fetchMock.mockImplementation(...)`.
  const fetchMock = vi.fn();
  return {
    mockD1All,
    mockD1Bind,
    mockD1Prepare,
    mockEnv,
    defaultEnv,
    mockGetRev,
    fetchMock,
    fetchCalls,
  };
});

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));
vi.mock('@/lib/sanity', () => ({ getSponsorAgreementRev: mockGetRev }));
vi.mock('astro:env/server', () => ({
  PUBLIC_SANITY_STUDIO_PROJECT_ID: PROJECT_ID,
  SANITY_PROJECT_READ_TOKEN: READ_TOKEN,
}));

// Stub global fetch for the Sanity membership-check call. The route uses the
// global `fetch` directly — we replace it on the global rather than via vi.spyOn
// so the module-level cache lookup sees the same stub each test.
const originalFetch = globalThis.fetch;

const { GET, OPTIONS, ALL, _resetMembershipCacheForTests } = await import('../acceptances');

// Top-level beforeEach: reset the membership cache + fetch stub between
// every test, regardless of which describe block. The module-level cache is
// shared across describe blocks, so resetting only inside a single describe
// would leak state into any future block.
beforeEach(() => {
  _resetMembershipCacheForTests();
  fetchCalls.length = 0;
  fetchMock.mockReset();
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input.toString();
    fetchCalls.push({ url, init });
    return fetchMock(url, init);
  }) as typeof fetch;
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});

/** Replace the live cloudflare:workers env object's keys with new values for one test. */
function setEnv(next: Record<string, unknown>): void {
  for (const k of Object.keys(mockEnv)) delete mockEnv[k];
  Object.assign(mockEnv, next);
}

function buildEnv(overrides: Record<string, unknown> = {}) {
  return {
    PORTAL_DB: { prepare: mockD1Prepare },
    STUDIO_ORIGIN: ORIGIN,
    ...overrides,
  };
}

function buildCtx(opts: {
  method?: string;
  origin?: string | null;
  userId?: string | null;
  search?: string;
  env?: Record<string, unknown> | null;
} = {}) {
  const headers: Record<string, string> = {};
  if (opts.origin !== null) headers.origin = opts.origin ?? ORIGIN;
  if (opts.userId === undefined) {
    // Default: a non-null user id (membership result driven per-test).
    headers['x-sanity-user-id'] = ADMIN_USER_ID;
  } else if (opts.userId !== null) {
    headers['x-sanity-user-id'] = opts.userId;
  }
  // explicit null = omit header
  const search = opts.search ?? '';
  const url = new URL(`https://app.example.com/api/portal/admin/acceptances${search}`);
  if (opts.env === null) {
    setEnv({});
  } else if (opts.env !== undefined) {
    setEnv(opts.env);
  } else {
    setEnv(buildEnv());
  }
  return {
    url,
    request: new Request(url.toString(), {
      method: opts.method ?? 'GET',
      headers,
    }),
    locals: {} as unknown,
  };
}

const CURRENT_REV = 'rev-current-xyz';

function mockSanityMembership(userId: string): void {
  // Build a fresh Response per call — the route reads the body once, but tests
  // that fire multiple un-cached requests in sequence would otherwise reuse a
  // single (already-consumed) Response.
  fetchMock.mockImplementation(async () =>
    new Response(JSON.stringify({ id: userId }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  );
}

function mockSanity404(): void {
  fetchMock.mockImplementation(async () => new Response('not found', { status: 404 }));
}

describe('GET /api/portal/admin/acceptances', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockD1All.mockReset().mockResolvedValue({
      results: [
        {
          email: 'a@co.com',
          name: 'Alice',
          role: 'sponsor',
          agreement_accepted_at: 1700000000000,
          agreement_version: CURRENT_REV,
        },
        {
          email: 'b@co.com',
          name: 'Bob',
          role: 'sponsor',
          agreement_accepted_at: null,
          agreement_version: null,
        },
      ],
    });
    mockD1Bind.mockReset().mockImplementation(() => ({ all: mockD1All }));
    mockD1Prepare.mockReset().mockReturnValue({ bind: mockD1Bind, all: mockD1All });
    mockGetRev.mockReset().mockResolvedValue(CURRENT_REV);
  });

  it('returns 401 when X-Sanity-User-Id header is missing', async () => {
    const ctx = buildCtx({ userId: null });
    const res = await GET(ctx as never);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
    // Error responses must echo CORS so the Studio caller can read the body.
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('returns 401 when X-Sanity-User-Id is empty', async () => {
    const ctx = buildCtx({ userId: '   ' });
    const res = await GET(ctx as never);
    expect(res.status).toBe(401);
    expect(fetchCalls.length).toBe(0);
  });

  it('returns 401 when X-Sanity-User-Id exceeds 64 chars', async () => {
    mockSanityMembership(ADMIN_USER_ID); // would 200 if cap weren't hit
    const oversized = 'p' + 'a'.repeat(64);
    const ctx = buildCtx({ userId: oversized });
    const res = await GET(ctx as never);
    expect(res.status).toBe(401);
    expect(fetchCalls.length).toBe(0);
  });

  it('returns 403 when Sanity membership lookup returns 404', async () => {
    mockSanity404();
    const ctx = buildCtx({ userId: NON_MEMBER_USER_ID });
    const res = await GET(ctx as never);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'forbidden' });
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('returns 403 when membership response id does not match the claimed user id', async () => {
    fetchMock.mockImplementation(async () =>
      new Response(JSON.stringify({ id: 'pSomeoneElse' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const ctx = buildCtx({ userId: ADMIN_USER_ID });
    const res = await GET(ctx as never);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'forbidden' });
  });

  it('returns 403 when membership response is malformed (no id field)', async () => {
    fetchMock.mockImplementation(async () =>
      new Response(JSON.stringify({ email: 'a@b' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    const ctx = buildCtx({ userId: ADMIN_USER_ID });
    const res = await GET(ctx as never);
    expect(res.status).toBe(403);
  });

  it('returns 403 when origin does not match STUDIO_ORIGIN (rejected before Sanity call)', async () => {
    mockSanityMembership(ADMIN_USER_ID);
    const ctx = buildCtx({ origin: 'https://evil.example' });
    const res = await GET(ctx as never);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'forbidden_origin' });
    // Origin check fires before any Sanity API call.
    expect(fetchCalls.length).toBe(0);
  });

  it('returns 200 with acceptances when membership matches + matching origin', async () => {
    mockSanityMembership(ADMIN_USER_ID);
    const ctx = buildCtx({ userId: ADMIN_USER_ID });
    const res = await GET(ctx as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.acceptances).toEqual([
      {
        email: 'a@co.com',
        name: 'Alice',
        role: 'sponsor',
        agreementAcceptedAt: 1700000000000,
        agreementVersion: CURRENT_REV,
        versionMatch: true,
      },
      {
        email: 'b@co.com',
        name: 'Bob',
        role: 'sponsor',
        agreementAcceptedAt: null,
        agreementVersion: null,
        versionMatch: null,
      },
    ]);
    expect(body.currentVersion).toBe(CURRENT_REV);
    expect(typeof body.generatedAt).toBe('number');
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('calls the projectId-scoped Sanity members endpoint with the Worker read token', async () => {
    mockSanityMembership(ADMIN_USER_ID);
    const ctx = buildCtx({ userId: ADMIN_USER_ID });
    await GET(ctx as never);
    expect(fetchCalls.length).toBe(1);
    expect(fetchCalls[0].url).toBe(`${SANITY_MEMBER_URL}${ADMIN_USER_ID}`);
    const headers = fetchCalls[0].init?.headers as Record<string, string>;
    expect(headers.authorization).toBe(`Bearer ${READ_TOKEN}`);
  });

  it('caches membership: same user-id within 60s hits Sanity once', async () => {
    mockSanityMembership(ADMIN_USER_ID);
    await GET(buildCtx({ userId: ADMIN_USER_ID }) as never);
    await GET(buildCtx({ userId: ADMIN_USER_ID }) as never);
    await GET(buildCtx({ userId: ADMIN_USER_ID }) as never);
    expect(fetchCalls.length).toBe(1);
  });

  it('cache miss: a different user-id triggers a fresh Sanity call', async () => {
    fetchMock.mockImplementation(async (url: string) => {
      // Echo back whichever id the Worker is asking about so both succeed.
      const id = url.split('/').pop() ?? '';
      return new Response(JSON.stringify({ id }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    await GET(buildCtx({ userId: 'pFirstUser0' }) as never);
    await GET(buildCtx({ userId: 'pSecondUser' }) as never);
    expect(fetchCalls.length).toBe(2);
  });

  it('versionMatch=false on stale rev; null when grandfathered (no rev)', async () => {
    mockSanityMembership(ADMIN_USER_ID);
    mockD1All.mockResolvedValue({
      results: [
        { email: 'a@co.com', name: 'Alice', role: 'sponsor', agreement_accepted_at: 1, agreement_version: 'rev-old' },
        { email: 'g@co.com', name: 'Grand', role: 'sponsor', agreement_accepted_at: 2, agreement_version: null },
        { email: 'p@co.com', name: 'Pend', role: 'sponsor', agreement_accepted_at: null, agreement_version: null },
      ],
    });
    const ctx = buildCtx({});
    const res = await GET(ctx as never);
    const body = await res.json();
    expect(body.acceptances[0].versionMatch).toBe(false);
    expect(body.acceptances[1].versionMatch).toBeNull();
    expect(body.acceptances[2].versionMatch).toBeNull();
  });

  it('SELECT projection includes agreement_version', async () => {
    mockSanityMembership(ADMIN_USER_ID);
    const ctx = buildCtx({});
    await GET(ctx as never);
    const sql = mockD1Prepare.mock.calls[0][0];
    expect(sql).toContain('agreement_version');
  });

  it('?versionDrift=true narrows query and binds currentRev', async () => {
    mockSanityMembership(ADMIN_USER_ID);
    const ctx = buildCtx({ search: '?versionDrift=true' });
    await GET(ctx as never);
    const sql = mockD1Prepare.mock.calls[0][0];
    expect(sql).toContain('agreement_accepted_at IS NOT NULL');
    expect(sql).toContain('(agreement_version IS NULL OR agreement_version != ?)');
    expect(mockD1Bind).toHaveBeenCalledWith(CURRENT_REV);
  });

  it('?versionDrift=true with Sanity rev unavailable falls back to no drift filter', async () => {
    mockSanityMembership(ADMIN_USER_ID);
    mockGetRev.mockResolvedValue(null);
    const ctx = buildCtx({ search: '?versionDrift=true' });
    await GET(ctx as never);
    const sql = mockD1Prepare.mock.calls[0][0];
    expect(sql).not.toContain('agreement_version IS NULL OR agreement_version != ?');
    expect(mockD1Bind).not.toHaveBeenCalled();
  });

  it('versionMatch is null on every row when Sanity rev fetch fails', async () => {
    mockSanityMembership(ADMIN_USER_ID);
    mockGetRev.mockResolvedValue(null);
    const ctx = buildCtx({});
    const res = await GET(ctx as never);
    const body = await res.json();
    for (const row of body.acceptances) expect(row.versionMatch).toBeNull();
    expect(body.currentVersion).toBeNull();
  });

  it('?accepted=true narrows query to non-null acceptance timestamps', async () => {
    mockSanityMembership(ADMIN_USER_ID);
    const ctx = buildCtx({ search: '?accepted=true' });
    await GET(ctx as never);
    const sql = mockD1Prepare.mock.calls[0][0];
    expect(sql).toContain("role = 'sponsor'");
    expect(sql).toContain('agreement_accepted_at IS NOT NULL');
    expect(sql).not.toContain('agreement_accepted_at IS NULL ');
  });

  it('?accepted=false narrows query to null acceptance timestamps', async () => {
    mockSanityMembership(ADMIN_USER_ID);
    const ctx = buildCtx({ search: '?accepted=false' });
    await GET(ctx as never);
    const sql = mockD1Prepare.mock.calls[0][0];
    expect(sql).toContain('agreement_accepted_at IS NULL');
    expect(sql).not.toContain('IS NOT NULL');
  });

  it('emits Cache-Control: private, max-age=0, must-revalidate', async () => {
    mockSanityMembership(ADMIN_USER_ID);
    const ctx = buildCtx({});
    const res = await GET(ctx as never);
    expect(res.headers.get('cache-control')).toBe('private, max-age=0, must-revalidate');
  });

  it('returns 503 with no detail leakage when D1 throws', async () => {
    mockSanityMembership(ADMIN_USER_ID);
    mockD1All.mockRejectedValue(new Error('table user does not exist'));
    const ctx = buildCtx({});
    const res = await GET(ctx as never);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toEqual({ error: 'service_unavailable' });
    expect(JSON.stringify(body)).not.toContain('table user');
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('returns 503 when STUDIO_ORIGIN env is missing (fail closed)', async () => {
    const ctx = buildCtx({ env: buildEnv({ STUDIO_ORIGIN: undefined }) });
    const res = await GET(ctx as never);
    expect(res.status).toBe(503);
  });

  it('returns 503 when PORTAL_DB binding is missing (fail closed)', async () => {
    const ctx = buildCtx({ env: buildEnv({ PORTAL_DB: undefined }) });
    const res = await GET(ctx as never);
    expect(res.status).toBe(503);
  });

  it('returns 503 when PUBLIC_SANITY_STUDIO_PROJECT_ID is empty (fail closed)', async () => {
    // Re-import the route with a different astro:env/server mock so the
    // module-level named import binds to the empty value. resetModules +
    // doMock is the documented vitest pattern for swapping a static import
    // mid-suite. The fresh module also gets a fresh membership cache, so
    // no afterAll cleanup is needed beyond the unmock.
    vi.resetModules();
    vi.doMock('astro:env/server', () => ({
      PUBLIC_SANITY_STUDIO_PROJECT_ID: '',
      SANITY_PROJECT_READ_TOKEN: READ_TOKEN,
    }));
    vi.doMock('cloudflare:workers', () => ({ env: mockEnv }));
    vi.doMock('@/lib/sanity', () => ({ getSponsorAgreementRev: mockGetRev }));
    const route = await import('../acceptances');
    const ctx = buildCtx({});
    const res = await route.GET(ctx as never);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'service_unavailable' });
    vi.doUnmock('astro:env/server');
    vi.doUnmock('cloudflare:workers');
    vi.doUnmock('@/lib/sanity');
    vi.resetModules();
  });

  it('returns 503 when SANITY_PROJECT_READ_TOKEN is missing (fail closed)', async () => {
    vi.resetModules();
    vi.doMock('astro:env/server', () => ({
      PUBLIC_SANITY_STUDIO_PROJECT_ID: PROJECT_ID,
      SANITY_PROJECT_READ_TOKEN: undefined,
    }));
    vi.doMock('cloudflare:workers', () => ({ env: mockEnv }));
    vi.doMock('@/lib/sanity', () => ({ getSponsorAgreementRev: mockGetRev }));
    const route = await import('../acceptances');
    const ctx = buildCtx({});
    const res = await route.GET(ctx as never);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'service_unavailable' });
    vi.doUnmock('astro:env/server');
    vi.doUnmock('cloudflare:workers');
    vi.doUnmock('@/lib/sanity');
    vi.resetModules();
  });

  it('returns 403 when membership lookup times out (AbortSignal abort)', async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) => {
      // Resolve only when the wired AbortSignal fires; otherwise hang. This
      // emulates a Sanity hang past MEMBERSHIP_TIMEOUT_MS without coupling
      // the test to the real 5 s timeout.
      return new Promise((_resolve, reject) => {
        const signal = init?.signal;
        if (signal?.aborted) {
          reject(new DOMException('aborted', 'AbortError'));
          return;
        }
        signal?.addEventListener('abort', () => {
          reject(new DOMException('aborted', 'AbortError'));
        });
      });
    });
    const ctx = buildCtx({ userId: ADMIN_USER_ID });
    // Force the abort synchronously by stubbing AbortSignal.timeout to return
    // an already-aborted signal. The original is restored after the test.
    const originalTimeout = AbortSignal.timeout;
    AbortSignal.timeout = ((_ms: number) => {
      const ctrl = new AbortController();
      ctrl.abort();
      return ctrl.signal;
    }) as typeof AbortSignal.timeout;
    try {
      const res = await GET(ctx as never);
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: 'forbidden' });
      // The route did wire signal: AbortSignal.timeout(...) into the fetch init.
      const init = fetchCalls[0]?.init as RequestInit | undefined;
      expect(init?.signal).toBeDefined();
    } finally {
      AbortSignal.timeout = originalTimeout;
    }
  });
});

describe('OPTIONS /api/portal/admin/acceptances', () => {
  it('returns 204 with full CORS headers when origin matches', async () => {
    const ctx = buildCtx({ method: 'OPTIONS' });
    const res = await OPTIONS(ctx as never);
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    expect(res.headers.get('access-control-allow-methods')).toBe('GET, OPTIONS');
    expect(res.headers.get('access-control-allow-headers')).toBe('content-type, x-sanity-user-id');
    expect(res.headers.get('access-control-max-age')).toBe('600');
  });

  it('returns 403 when origin does not match', async () => {
    const ctx = buildCtx({ method: 'OPTIONS', origin: 'https://evil.example' });
    const res = await OPTIONS(ctx as never);
    expect(res.status).toBe(403);
  });

  it('returns 503 (fail closed) when STUDIO_ORIGIN env is missing', async () => {
    const ctx = buildCtx({
      method: 'OPTIONS',
      env: buildEnv({ STUDIO_ORIGIN: undefined }),
    });
    const res = await OPTIONS(ctx as never);
    expect(res.status).toBe(503);
  });

  it('returns 503 (fail closed) when PORTAL_DB binding is missing', async () => {
    const ctx = buildCtx({
      method: 'OPTIONS',
      env: buildEnv({ PORTAL_DB: undefined }),
    });
    const res = await OPTIONS(ctx as never);
    expect(res.status).toBe(503);
  });

  it('returns 503 (fail closed) when SANITY_PROJECT_READ_TOKEN is missing', async () => {
    vi.resetModules();
    vi.doMock('astro:env/server', () => ({
      PUBLIC_SANITY_STUDIO_PROJECT_ID: PROJECT_ID,
      SANITY_PROJECT_READ_TOKEN: undefined,
    }));
    vi.doMock('cloudflare:workers', () => ({ env: mockEnv }));
    vi.doMock('@/lib/sanity', () => ({ getSponsorAgreementRev: mockGetRev }));
    const route = await import('../acceptances');
    const ctx = buildCtx({ method: 'OPTIONS' });
    const res = await route.OPTIONS(ctx as never);
    expect(res.status).toBe(503);
    vi.doUnmock('astro:env/server');
    vi.doUnmock('cloudflare:workers');
    vi.doUnmock('@/lib/sanity');
    vi.resetModules();
  });
});

describe('ALL handler — POST/PUT/DELETE', () => {
  it('returns 405 with Allow: GET, OPTIONS', async () => {
    const res = await ALL(null as never);
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('GET, OPTIONS');
  });
});

import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';

const PROJECT_ID = '49nk9b0w';
const ORIGIN = 'https://capstone.sanity.studio';

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
}));

// Stub global fetch for the Sanity user-introspection call. The route uses the
// global `fetch` directly — we replace it on the global rather than via vi.spyOn
// so the module-level cache lookup sees the same stub each test.
const originalFetch = globalThis.fetch;

const { GET, OPTIONS, ALL, _resetIntrospectionCacheForTests } = await import('../acceptances');

// Top-level beforeEach: reset the introspection cache + fetch stub between
// every test, regardless of which describe block. The module-level cache is
// shared across describe blocks, so resetting only inside a single describe
// would leak state into any future block.
beforeEach(() => {
  _resetIntrospectionCacheForTests();
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
  authToken?: string | null;
  search?: string;
  env?: Record<string, unknown> | null;
} = {}) {
  const headers: Record<string, string> = {};
  if (opts.origin !== null) headers.origin = opts.origin ?? ORIGIN;
  if (opts.authToken === undefined) {
    // Default: a non-null bearer (introspection result driven per-test).
    headers.authorization = 'Bearer studio-session-jwt-default';
  } else if (opts.authToken !== null) {
    headers.authorization = `Bearer ${opts.authToken}`;
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

const ADMIN_USER = {
  id: 'pZx',
  email: 'admin@example.com',
  name: 'Admin User',
  roles: [{ name: 'administrator', title: 'Administrator' }],
};

const NON_ADMIN_USER = {
  id: 'pZy',
  email: 'editor@example.com',
  name: 'Editor User',
  roles: [{ name: 'editor', title: 'Editor' }],
};

function mockSanityUser(user: unknown): void {
  // Build a fresh Response per call — the route reads the body once, but tests
  // that fire multiple un-cached requests in sequence would otherwise reuse a
  // single (already-consumed) Response.
  fetchMock.mockImplementation(async () =>
    new Response(JSON.stringify(user), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  );
}

function mockSanity401(): void {
  fetchMock.mockImplementation(async () => new Response('unauthorized', { status: 401 }));
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

  it('returns 401 when authorization header is missing', async () => {
    const ctx = buildCtx({ authToken: null });
    const res = await GET(ctx as never);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
    // Error responses must echo CORS so the Studio caller can read the body.
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('returns 401 when Sanity introspection rejects the bearer', async () => {
    mockSanity401();
    const ctx = buildCtx({ authToken: 'sjwt_revoked' });
    const res = await GET(ctx as never);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
    // Error responses must echo CORS so Studio can read the body cross-origin.
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('returns 403 when the introspected user lacks administrator role', async () => {
    mockSanityUser(NON_ADMIN_USER);
    const ctx = buildCtx({ authToken: 'sjwt_editor' });
    const res = await GET(ctx as never);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'forbidden' });
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('returns 403 when origin does not match STUDIO_ORIGIN (rejected before introspection)', async () => {
    mockSanityUser(ADMIN_USER);
    const ctx = buildCtx({ origin: 'https://evil.example' });
    const res = await GET(ctx as never);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'forbidden_origin' });
    // Origin check fires before the bearer is forwarded to Sanity, so no introspection call.
    expect(fetchCalls.length).toBe(0);
  });

  it('returns 200 with acceptances when admin user + matching origin', async () => {
    mockSanityUser(ADMIN_USER);
    const ctx = buildCtx({ authToken: 'sjwt_admin' });
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

  it('forwards the bearer to Sanity introspection at the projectId-scoped endpoint', async () => {
    mockSanityUser(ADMIN_USER);
    const ctx = buildCtx({ authToken: 'sjwt_admin_call_a' });
    await GET(ctx as never);
    expect(fetchCalls.length).toBe(1);
    expect(fetchCalls[0].url).toBe(`https://${PROJECT_ID}.api.sanity.io/v1/users/me`);
    const headers = fetchCalls[0].init?.headers as Record<string, string>;
    expect(headers.authorization).toBe('Bearer sjwt_admin_call_a');
  });

  it('caches introspection: same bearer in the same isolate hits Sanity once', async () => {
    mockSanityUser(ADMIN_USER);
    const token = 'sjwt_cached_admin';
    await GET(buildCtx({ authToken: token }) as never);
    await GET(buildCtx({ authToken: token }) as never);
    await GET(buildCtx({ authToken: token }) as never);
    expect(fetchCalls.length).toBe(1);
  });

  it('cache miss for a different bearer triggers a fresh introspection', async () => {
    mockSanityUser(ADMIN_USER);
    await GET(buildCtx({ authToken: 'sjwt_first' }) as never);
    await GET(buildCtx({ authToken: 'sjwt_second' }) as never);
    expect(fetchCalls.length).toBe(2);
  });

  it('versionMatch=false on stale rev; null when grandfathered (no rev)', async () => {
    mockSanityUser(ADMIN_USER);
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
    mockSanityUser(ADMIN_USER);
    const ctx = buildCtx({});
    await GET(ctx as never);
    const sql = mockD1Prepare.mock.calls[0][0];
    expect(sql).toContain('agreement_version');
  });

  it('?versionDrift=true narrows query and binds currentRev', async () => {
    mockSanityUser(ADMIN_USER);
    const ctx = buildCtx({ search: '?versionDrift=true' });
    await GET(ctx as never);
    const sql = mockD1Prepare.mock.calls[0][0];
    expect(sql).toContain('agreement_accepted_at IS NOT NULL');
    expect(sql).toContain('(agreement_version IS NULL OR agreement_version != ?)');
    expect(mockD1Bind).toHaveBeenCalledWith(CURRENT_REV);
  });

  it('?versionDrift=true with Sanity rev unavailable falls back to no drift filter', async () => {
    mockSanityUser(ADMIN_USER);
    mockGetRev.mockResolvedValue(null);
    const ctx = buildCtx({ search: '?versionDrift=true' });
    await GET(ctx as never);
    const sql = mockD1Prepare.mock.calls[0][0];
    expect(sql).not.toContain('agreement_version IS NULL OR agreement_version != ?');
    expect(mockD1Bind).not.toHaveBeenCalled();
  });

  it('versionMatch is null on every row when Sanity rev fetch fails', async () => {
    mockSanityUser(ADMIN_USER);
    mockGetRev.mockResolvedValue(null);
    const ctx = buildCtx({});
    const res = await GET(ctx as never);
    const body = await res.json();
    for (const row of body.acceptances) expect(row.versionMatch).toBeNull();
    expect(body.currentVersion).toBeNull();
  });

  it('?accepted=true narrows query to non-null acceptance timestamps', async () => {
    mockSanityUser(ADMIN_USER);
    const ctx = buildCtx({ search: '?accepted=true' });
    await GET(ctx as never);
    const sql = mockD1Prepare.mock.calls[0][0];
    expect(sql).toContain("role = 'sponsor'");
    expect(sql).toContain('agreement_accepted_at IS NOT NULL');
    expect(sql).not.toContain('agreement_accepted_at IS NULL ');
  });

  it('?accepted=false narrows query to null acceptance timestamps', async () => {
    mockSanityUser(ADMIN_USER);
    const ctx = buildCtx({ search: '?accepted=false' });
    await GET(ctx as never);
    const sql = mockD1Prepare.mock.calls[0][0];
    expect(sql).toContain('agreement_accepted_at IS NULL');
    expect(sql).not.toContain('IS NOT NULL');
  });

  it('emits Cache-Control: private, max-age=0, must-revalidate', async () => {
    mockSanityUser(ADMIN_USER);
    const ctx = buildCtx({});
    const res = await GET(ctx as never);
    expect(res.headers.get('cache-control')).toBe('private, max-age=0, must-revalidate');
  });

  it('returns 503 with no detail leakage when D1 throws', async () => {
    mockSanityUser(ADMIN_USER);
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
    // mid-suite. The fresh module also gets a fresh introspection cache, so
    // no afterAll cleanup is needed beyond the unmock.
    vi.resetModules();
    vi.doMock('astro:env/server', () => ({ PUBLIC_SANITY_STUDIO_PROJECT_ID: '' }));
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
});

describe('OPTIONS /api/portal/admin/acceptances', () => {
  it('returns 204 with full CORS headers when origin matches', async () => {
    const ctx = buildCtx({ method: 'OPTIONS' });
    const res = await OPTIONS(ctx as never);
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
    expect(res.headers.get('access-control-allow-methods')).toBe('GET, OPTIONS');
    expect(res.headers.get('access-control-allow-headers')).toBe('authorization, content-type');
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
});

describe('ALL handler — POST/PUT/DELETE', () => {
  it('returns 405 with Allow: GET, OPTIONS', async () => {
    const res = await ALL(null as never);
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('GET, OPTIONS');
  });
});

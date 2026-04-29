import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GET, OPTIONS, ALL } from '../acceptances';

const mockD1All = vi.fn();
const mockD1Prepare = vi.fn().mockReturnValue({ all: mockD1All });

const TOKEN = 'sat_test_token_value';
const ORIGIN = 'https://capstone.sanity.studio';

function buildEnv(overrides: Record<string, unknown> = {}) {
  return {
    PORTAL_DB: { prepare: mockD1Prepare },
    STUDIO_ADMIN_TOKEN: TOKEN,
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
  if (opts.authToken !== null && opts.authToken !== undefined) {
    headers.authorization = `Bearer ${opts.authToken}`;
  } else if (opts.authToken === undefined) {
    headers.authorization = `Bearer ${TOKEN}`;
  }
  // explicit null = omit header
  const search = opts.search ?? '';
  const url = new URL(`https://app.example.com/api/portal/admin/acceptances${search}`);
  return {
    url,
    request: new Request(url.toString(), {
      method: opts.method ?? 'GET',
      headers,
    }),
    locals: {
      runtime: opts.env === null ? undefined : { env: opts.env ?? buildEnv() },
    } as unknown,
  };
}

describe('GET /api/portal/admin/acceptances', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockD1All.mockReset().mockResolvedValue({
      results: [
        { email: 'a@co.com', name: 'Alice', role: 'sponsor', agreement_accepted_at: 1700000000000 },
        { email: 'b@co.com', name: 'Bob', role: 'sponsor', agreement_accepted_at: null },
      ],
    });
    mockD1Prepare.mockReset().mockReturnValue({ all: mockD1All });
  });

  it('returns 401 when authorization header is missing', async () => {
    const ctx = buildCtx({ authToken: null });
    const res = await GET(ctx as never);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'unauthorized' });
    // Error responses must echo CORS so the Studio caller can read the body.
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('returns 401 when bearer token does not match', async () => {
    const ctx = buildCtx({ authToken: 'sat_wrong_token_value_x' });
    const res = await GET(ctx as never);
    expect(res.status).toBe(401);
  });

  it('returns 403 when origin does not match STUDIO_ORIGIN', async () => {
    const ctx = buildCtx({ origin: 'https://evil.example' });
    const res = await GET(ctx as never);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'forbidden_origin' });
  });

  it('returns 200 with acceptances array on valid token + origin', async () => {
    const ctx = buildCtx({});
    const res = await GET(ctx as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.acceptances).toEqual([
      { email: 'a@co.com', name: 'Alice', role: 'sponsor', agreementAcceptedAt: 1700000000000 },
      { email: 'b@co.com', name: 'Bob', role: 'sponsor', agreementAcceptedAt: null },
    ]);
    expect(typeof body.generatedAt).toBe('number');
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('?accepted=true narrows query to non-null acceptance timestamps', async () => {
    const ctx = buildCtx({ search: '?accepted=true' });
    await GET(ctx as never);
    const sql = mockD1Prepare.mock.calls[0][0];
    expect(sql).toContain("role = 'sponsor'");
    expect(sql).toContain('agreement_accepted_at IS NOT NULL');
    expect(sql).not.toContain('agreement_accepted_at IS NULL ');
  });

  it('?accepted=false narrows query to null acceptance timestamps', async () => {
    const ctx = buildCtx({ search: '?accepted=false' });
    await GET(ctx as never);
    const sql = mockD1Prepare.mock.calls[0][0];
    expect(sql).toContain('agreement_accepted_at IS NULL');
    expect(sql).not.toContain('IS NOT NULL');
  });

  it('emits Cache-Control: private, max-age=0, must-revalidate', async () => {
    const ctx = buildCtx({});
    const res = await GET(ctx as never);
    expect(res.headers.get('cache-control')).toBe('private, max-age=0, must-revalidate');
  });

  it('returns 503 with no detail leakage when D1 throws', async () => {
    mockD1All.mockRejectedValue(new Error('table user does not exist'));
    const ctx = buildCtx({});
    const res = await GET(ctx as never);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toEqual({ error: 'service_unavailable' });
    expect(JSON.stringify(body)).not.toContain('table user');
    // 503 from D1 catch must still echo CORS (origin matched at top of handler).
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
  });

  it('returns 503 when STUDIO_ADMIN_TOKEN env is missing (fail closed)', async () => {
    const ctx = buildCtx({ env: buildEnv({ STUDIO_ADMIN_TOKEN: undefined }) });
    const res = await GET(ctx as never);
    expect(res.status).toBe(503);
    // Even when env is missing, if origin matches we still echo CORS so Studio sees the body.
    expect(res.headers.get('access-control-allow-origin')).toBe(ORIGIN);
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

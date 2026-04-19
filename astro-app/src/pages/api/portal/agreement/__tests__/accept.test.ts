import { describe, it, expect, vi, beforeEach } from 'vitest';

import { POST, ALL } from '../accept';

const mockD1Run = vi.fn();
const mockD1Bind = vi.fn().mockReturnValue({ run: mockD1Run });
const mockD1Prepare = vi.fn().mockReturnValue({ bind: mockD1Bind });
const mockKvDelete = vi.fn().mockResolvedValue(undefined);

function buildEnv(overrides: Partial<{ PORTAL_DB: unknown; SESSION_CACHE: unknown }> = {}) {
  return {
    PORTAL_DB: { prepare: mockD1Prepare },
    SESSION_CACHE: { delete: mockKvDelete },
    ...overrides,
  };
}

function buildCtx(opts: {
  pathname?: string;
  origin?: string;
  requestOrigin?: string | null;
  user?: { email: string; role: 'sponsor' | 'student' } | null;
  cookie?: string;
  env?: ReturnType<typeof buildEnv> | null;
  method?: string;
}) {
  const origin = opts.origin ?? 'https://example.com';
  const pathname = opts.pathname ?? '/api/portal/agreement/accept';
  const headers: Record<string, string> = {};
  if (opts.requestOrigin !== null) headers.origin = opts.requestOrigin ?? origin;
  if (opts.cookie) headers.cookie = opts.cookie;

  return {
    url: new URL(`${origin}${pathname}`),
    request: new Request(`${origin}${pathname}`, {
      method: opts.method ?? 'POST',
      headers,
    }),
    locals: {
      user: opts.user === undefined ? { email: 's@co.com', role: 'sponsor' } : opts.user,
      runtime: opts.env === null ? undefined : { env: opts.env ?? buildEnv() },
    } as unknown,
  };
}

describe('POST /api/portal/agreement/accept', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockD1Run.mockReset().mockResolvedValue({ meta: { changes: 1 } });
    mockD1Bind.mockReset().mockReturnValue({ run: mockD1Run });
    mockD1Prepare.mockReset().mockReturnValue({ bind: mockD1Bind });
    mockKvDelete.mockReset().mockResolvedValue(undefined);
  });

  it('returns 403 when Origin header is missing', async () => {
    const ctx = buildCtx({ requestOrigin: null });
    const res = await POST(ctx as never);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'forbidden_origin' });
  });

  it('returns 403 when Origin header mismatches request URL origin', async () => {
    const ctx = buildCtx({ requestOrigin: 'https://evil.example' });
    const res = await POST(ctx as never);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'forbidden_origin' });
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

  it('returns 200 on sponsor with NULL acceptance → D1 update + KV delete', async () => {
    const nowSpy = vi.spyOn(Date, 'now').mockReturnValue(1700000000000);
    const ctx = buildCtx({
      cookie: 'better-auth.session_token=tok-xyz; Path=/',
    });

    const res = await POST(ctx as never);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ acceptedAt: 1700000000000 });
    expect(mockD1Prepare).toHaveBeenCalledWith(
      'UPDATE user SET agreement_accepted_at = ? WHERE email = ? AND agreement_accepted_at IS NULL',
    );
    expect(mockD1Bind).toHaveBeenCalledWith(1700000000000, 's@co.com');
    expect(mockD1Run).toHaveBeenCalled();
    expect(mockKvDelete).toHaveBeenCalledWith('tok-xyz');
    nowSpy.mockRestore();
  });

  it('returns 409 when acceptance already recorded (idempotent)', async () => {
    mockD1Run.mockResolvedValue({ meta: { changes: 0 } });
    const ctx = buildCtx({});
    const res = await POST(ctx as never);
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: 'already_accepted' });
    expect(mockKvDelete).not.toHaveBeenCalled();
  });

  it('succeeds even when cookie is missing — KV delete just skipped', async () => {
    const ctx = buildCtx({});
    const res = await POST(ctx as never);
    expect(res.status).toBe(200);
    expect(mockKvDelete).not.toHaveBeenCalled();
  });

  it('non-POST method handler returns 405 with Allow: POST', async () => {
    const res = await ALL(null as never);
    expect(res.status).toBe(405);
    expect(res.headers.get('allow')).toBe('POST');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockGetDrizzle,
  mockCreateAuth,
  mockAuthHandler,
  mockKvDelete,
  mockEnv,
} = vi.hoisted(() => {
  const mockAuthHandler = vi.fn(async () => new Response(null, { status: 200 }));
  const mockGetDrizzle = vi.fn().mockReturnValue({ __drizzle: true });
  const mockCreateAuth = vi.fn().mockReturnValue({ handler: mockAuthHandler });
  const mockKvDelete = vi.fn().mockResolvedValue(undefined);
  const mockEnv: Record<string, unknown> = {
    SESSION_CACHE: { delete: mockKvDelete },
  };
  return { mockGetDrizzle, mockCreateAuth, mockAuthHandler, mockKvDelete, mockEnv };
});

vi.mock('@/lib/db', () => ({ getDrizzle: mockGetDrizzle }));
vi.mock('@/lib/auth-config', () => ({ createAuth: mockCreateAuth }));
vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

import { POST } from '../[...all]';
import { hashToken } from '../../../../middleware';

const SIGN_OUT_URL = 'http://localhost:4321/api/auth/sign-out';

function createMockCfContext() {
  return {
    waitUntil: vi.fn((p: Promise<unknown>) => {
      void p;
    }),
    passThroughOnException: vi.fn(),
  };
}

function createMockApiContext(url: string, init: RequestInit & { cfContext?: ReturnType<typeof createMockCfContext> } = {}) {
  const { cfContext, ...requestInit } = init;
  const ctx = cfContext ?? createMockCfContext();
  const request = new Request(url, requestInit);
  return {
    request,
    url: new URL(url),
    locals: { cfContext: ctx } as unknown as App.Locals,
    params: {},
    redirect: vi.fn(),
    cookies: {} as never,
    site: undefined,
    generator: 'astro',
    props: {},
    clientAddress: '127.0.0.1',
    routePattern: '/api/auth/[...all]',
    originPathname: '/api/auth/sign-out',
    preferredLocale: undefined,
    preferredLocaleList: undefined,
    currentLocale: undefined,
    isPrerendered: false,
    rewrite: vi.fn(),
    callAction: vi.fn(),
    getActionResult: vi.fn(),
    session: undefined,
  } as never;
}

describe('POST /api/auth/sign-out — Story 24.3 KV invalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEnv.SESSION_CACHE = { delete: mockKvDelete };
    mockKvDelete.mockReset().mockResolvedValue(undefined);
    mockAuthHandler.mockReset().mockResolvedValue(new Response(null, { status: 200 }));
  });

  it('deletes the SESSION_CACHE entry under SHA-256(token) on a sign-out POST', async () => {
    const cfContext = createMockCfContext();
    const ctx = createMockApiContext(SIGN_OUT_URL, {
      method: 'POST',
      headers: { cookie: 'better-auth.session_token=raw-cookie-value-xyz; Path=/' },
      cfContext,
    });

    const response = await POST(ctx);

    expect(response.status).toBe(200);
    expect(cfContext.waitUntil).toHaveBeenCalledTimes(1);
    await Promise.allSettled(cfContext.waitUntil.mock.calls.map((c: [Promise<unknown>]) => c[0]));
    const expectedHash = await hashToken('raw-cookie-value-xyz');
    expect(mockKvDelete).toHaveBeenCalledWith(expectedHash);
  });

  it('captures the cookie BEFORE auth.handler runs (response strips it on success)', async () => {
    const cfContext = createMockCfContext();
    // Simulate Better Auth: sign-out clears the cookie on the response
    mockAuthHandler.mockResolvedValueOnce(
      new Response(null, {
        status: 200,
        headers: { 'set-cookie': 'better-auth.session_token=; Max-Age=0; Path=/' },
      }),
    );
    const ctx = createMockApiContext(SIGN_OUT_URL, {
      method: 'POST',
      headers: { cookie: 'better-auth.session_token=should-be-deleted; Path=/' },
      cfContext,
    });

    await POST(ctx);
    await Promise.allSettled(cfContext.waitUntil.mock.calls.map((c: [Promise<unknown>]) => c[0]));

    const expectedHash = await hashToken('should-be-deleted');
    expect(mockKvDelete).toHaveBeenCalledWith(expectedHash);
  });

  it('does NOT touch KV when the request is not sign-out (e.g., /api/auth/session)', async () => {
    const cfContext = createMockCfContext();
    const ctx = createMockApiContext('http://localhost:4321/api/auth/session', {
      method: 'POST',
      headers: { cookie: 'better-auth.session_token=any-value; Path=/' },
      cfContext,
    });

    await POST(ctx);

    expect(mockKvDelete).not.toHaveBeenCalled();
    expect(cfContext.waitUntil).not.toHaveBeenCalled();
  });

  it('does NOT delete when the request has no session cookie', async () => {
    const cfContext = createMockCfContext();
    const ctx = createMockApiContext(SIGN_OUT_URL, {
      method: 'POST',
      cfContext,
    });

    await POST(ctx);

    expect(mockKvDelete).not.toHaveBeenCalled();
    expect(cfContext.waitUntil).not.toHaveBeenCalled();
  });

  it('skips KV delete gracefully when SESSION_CACHE binding is unavailable', async () => {
    mockEnv.SESSION_CACHE = undefined;
    const cfContext = createMockCfContext();
    const ctx = createMockApiContext(SIGN_OUT_URL, {
      method: 'POST',
      headers: { cookie: 'better-auth.session_token=tok; Path=/' },
      cfContext,
    });

    const response = await POST(ctx);

    expect(response.status).toBe(200);
    expect(cfContext.waitUntil).not.toHaveBeenCalled();
  });

  it('logs but does not surface KV-delete failures to the sign-out caller', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockKvDelete.mockRejectedValueOnce(new Error('KV outage'));
    const cfContext = createMockCfContext();
    const ctx = createMockApiContext(SIGN_OUT_URL, {
      method: 'POST',
      headers: { cookie: 'better-auth.session_token=tok; Path=/' },
      cfContext,
    });

    const response = await POST(ctx);
    expect(response.status).toBe(200);
    await Promise.allSettled(cfContext.waitUntil.mock.calls.map((c: [Promise<unknown>]) => c[0]));

    const errorLog = consoleSpy.mock.calls
      .map((call) => {
        try {
          return JSON.parse(call[0] as string);
        } catch {
          return null;
        }
      })
      .find((parsed) => parsed?.msg === 'auth-signout-kv-delete-failed');
    expect(errorLog).toBeDefined();
    expect(errorLog.error).toBe('KV outage');
    consoleSpy.mockRestore();
  });
});

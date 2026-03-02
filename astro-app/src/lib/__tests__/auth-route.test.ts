import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockGetDrizzle, mockCreateAuth, mockHandler } = vi.hoisted(() => {
  const mockHandler = vi.fn();
  const mockGetDrizzle = vi.fn().mockReturnValue({ __drizzle: true });
  const mockCreateAuth = vi.fn().mockReturnValue({
    handler: mockHandler,
  });
  return { mockGetDrizzle, mockCreateAuth, mockHandler };
});

vi.mock('@/lib/db', () => ({
  getDrizzle: mockGetDrizzle,
}));

vi.mock('@/lib/student-auth', () => ({
  createAuth: mockCreateAuth,
}));

import { GET, POST } from '@/pages/api/auth/[...all]';

const mockLocals = {
  runtime: {
    env: {
      GOOGLE_CLIENT_ID: 'test-id',
      GOOGLE_CLIENT_SECRET: 'test-secret',
      BETTER_AUTH_SECRET: 'test-auth-secret',
      BETTER_AUTH_URL: 'http://localhost:4321',
      PORTAL_DB: {},
    },
  },
} as unknown as App.Locals;

const mockRequest = new Request('http://localhost:4321/api/auth/session');

describe('[...all].ts auth route — error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to success defaults
    mockGetDrizzle.mockReturnValue({ __drizzle: true });
    mockCreateAuth.mockReturnValue({ handler: mockHandler });
  });

  it('returns auth.handler response on success', async () => {
    const mockResponse = new Response('ok', { status: 200 });
    mockHandler.mockResolvedValue(mockResponse);

    const result = await GET({ locals: mockLocals, request: mockRequest } as any);
    expect(result.status).toBe(200);
  });

  it('returns 500 for missing env var errors', async () => {
    mockCreateAuth.mockImplementation(() => {
      throw new Error('Missing required auth environment variable: BETTER_AUTH_SECRET');
    });

    const result = await GET({ locals: mockLocals, request: mockRequest } as any);
    expect(result.status).toBe(500);
    const body = await result.json();
    expect(body.error).toBe('Auth configuration error');
  });

  it('returns 500 for PORTAL_DB binding errors', async () => {
    mockGetDrizzle.mockImplementation(() => {
      throw new Error('PORTAL_DB binding not available');
    });

    const result = await GET({ locals: mockLocals, request: mockRequest } as any);
    expect(result.status).toBe(500);
    const body = await result.json();
    expect(body.error).toBe('Auth configuration error');
  });

  it('returns 503 for D1 runtime errors', async () => {
    mockHandler.mockRejectedValue(new Error('D1_ERROR: database unavailable'));

    const result = await GET({ locals: mockLocals, request: mockRequest } as any);
    expect(result.status).toBe(503);
    const body = await result.json();
    expect(body.error).toBe('Auth service unavailable');
  });

  it('returns 503 for non-Error exceptions', async () => {
    mockHandler.mockRejectedValue('unexpected string error');

    const result = await GET({ locals: mockLocals, request: mockRequest } as any);
    expect(result.status).toBe(503);
    const body = await result.json();
    expect(body.error).toBe('Auth service unavailable');
  });

  it('does not expose internal error details in response body', async () => {
    mockHandler.mockRejectedValue(new Error('secret internal error with DB credentials'));

    const result = await GET({ locals: mockLocals, request: mockRequest } as any);
    const body = await result.json();
    expect(body.error).not.toContain('secret');
    expect(body.error).not.toContain('credentials');
  });

  it('sets Content-Type to application/json on error responses', async () => {
    mockHandler.mockRejectedValue(new Error('some error'));

    const result = await GET({ locals: mockLocals, request: mockRequest } as any);
    expect(result.headers.get('Content-Type')).toBe('application/json');
  });

  it('exports POST handler identical to GET', () => {
    expect(POST).toBe(GET);
  });
});

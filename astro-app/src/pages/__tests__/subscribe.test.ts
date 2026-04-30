import { describe, it, expect, vi, beforeEach } from 'vitest';

// Adapter v13: subscribe.ts reads PORTAL_DB via `import { env } from
// "cloudflare:workers"` instead of `locals.runtime.env`. Hoist the mocks so
// the cloudflare:workers stub can wire them in before the route module loads.
const { mockRun, mockBind, mockFirst, mockPrepare, mockEnv } = vi.hoisted(() => {
  const mockRun = vi.fn().mockResolvedValue({ success: true });
  const mockBind = vi.fn().mockReturnValue({ run: mockRun });
  const mockFirst = vi.fn().mockResolvedValue({ count: 0 });
  const mockPrepare = vi.fn().mockReturnValue({ bind: mockBind, first: mockFirst });
  const mockEnv: Record<string, unknown> = {
    PORTAL_DB: { prepare: mockPrepare },
  };
  return { mockRun, mockBind, mockFirst, mockPrepare, mockEnv };
});

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

const { POST, DELETE } = await import('@/pages/api/subscribe');

const createLocals = () => ({}) as unknown as App.Locals;

const createPostContext = (body: unknown) => ({
  request: new Request('http://localhost:4321/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),
  locals: createLocals(),
});

const createDeleteContext = (email?: string) => {
  const url = email ? `http://localhost:4321/api/subscribe?email=${encodeURIComponent(email)}` : 'http://localhost:4321/api/subscribe';
  return {
    request: new Request(url, { method: 'DELETE' }),
    locals: createLocals(),
  };
};

describe('POST /api/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRun.mockResolvedValue({ success: true });
    mockBind.mockReturnValue({ run: mockRun });
    mockFirst.mockResolvedValue({ count: 0 });
    mockPrepare.mockReturnValue({ bind: mockBind, first: mockFirst });
  });

  it('subscribes with valid email and default remind_days_before', async () => {
    const ctx = createPostContext({ email: 'test@example.com' });
    const res = await POST(ctx as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    // Second prepare call is for INSERT (first is rate limit check)
    expect(mockBind).toHaveBeenCalledWith('test@example.com', null, 7);
  });

  it('subscribes with custom remind_days_before and discord_user_id', async () => {
    const ctx = createPostContext({ email: 'user@test.com', discord_user_id: 'abc123', remind_days_before: 3 });
    const res = await POST(ctx as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockBind).toHaveBeenCalledWith('user@test.com', 'abc123', 3);
  });

  it('rejects invalid JSON body', async () => {
    const res = await POST({
      request: new Request('http://localhost:4321/api/subscribe', {
        method: 'POST',
        body: 'not json',
      }),
      locals: createLocals(),
    } as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.success).toBe(false);
    expect(body.error).toBe('Invalid JSON');
  });

  it('rejects missing email', async () => {
    const ctx = createPostContext({});
    const res = await POST(ctx as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Valid email required');
  });

  it('rejects empty email', async () => {
    const ctx = createPostContext({ email: '   ' });
    const res = await POST(ctx as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Valid email required');
  });

  it('rejects invalid email format', async () => {
    const ctx = createPostContext({ email: 'not-an-email' });
    const res = await POST(ctx as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Valid email required');
  });

  it('rejects remind_days_before less than 1', async () => {
    const ctx = createPostContext({ email: 'test@example.com', remind_days_before: 0 });
    const res = await POST(ctx as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('remind_days_before must be 1-30');
  });

  it('rejects remind_days_before greater than 30', async () => {
    const ctx = createPostContext({ email: 'test@example.com', remind_days_before: 31 });
    const res = await POST(ctx as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('remind_days_before must be 1-30');
  });

  it('returns 500 when D1 insert fails', async () => {
    mockRun.mockRejectedValue(new Error('D1 error'));
    const ctx = createPostContext({ email: 'test@example.com' });
    const res = await POST(ctx as any);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Subscription failed');
  });

  it('returns 409 when email already subscribed (UNIQUE constraint)', async () => {
    mockRun.mockRejectedValue(new Error('UNIQUE constraint failed: subscribers.email'));
    const ctx = createPostContext({ email: 'test@example.com' });
    const res = await POST(ctx as any);
    const body = await res.json();

    expect(res.status).toBe(409);
    expect(body.error).toBe('Email already subscribed');
  });

  it('trims email whitespace', async () => {
    const ctx = createPostContext({ email: '  test@example.com  ' });
    await POST(ctx as any);

    expect(mockBind).toHaveBeenCalledWith('test@example.com', null, 7);
  });

  it('sets Content-Type to application/json', async () => {
    const ctx = createPostContext({ email: 'test@example.com' });
    const res = await POST(ctx as any);

    expect(res.headers.get('Content-Type')).toBe('application/json');
  });

  it('returns 429 when rate limit exceeded', async () => {
    mockFirst.mockResolvedValue({ count: 10 });
    const ctx = createPostContext({ email: 'test@example.com' });
    const res = await POST(ctx as any);
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(body.error).toBe('Too many subscriptions. Try again later.');
  });

  it('proceeds when rate limit check fails', async () => {
    mockFirst.mockRejectedValue(new Error('D1 error'));
    const ctx = createPostContext({ email: 'test@example.com' });
    const res = await POST(ctx as any);
    const body = await res.json();

    // Should still succeed — rate limit failure is non-blocking
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
  });
});

describe('DELETE /api/subscribe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRun.mockResolvedValue({ success: true });
    mockBind.mockReturnValue({ run: mockRun });
    mockPrepare.mockReturnValue({ bind: mockBind });
  });

  it('unsubscribes by setting active = 0', async () => {
    const ctx = createDeleteContext('test@example.com');
    const res = await DELETE(ctx as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockPrepare).toHaveBeenCalledWith('UPDATE subscribers SET active = 0 WHERE email = ?');
    expect(mockBind).toHaveBeenCalledWith('test@example.com');
  });

  it('rejects missing email parameter', async () => {
    const ctx = createDeleteContext();
    const res = await DELETE(ctx as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('Email required');
  });

  it('returns 500 when D1 update fails', async () => {
    mockRun.mockRejectedValue(new Error('D1 error'));
    const ctx = createDeleteContext('test@example.com');
    const res = await DELETE(ctx as any);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe('Unsubscribe failed');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDelete, mockDeleteWhere, mockRun, mockSelect, mockFrom, mockSelectWhere, mockGet, mockGetDrizzle } =
  vi.hoisted(() => {
    const mockRun = vi.fn();
    const mockGet = vi.fn();
    const mockDeleteWhere = vi.fn(() => ({ run: mockRun }));
    const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));
    const mockSelectWhere = vi.fn(() => ({ get: mockGet }));
    const mockFrom = vi.fn(() => ({ where: mockSelectWhere }));
    const mockSelect = vi.fn(() => ({ from: mockFrom }));
    const mockGetDrizzle = vi.fn(() => ({ delete: mockDelete, select: mockSelect }));
    return {
      mockDelete,
      mockDeleteWhere,
      mockRun,
      mockSelect,
      mockFrom,
      mockSelectWhere,
      mockGet,
      mockGetDrizzle,
    };
  });

vi.mock('@/lib/db', () => ({
  getDrizzle: mockGetDrizzle,
}));

vi.mock('cloudflare:workers', () => ({
  env: {},
}));

import { DELETE } from '../disconnect';

beforeEach(() => {
  mockRun.mockReset();
  mockGet.mockReset();
  mockDelete.mockClear();
  mockDeleteWhere.mockClear();
  mockSelect.mockClear();
  mockFrom.mockClear();
  mockSelectWhere.mockClear();
  mockGetDrizzle.mockClear();
  // Default: user lookup returns a row so the account delete proceeds.
  mockGet.mockResolvedValue({ id: 'u1' });
});

interface Ctx {
  locals: { user?: { email?: string; role?: string; name?: string } };
  request: Request;
}

function makeContext(overrides: Partial<Ctx['locals']> = {}): Ctx {
  return {
    locals: {
      user:
        'user' in overrides
          ? overrides.user
          : { email: 'sponsor@example.com', role: 'sponsor' },
    },
    request: new Request('http://localhost/portal/api/github/disconnect', { method: 'DELETE' }),
  };
}

describe('DELETE /portal/api/github/disconnect', () => {
  it('returns 401 when user has no email (AC-4)', async () => {
    const res = await DELETE(makeContext({ user: undefined }) as never);
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('returns 401 when user object is missing entirely (AC-4)', async () => {
    const res = await DELETE({
      locals: {},
      request: new Request('http://localhost/portal/api/github/disconnect', { method: 'DELETE' }),
    } as never);
    expect(res.status).toBe(401);
  });

  it('returns 403 when role is not sponsor (AC-4)', async () => {
    const res = await DELETE(
      makeContext({ user: { email: 'student@example.com', role: 'student' } }) as never,
    );
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(mockGetDrizzle).not.toHaveBeenCalled();
  });

  it('happy path: deletes both project_github_repos and account rows (AC-3, AC-7)', async () => {
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 2 } }) // project_github_repos
      .mockResolvedValueOnce({ meta: { changes: 1 } }); // account
    const res = await DELETE(makeContext() as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, removedLinks: 2 });
    // One delete chain per table (project_github_repos + account)
    expect(mockDelete).toHaveBeenCalledTimes(2);
    expect(mockRun).toHaveBeenCalledTimes(2);
    // One select chain to look up user.id
    expect(mockSelect).toHaveBeenCalledTimes(1);
  });

  it('returns count of removed links from project_github_repos delete (AC-3)', async () => {
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 5 } })
      .mockResolvedValueOnce({ meta: { changes: 1 } });
    const res = await DELETE(makeContext() as never);
    const body = await res.json();
    expect(body.removedLinks).toBe(5);
  });

  it('idempotent: returns success with 0 removedLinks on second call (AC-11e)', async () => {
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 0 } })
      .mockResolvedValueOnce({ meta: { changes: 0 } });
    const res = await DELETE(makeContext() as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, removedLinks: 0 });
  });

  it('skips account delete when user row not found (idempotent guard)', async () => {
    mockGet.mockResolvedValueOnce(null);
    mockRun.mockResolvedValueOnce({ meta: { changes: 0 } });
    const res = await DELETE(makeContext() as never);
    expect(res.status).toBe(200);
    expect(mockRun).toHaveBeenCalledTimes(1);
  });

  it('returns 500 when project_github_repos delete throws (AC-8)', async () => {
    mockRun.mockRejectedValueOnce(new Error('D1 unavailable'));
    const res = await DELETE(makeContext() as never);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  it('returns 500 when account delete throws (AC-8)', async () => {
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 1 } })
      .mockRejectedValueOnce(new Error('account delete failed'));
    const res = await DELETE(makeContext() as never);
    expect(res.status).toBe(500);
  });

  it('falls back to 0 when D1 driver omits meta.changes', async () => {
    mockRun.mockResolvedValueOnce({}).mockResolvedValueOnce({});
    const res = await DELETE(makeContext() as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.removedLinks).toBe(0);
  });
});

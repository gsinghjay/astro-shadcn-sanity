import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockDelete,
  mockDeleteWhere,
  mockRun,
  mockSelect,
  mockFrom,
  mockSelectWhere,
  mockGet,
  mockGetDrizzle,
  mockKvDelete,
  mockEnv,
} = vi.hoisted(() => {
  const mockRun = vi.fn();
  const mockGet = vi.fn();
  const mockDeleteWhere = vi.fn(() => ({ run: mockRun }));
  const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));
  const mockSelectWhere = vi.fn(() => ({ get: mockGet }));
  const mockFrom = vi.fn(() => ({ where: mockSelectWhere }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));
  const mockGetDrizzle = vi.fn(() => ({ delete: mockDelete, select: mockSelect }));
  const mockKvDelete = vi.fn(() => Promise.resolve());
  const mockEnv: { SESSION_CACHE?: { delete: typeof mockKvDelete } } = {
    SESSION_CACHE: { delete: mockKvDelete },
  };
  return {
    mockDelete,
    mockDeleteWhere,
    mockRun,
    mockSelect,
    mockFrom,
    mockSelectWhere,
    mockGet,
    mockGetDrizzle,
    mockKvDelete,
    mockEnv,
  };
});

vi.mock('@/lib/db', () => ({
  getDrizzle: mockGetDrizzle,
}));

vi.mock('cloudflare:workers', () => ({
  get env() {
    return mockEnv;
  },
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
  mockKvDelete.mockClear();
  mockEnv.SESSION_CACHE = { delete: mockKvDelete };
  // Default: user lookup returns a row so the account delete proceeds.
  mockGet.mockResolvedValue({ id: 'u1' });
});

/** Serialize a drizzle SQL predicate to a string for assertion. drizzle's SQL
 *  objects contain circular refs (column → table → column), so JSON.stringify
 *  with a WeakSet-based replacer is the simplest way to flatten them. */
function serializeDrizzlePredicate(value: unknown): string {
  const seen = new WeakSet();
  return JSON.stringify(value, (_key, val) => {
    if (typeof val === 'object' && val !== null) {
      if (seen.has(val)) return '[Circular]';
      seen.add(val);
    }
    return val;
  });
}

interface Ctx {
  locals: { user?: { email?: string; role?: string; name?: string } };
  request: Request;
}

function makeContext(
  overrides: Partial<Ctx['locals']> = {},
  cookieHeader?: string,
): Ctx {
  const headers = new Headers();
  if (cookieHeader) headers.set('cookie', cookieHeader);
  return {
    locals: {
      user:
        'user' in overrides
          ? overrides.user
          : { email: 'sponsor@example.com', role: 'sponsor' },
    },
    request: new Request('http://localhost/portal/api/github/disconnect', {
      method: 'DELETE',
      headers,
    }),
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

  it('account-delete predicate scopes to userId AND providerId=github (regression guard)', async () => {
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 0 } })
      .mockResolvedValueOnce({ meta: { changes: 1 } });
    await DELETE(makeContext() as never);
    // Two delete().where(...) chains: [0] = project_github_repos, [1] = account
    const accountWherePredicate = mockDeleteWhere.mock.calls[1]?.[0];
    expect(accountWherePredicate).toBeDefined();
    const serialized = serializeDrizzlePredicate(accountWherePredicate);
    expect(serialized).toContain('user_id');
    expect(serialized).toContain('provider_id');
    // Confirm the literal 'github' value flows into the predicate.
    expect(serialized).toContain('github');
    // Confirm the resolved user.id (mocked as 'u1') flows in too.
    expect(serialized).toContain('u1');
  });

  it('AC-7: project_github_repos delete is scoped to the sponsor email (lowercased)', async () => {
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 3 } })
      .mockResolvedValueOnce({ meta: { changes: 1 } });
    await DELETE(
      makeContext({ user: { email: 'Sponsor@Example.COM', role: 'sponsor' } }) as never,
    );
    const reposWherePredicate = mockDeleteWhere.mock.calls[0]?.[0];
    const serialized = serializeDrizzlePredicate(reposWherePredicate);
    expect(serialized).toContain('user_email');
    expect(serialized).toContain('sponsor@example.com');
    expect(serialized).not.toContain('Sponsor@Example.COM');
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

  it('invalidates the KV session cache on success when cookie carries a session token', async () => {
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 1 } })
      .mockResolvedValueOnce({ meta: { changes: 1 } });
    const res = await DELETE(
      makeContext({}, 'better-auth.session_token=abc123; other=value') as never,
    );
    expect(res.status).toBe(200);
    expect(mockKvDelete).toHaveBeenCalledWith('abc123');
  });

  it('handles missing SESSION_CACHE binding gracefully', async () => {
    mockEnv.SESSION_CACHE = undefined;
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 1 } })
      .mockResolvedValueOnce({ meta: { changes: 1 } });
    const res = await DELETE(
      makeContext({}, 'better-auth.session_token=abc123') as never,
    );
    expect(res.status).toBe(200);
    expect(mockKvDelete).not.toHaveBeenCalled();
  });

  it('returns 500 with generic message when project_github_repos delete throws (AC-8)', async () => {
    mockRun.mockRejectedValueOnce(new Error('D1 internal: SQLITE_CORRUPT at offset 0xdead'));
    const res = await DELETE(makeContext() as never);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Disconnect failed');
    // Driver error text must NOT leak.
    expect(body.error).not.toContain('SQLITE_CORRUPT');
  });

  it('returns 500 with generic message when account delete throws (AC-8)', async () => {
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 1 } })
      .mockRejectedValueOnce(new Error('account delete failed: foreign key constraint'));
    const res = await DELETE(makeContext() as never);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe('Disconnect failed');
    expect(body.error).not.toContain('foreign key');
  });

  it('falls back to 0 when D1 driver omits meta.changes', async () => {
    mockRun.mockResolvedValueOnce({}).mockResolvedValueOnce({});
    const res = await DELETE(makeContext() as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.removedLinks).toBe(0);
  });
});

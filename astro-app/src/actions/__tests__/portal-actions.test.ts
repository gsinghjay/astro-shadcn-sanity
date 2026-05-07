import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionError } from 'astro:actions';

// ── Hoisted mocks ────────────────────────────────────────────────────────
const {
  // db / drizzle
  mockRun,
  mockGet,
  mockAll,
  mockDeleteWhere,
  mockDelete,
  mockSelectWhere,
  mockSelectFrom,
  mockSelect,
  mockInsertValues,
  mockInsert,
  mockUpdateWhere,
  mockUpdateSet,
  mockUpdate,
  mockGetDrizzle,
  // KV / cloudflare:workers
  mockKvDelete,
  mockEnv,
  // sanity
  mockLoadQuery,
  // github
  mockGetGitHubToken,
  mockGetUserRepos,
  // middleware
  mockExtractSessionToken,
  mockHashToken,
} = vi.hoisted(() => {
  const mockRun = vi.fn();
  const mockGet = vi.fn();
  const mockAll = vi.fn();
  const mockDeleteWhere = vi.fn(() => ({ run: mockRun }));
  const mockDelete = vi.fn(() => ({ where: mockDeleteWhere }));
  const mockSelectWhere = vi.fn(() => ({ get: mockGet, all: mockAll }));
  const mockSelectFrom = vi.fn(() => ({ where: mockSelectWhere }));
  const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));
  const mockInsertValues = vi.fn(() => Promise.resolve());
  const mockInsert = vi.fn(() => ({ values: mockInsertValues }));
  const mockUpdateWhere = vi.fn(() => Promise.resolve());
  const mockUpdateSet = vi.fn(() => ({ where: mockUpdateWhere }));
  const mockUpdate = vi.fn(() => ({ set: mockUpdateSet }));
  const mockGetDrizzle = vi.fn(() => ({
    select: mockSelect,
    delete: mockDelete,
    insert: mockInsert,
    update: mockUpdate,
  }));

  const mockKvDelete = vi.fn(() => Promise.resolve());
  const mockEnv: { SESSION_CACHE?: { delete: typeof mockKvDelete } } = {
    SESSION_CACHE: { delete: mockKvDelete },
  };

  const mockLoadQuery = vi.fn();
  const mockGetGitHubToken = vi.fn();
  const mockGetUserRepos = vi.fn();
  const mockExtractSessionToken = vi.fn();
  const mockHashToken = vi.fn();

  return {
    mockRun,
    mockGet,
    mockAll,
    mockDeleteWhere,
    mockDelete,
    mockSelectWhere,
    mockSelectFrom,
    mockSelect,
    mockInsertValues,
    mockInsert,
    mockUpdateWhere,
    mockUpdateSet,
    mockUpdate,
    mockGetDrizzle,
    mockKvDelete,
    mockEnv,
    mockLoadQuery,
    mockGetGitHubToken,
    mockGetUserRepos,
    mockExtractSessionToken,
    mockHashToken,
  };
});

vi.mock('@/lib/db', () => ({ getDrizzle: mockGetDrizzle }));

vi.mock('cloudflare:workers', () => ({
  get env() {
    return mockEnv;
  },
}));

vi.mock('@/lib/sanity', () => ({
  loadQuery: mockLoadQuery,
  getSiteParams: () => ({ site: '' }),
  getSponsorAgreementRev: vi.fn(() => Promise.resolve(null)),
  SPONSOR_BY_EMAIL_QUERY: 'SPONSOR_BY_EMAIL_QUERY',
  SPONSOR_PROJECTS_API_QUERY: 'SPONSOR_PROJECTS_API_QUERY',
  EVENTS_BY_MONTH_QUERY: 'EVENTS_BY_MONTH_QUERY',
}));

vi.mock('@/lib/github', () => ({
  getGitHubToken: mockGetGitHubToken,
  getUserRepos: mockGetUserRepos,
}));

vi.mock('@/middleware', () => ({
  extractSessionToken: mockExtractSessionToken,
  hashToken: mockHashToken,
  normalizeEmail: (e: string) => e.trim().toLowerCase(),
}));

// Action handlers must be imported AFTER mocks are declared.
import { server } from '../index';

// SHA-256 hex of 'abc123' (matches middleware.ts hashToken output for the
// raw token used in the cookie-bearing tests in this suite).
const HASH_ABC123 = '6ca13d52ca70c883e0f0bb101e425a89e8624de51db2d2392593af6a84118090';

// Symbol that defineAction's safeServerHandler / orThrow checks via
// `Reflect.get(ctx, ACTION_API_CONTEXT_SYMBOL) === true`. Without this,
// `.orThrow` would refuse to run.
const ACTION_API_CONTEXT_SYMBOL = Symbol.for('astro.actionAPIContext');

interface CtxOverrides {
  user?: { email?: string; role?: string; name?: string } | undefined;
  cookie?: string;
  url?: string;
}

function makeCtx(overrides: CtxOverrides = {}) {
  const headers = new Headers();
  if (overrides.cookie) headers.set('cookie', overrides.cookie);
  const ctx = {
    locals: {
      user:
        'user' in overrides
          ? overrides.user
          : { email: 'sponsor@example.com', role: 'sponsor', name: 'Test' },
    },
    request: new Request(overrides.url ?? 'http://localhost/_actions/test', {
      method: 'POST',
      headers,
    }),
  };
  Reflect.set(ctx, ACTION_API_CONTEXT_SYMBOL, true);
  return ctx;
}

/**
 * Invoke an action handler bypassing the safe-result wrapper so ActionError
 * surfaces synchronously via rejection instead of being captured into a
 * SafeResult { error }. `.orThrow` on the action client does this — it skips
 * the safeServerHandler envelope and lets thrown ActionError propagate.
 */
function invoke<TInput>(
  action: { orThrow: (input: TInput) => Promise<unknown> },
  input: TInput,
  ctx: ReturnType<typeof makeCtx>,
): Promise<unknown> {
  return (action.orThrow as (this: unknown, input: TInput) => Promise<unknown>).call(ctx, input);
}

/** Drizzle SQL predicate flatten (circular-ref safe) — same shape as disconnect.test.ts:75 */
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

beforeEach(() => {
  mockRun.mockReset();
  mockGet.mockReset();
  mockAll.mockReset();
  mockDeleteWhere.mockClear();
  mockDelete.mockClear();
  mockSelectWhere.mockClear();
  mockSelectFrom.mockClear();
  mockSelect.mockClear();
  mockInsertValues.mockClear();
  mockInsert.mockClear();
  mockUpdateWhere.mockClear();
  mockUpdateSet.mockClear();
  mockUpdate.mockClear();
  mockGetDrizzle.mockClear();

  mockKvDelete.mockClear();
  mockEnv.SESSION_CACHE = { delete: mockKvDelete };

  mockLoadQuery.mockReset();
  mockGetGitHubToken.mockReset();
  mockGetUserRepos.mockReset();
  mockExtractSessionToken.mockReset();
  mockHashToken.mockReset();

  // Default user lookup returns a row so disconnectGithub's account delete proceeds.
  mockGet.mockResolvedValue({ id: 'u1' });
});

// ── getSponsorProjects (AC 3) ────────────────────────────────────────────
describe('getSponsorProjects', () => {
  it('returns 401 when user has no email', async () => {
    await expect(
      invoke(server.getSponsorProjects, {}, makeCtx({ user: undefined })),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('returns 401 when user object is missing entirely', async () => {
    const ctx = makeCtx();
    ctx.locals.user = undefined;
    await expect(invoke(server.getSponsorProjects, {}, ctx)).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it('happy path: no sponsorId — looks up sponsor by email then loads projects', async () => {
    mockLoadQuery
      .mockResolvedValueOnce({ result: { _id: 'sponsor-1' } })
      .mockResolvedValueOnce({ result: [{ _id: 'p1' }, { _id: 'p2' }] });
    const out = await invoke(server.getSponsorProjects, {}, makeCtx());
    expect(out).toEqual([{ _id: 'p1' }, { _id: 'p2' }]);
    expect(mockLoadQuery).toHaveBeenCalledTimes(2);
    expect(mockLoadQuery.mock.calls[0]?.[0].query).toBe('SPONSOR_BY_EMAIL_QUERY');
    expect(mockLoadQuery.mock.calls[1]?.[0].query).toBe('SPONSOR_PROJECTS_API_QUERY');
    expect(mockLoadQuery.mock.calls[1]?.[0].params).toMatchObject({ sponsorId: 'sponsor-1' });
  });

  it('returns NOT_FOUND when no sponsor is found for this email', async () => {
    mockLoadQuery.mockResolvedValueOnce({ result: null });
    await expect(invoke(server.getSponsorProjects, {}, makeCtx())).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('with sponsorId — validates sponsor email match and returns projects', async () => {
    mockLoadQuery
      .mockResolvedValueOnce({ result: { _id: 'sponsor-1' } })
      .mockResolvedValueOnce({ result: [{ _id: 'p1' }] });
    const out = await invoke(server.getSponsorProjects, { sponsorId: 'sponsor-1' }, makeCtx());
    expect(out).toEqual([{ _id: 'p1' }]);
  });

  it('with sponsorId — FORBIDDEN when sponsor._id does not match', async () => {
    mockLoadQuery.mockResolvedValueOnce({ result: { _id: 'sponsor-1' } });
    await expect(
      invoke(server.getSponsorProjects, { sponsorId: 'sponsor-2' }, makeCtx()),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('coerces null result into empty array', async () => {
    mockLoadQuery
      .mockResolvedValueOnce({ result: { _id: 'sponsor-1' } })
      .mockResolvedValueOnce({ result: null });
    const out = await invoke(server.getSponsorProjects, {}, makeCtx());
    expect(out).toEqual([]);
  });
});

// ── getSponsorEvents (AC 4) ──────────────────────────────────────────────
describe('getSponsorEvents', () => {
  it('returns 401 when user has no email', async () => {
    await expect(
      invoke(
        server.getSponsorEvents,
        { start: '2026-01-01', end: '2026-01-31' },
        makeCtx({ user: undefined }),
      ),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('strips Temporal IANA suffix (e.g. "[UTC]") from both bounds', async () => {
    mockLoadQuery.mockResolvedValueOnce({ result: [] });
    await invoke(
      server.getSponsorEvents,
      { start: '2026-01-01T00:00:00Z[UTC]', end: '2026-01-31T23:59:59Z[UTC]' },
      makeCtx(),
    );
    const params = mockLoadQuery.mock.calls[0]?.[0].params;
    expect(params.monthStart).toBe('2026-01-01T00:00:00Z');
    expect(params.monthEnd).toBe('2026-01-31T23:59:59Z');
  });

  it('returns BAD_REQUEST when start is unparseable', async () => {
    await expect(
      invoke(server.getSponsorEvents, { start: 'not-a-date', end: '2026-01-31' }, makeCtx()),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('returns BAD_REQUEST when end is unparseable', async () => {
    await expect(
      invoke(server.getSponsorEvents, { start: '2026-01-01', end: 'still-not-a-date' }, makeCtx()),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('happy path: returns events for the supplied range', async () => {
    mockLoadQuery.mockResolvedValueOnce({ result: [{ _id: 'e1' }] });
    const out = await invoke(
      server.getSponsorEvents,
      { start: '2026-01-01', end: '2026-01-31' },
      makeCtx(),
    );
    expect(out).toEqual([{ _id: 'e1' }]);
    expect(mockLoadQuery.mock.calls[0]?.[0].query).toBe('EVENTS_BY_MONTH_QUERY');
  });

  it('coerces null result into empty array', async () => {
    mockLoadQuery.mockResolvedValueOnce({ result: null });
    const out = await invoke(
      server.getSponsorEvents,
      { start: '2026-01-01', end: '2026-01-31' },
      makeCtx(),
    );
    expect(out).toEqual([]);
  });
});

// ── getMe (AC 5) ─────────────────────────────────────────────────────────
describe('getMe', () => {
  it('returns the session user when present', async () => {
    const out = await invoke(server.getMe, {}, makeCtx());
    expect(out).toMatchObject({ email: 'sponsor@example.com', role: 'sponsor' });
  });

  it('returns null when no user is on locals — does not throw', async () => {
    const out = await invoke(server.getMe, {}, makeCtx({ user: undefined }));
    expect(out).toBeNull();
  });
});

// ── getGithubLinks (AC 6) ────────────────────────────────────────────────
describe('getGithubLinks', () => {
  it('returns 401 when user has no email', async () => {
    await expect(
      invoke(server.getGithubLinks, {}, makeCtx({ user: undefined })),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('returns 403 when role is not sponsor (NEW symmetry check vs POST/DELETE)', async () => {
    await expect(
      invoke(
        server.getGithubLinks,
        {},
        makeCtx({ user: { email: 'student@example.com', role: 'student' } }),
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('happy path: queries projectGithubRepos by lowercased email', async () => {
    mockAll.mockResolvedValueOnce([{ id: 'r1', userEmail: 'sponsor@example.com' }]);
    const out = await invoke(
      server.getGithubLinks,
      {},
      makeCtx({ user: { email: 'Sponsor@Example.COM', role: 'sponsor' } }),
    );
    expect(out).toEqual([{ id: 'r1', userEmail: 'sponsor@example.com' }]);
    const wherePredicate = mockSelectWhere.mock.calls[0]?.[0];
    const serialized = serializeDrizzlePredicate(wherePredicate);
    expect(serialized).toContain('user_email');
    expect(serialized).toContain('sponsor@example.com');
    expect(serialized).not.toContain('Sponsor@Example.COM');
  });

  it('returns empty array when no rows match', async () => {
    mockAll.mockResolvedValueOnce([]);
    const out = await invoke(server.getGithubLinks, {}, makeCtx());
    expect(out).toEqual([]);
  });
});

// ── linkGithubRepo (AC 7) ────────────────────────────────────────────────
describe('linkGithubRepo', () => {
  it('returns 401 when user has no email', async () => {
    await expect(
      invoke(
        server.linkGithubRepo,
        { projectSanityId: 'p1', githubRepo: 'owner/repo' },
        makeCtx({ user: undefined }),
      ),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('returns 403 when role is not sponsor', async () => {
    await expect(
      invoke(
        server.linkGithubRepo,
        { projectSanityId: 'p1', githubRepo: 'owner/repo' },
        makeCtx({ user: { email: 'student@example.com', role: 'student' } }),
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('rejects malformed githubRepo (not owner/repo) with BAD_REQUEST', async () => {
    await expect(
      invoke(
        server.linkGithubRepo,
        { projectSanityId: 'p1', githubRepo: 'no-slash' },
        makeCtx(),
      ),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('rejects empty projectSanityId with BAD_REQUEST', async () => {
    await expect(
      invoke(
        server.linkGithubRepo,
        { projectSanityId: '', githubRepo: 'owner/repo' },
        makeCtx(),
      ),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });

  it('insert path: creates a new row with crypto.randomUUID() id and lowercased email', async () => {
    mockGet
      .mockResolvedValueOnce(null) // existing lookup
      .mockResolvedValueOnce({ id: 'new-id', userEmail: 'sponsor@example.com' }); // post-insert read
    const out = await invoke(
      server.linkGithubRepo,
      { projectSanityId: 'p1', githubRepo: 'owner/repo' },
      makeCtx({ user: { email: 'Sponsor@Example.COM', role: 'sponsor' } }),
    );
    expect(out).toMatchObject({ userEmail: 'sponsor@example.com' });
    expect(mockInsert).toHaveBeenCalledTimes(1);
    const inserted = mockInsertValues.mock.calls[0]?.[0];
    expect(inserted).toMatchObject({
      userEmail: 'sponsor@example.com',
      projectSanityId: 'p1',
      githubRepo: 'owner/repo',
    });
    expect(typeof inserted.id).toBe('string');
    expect(inserted.id.length).toBeGreaterThan(0);
  });

  it('update path: existing row → UPDATE, no INSERT', async () => {
    mockGet
      .mockResolvedValueOnce({ id: 'existing-id', userEmail: 'sponsor@example.com' })
      .mockResolvedValueOnce({ id: 'existing-id', githubRepo: 'owner/repo-new' });
    const out = await invoke(
      server.linkGithubRepo,
      { projectSanityId: 'p1', githubRepo: 'owner/repo-new' },
      makeCtx(),
    );
    expect(out).toMatchObject({ id: 'existing-id', githubRepo: 'owner/repo-new' });
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockInsert).not.toHaveBeenCalled();
    const setPayload = mockUpdateSet.mock.calls[0]?.[0];
    expect(setPayload).toMatchObject({ githubRepo: 'owner/repo-new' });
    expect(setPayload.linkedAt).toBeInstanceOf(Date);
  });
});

// ── unlinkGithubRepo (AC 8) ──────────────────────────────────────────────
describe('unlinkGithubRepo', () => {
  it('returns 401 when user has no email', async () => {
    await expect(
      invoke(server.unlinkGithubRepo, { projectSanityId: 'p1' }, makeCtx({ user: undefined })),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('returns 403 when role is not sponsor', async () => {
    await expect(
      invoke(
        server.unlinkGithubRepo,
        { projectSanityId: 'p1' },
        makeCtx({ user: { email: 'student@example.com', role: 'student' } }),
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('happy path: deletes scoped to userEmail AND projectSanityId', async () => {
    const out = await invoke(
      server.unlinkGithubRepo,
      { projectSanityId: 'p1' },
      makeCtx({ user: { email: 'Sponsor@Example.COM', role: 'sponsor' } }),
    );
    expect(out).toEqual({ success: true });
    expect(mockDelete).toHaveBeenCalledTimes(1);
    const wherePredicate = mockDeleteWhere.mock.calls[0]?.[0];
    const serialized = serializeDrizzlePredicate(wherePredicate);
    expect(serialized).toContain('user_email');
    expect(serialized).toContain('project_sanity_id');
    expect(serialized).toContain('sponsor@example.com');
    expect(serialized).toContain('p1');
  });

  it('rejects empty projectSanityId with BAD_REQUEST', async () => {
    await expect(
      invoke(server.unlinkGithubRepo, { projectSanityId: '' }, makeCtx()),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
  });
});

// ── getGithubRepos (AC 9) ────────────────────────────────────────────────
describe('getGithubRepos', () => {
  it('returns 401 when user has no email', async () => {
    await expect(
      invoke(server.getGithubRepos, {}, makeCtx({ user: undefined })),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('maps "no-github-account" → NOT_FOUND', async () => {
    mockGetGitHubToken.mockResolvedValueOnce({ error: 'no-github-account' });
    await expect(invoke(server.getGithubRepos, {}, makeCtx())).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('maps "missing-scope" → FORBIDDEN', async () => {
    mockGetGitHubToken.mockResolvedValueOnce({ error: 'missing-scope' });
    await expect(invoke(server.getGithubRepos, {}, makeCtx())).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('maps "token-expired" → FORBIDDEN', async () => {
    mockGetGitHubToken.mockResolvedValueOnce({ error: 'token-expired' });
    await expect(invoke(server.getGithubRepos, {}, makeCtx())).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  it('happy path: returns repos from getUserRepos', async () => {
    mockGetGitHubToken.mockResolvedValueOnce({ token: 't' });
    mockGetUserRepos.mockResolvedValueOnce({
      data: [{ full_name: 'a/b' }],
      error: null,
    });
    const out = await invoke(server.getGithubRepos, {}, makeCtx());
    expect(out).toEqual([{ full_name: 'a/b' }]);
  });

  it('maps GitHub API failure → BAD_GATEWAY', async () => {
    mockGetGitHubToken.mockResolvedValueOnce({ token: 't' });
    mockGetUserRepos.mockResolvedValueOnce({ data: null, error: 'GitHub API 500' });
    await expect(invoke(server.getGithubRepos, {}, makeCtx())).rejects.toMatchObject({
      code: 'BAD_GATEWAY',
    });
  });
});

// ── disconnectGithub (AC 10) ─────────────────────────────────────────────
// Migrated from astro-app/src/pages/portal/api/github/__tests__/disconnect.test.ts
// (13 cases). Status-code assertions converted to ActionError.code; body.error
// text checks converted to error.message; predicate-shape and KV-mock assertions
// preserved byte-equivalent.
describe('disconnectGithub', () => {
  it('returns 401 when user has no email (AC-4)', async () => {
    await expect(
      invoke(server.disconnectGithub, {}, makeCtx({ user: undefined })),
    ).rejects.toBeInstanceOf(ActionError);
    await expect(
      invoke(server.disconnectGithub, {}, makeCtx({ user: undefined })),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('returns 401 when user object is missing entirely (AC-4)', async () => {
    const ctx = makeCtx();
    ctx.locals.user = undefined;
    await expect(invoke(server.disconnectGithub, {}, ctx)).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  it('returns 403 when role is not sponsor (AC-4)', async () => {
    await expect(
      invoke(
        server.disconnectGithub,
        {},
        makeCtx({ user: { email: 'student@example.com', role: 'student' } }),
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    expect(mockGetDrizzle).not.toHaveBeenCalled();
  });

  it('happy path: deletes both project_github_repos and account rows (AC-3, AC-7)', async () => {
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 2 } }) // project_github_repos
      .mockResolvedValueOnce({ meta: { changes: 1 } }); // account
    const out = await invoke(server.disconnectGithub, {}, makeCtx());
    expect(out).toEqual({ success: true, removedLinks: 2 });
    expect(mockDelete).toHaveBeenCalledTimes(2);
    expect(mockRun).toHaveBeenCalledTimes(2);
    expect(mockSelect).toHaveBeenCalledTimes(1);
  });

  it('account-delete predicate scopes to userId AND providerId=github (regression guard)', async () => {
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 0 } })
      .mockResolvedValueOnce({ meta: { changes: 1 } });
    await invoke(server.disconnectGithub, {}, makeCtx());
    const accountWherePredicate = mockDeleteWhere.mock.calls[1]?.[0];
    expect(accountWherePredicate).toBeDefined();
    const serialized = serializeDrizzlePredicate(accountWherePredicate);
    expect(serialized).toContain('user_id');
    expect(serialized).toContain('provider_id');
    expect(serialized).toContain('github');
    expect(serialized).toContain('u1');
  });

  it('AC-7: project_github_repos delete is scoped to the sponsor email (lowercased)', async () => {
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 3 } })
      .mockResolvedValueOnce({ meta: { changes: 1 } });
    await invoke(
      server.disconnectGithub,
      {},
      makeCtx({ user: { email: 'Sponsor@Example.COM', role: 'sponsor' } }),
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
    const out = (await invoke(server.disconnectGithub, {}, makeCtx())) as {
      removedLinks: number;
    };
    expect(out.removedLinks).toBe(5);
  });

  it('idempotent: returns success with 0 removedLinks on second call (AC-11e)', async () => {
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 0 } })
      .mockResolvedValueOnce({ meta: { changes: 0 } });
    const out = await invoke(server.disconnectGithub, {}, makeCtx());
    expect(out).toEqual({ success: true, removedLinks: 0 });
  });

  it('skips account delete when user row not found (idempotent guard)', async () => {
    mockGet.mockReset();
    mockGet.mockResolvedValueOnce(null);
    mockRun.mockResolvedValueOnce({ meta: { changes: 0 } });
    const out = await invoke(server.disconnectGithub, {}, makeCtx());
    expect(out).toMatchObject({ success: true });
    expect(mockRun).toHaveBeenCalledTimes(1);
  });

  it('invalidates the KV session cache on success when cookie carries a session token', async () => {
    mockExtractSessionToken.mockReturnValueOnce('abc123');
    mockHashToken.mockResolvedValueOnce(HASH_ABC123);
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 1 } })
      .mockResolvedValueOnce({ meta: { changes: 1 } });
    const out = await invoke(
      server.disconnectGithub,
      {},
      makeCtx({ cookie: 'better-auth.session_token=abc123; other=value' }),
    );
    expect(out).toMatchObject({ success: true });
    expect(mockKvDelete).toHaveBeenCalledWith(HASH_ABC123);
  });

  it('handles missing SESSION_CACHE binding gracefully', async () => {
    mockEnv.SESSION_CACHE = undefined;
    mockExtractSessionToken.mockReturnValueOnce('abc123');
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 1 } })
      .mockResolvedValueOnce({ meta: { changes: 1 } });
    const out = await invoke(
      server.disconnectGithub,
      {},
      makeCtx({ cookie: 'better-auth.session_token=abc123' }),
    );
    expect(out).toMatchObject({ success: true });
    expect(mockKvDelete).not.toHaveBeenCalled();
  });

  it('returns INTERNAL_SERVER_ERROR with generic message when project_github_repos delete throws (AC-8)', async () => {
    mockRun.mockRejectedValueOnce(new Error('D1 internal: SQLITE_CORRUPT at offset 0xdead'));
    let caught: unknown;
    try {
      await invoke(server.disconnectGithub, {}, makeCtx());
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(ActionError);
    expect((caught as ActionError).code).toBe('INTERNAL_SERVER_ERROR');
    expect((caught as ActionError).message).toBe('Disconnect failed');
    expect((caught as ActionError).message).not.toContain('SQLITE_CORRUPT');
  });

  it('returns INTERNAL_SERVER_ERROR with generic message when account delete throws (AC-8)', async () => {
    mockRun
      .mockResolvedValueOnce({ meta: { changes: 1 } })
      .mockRejectedValueOnce(new Error('account delete failed: foreign key constraint'));
    let caught: unknown;
    try {
      await invoke(server.disconnectGithub, {}, makeCtx());
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(ActionError);
    expect((caught as ActionError).code).toBe('INTERNAL_SERVER_ERROR');
    expect((caught as ActionError).message).toBe('Disconnect failed');
    expect((caught as ActionError).message).not.toContain('foreign key');
  });

  it('falls back to 0 when D1 driver omits meta.changes', async () => {
    mockRun.mockResolvedValueOnce({}).mockResolvedValueOnce({});
    const out = (await invoke(server.disconnectGithub, {}, makeCtx())) as {
      removedLinks: number;
    };
    expect(out.removedLinks).toBe(0);
  });
});

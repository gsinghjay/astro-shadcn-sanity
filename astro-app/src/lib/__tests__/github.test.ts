import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Mock Drizzle chain ──

const mockGet = vi.fn();
const mockWhere = vi.fn().mockReturnValue({ get: mockGet });
const mockInnerJoin = vi.fn().mockReturnValue({ where: mockWhere });
const mockFrom = vi.fn().mockReturnValue({ innerJoin: mockInnerJoin });
const mockSelect = vi.fn().mockReturnValue({ from: mockFrom });
const mockDb = { select: mockSelect } as any;

// ── Mock fetch ──

const originalFetch = globalThis.fetch;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// ── Import module under test ──

import {
  getGitHubToken,
  parseGitHubRepo,
  getUserRepos,
  getRepoOverview,
  getOpenIssues,
  getOpenPullRequests,
  getReleases,
  getAllGitHubData,
} from '@/lib/github';

// ── parseGitHubRepo ──

describe('parseGitHubRepo()', () => {
  it('splits owner/repo correctly', () => {
    expect(parseGitHubRepo('octocat/Hello-World')).toEqual({
      owner: 'octocat',
      repo: 'Hello-World',
    });
  });

  it('handles org/repo format', () => {
    expect(parseGitHubRepo('my-org/my-repo')).toEqual({
      owner: 'my-org',
      repo: 'my-repo',
    });
  });
});

// ── getGitHubToken ──

describe('getGitHubToken()', () => {
  it('returns token when account exists with repo scope', async () => {
    mockGet.mockResolvedValue({ accessToken: 'ghp_abc123', scope: 'repo,user' });
    const result = await getGitHubToken(mockDb, 'test@example.com');
    expect(result).toEqual({ token: 'ghp_abc123' });
  });

  it('returns no-github-account when no account found', async () => {
    mockGet.mockResolvedValue(null);
    const result = await getGitHubToken(mockDb, 'test@example.com');
    expect(result).toEqual({ error: 'no-github-account' });
  });

  it('returns no-github-account when accessToken is null', async () => {
    mockGet.mockResolvedValue({ accessToken: null, scope: 'repo' });
    const result = await getGitHubToken(mockDb, 'test@example.com');
    expect(result).toEqual({ error: 'no-github-account' });
  });

  it('returns missing-scope when scope does not include repo', async () => {
    mockGet.mockResolvedValue({ accessToken: 'ghp_abc123', scope: 'user' });
    const result = await getGitHubToken(mockDb, 'test@example.com');
    expect(result).toEqual({ error: 'missing-scope' });
  });

  it('returns missing-scope when scope is null', async () => {
    mockGet.mockResolvedValue({ accessToken: 'ghp_abc123', scope: null });
    const result = await getGitHubToken(mockDb, 'test@example.com');
    expect(result).toEqual({ error: 'missing-scope' });
  });
});

// ── getUserRepos ──

describe('getUserRepos()', () => {
  it('returns repos on success', async () => {
    const mockRepos = [{ full_name: 'org/repo', description: 'Test', private: false, updated_at: '2024-01-01' }];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockRepos),
    });

    const result = await getUserRepos('ghp_token');
    expect(result).toEqual({ data: mockRepos, error: null });
  });

  it('returns error on non-ok response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    const result = await getUserRepos('bad_token');
    expect(result.data).toBeNull();
    expect(result.error).toContain('401');
  });

  it('returns error on network failure', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await getUserRepos('ghp_token');
    expect(result.data).toBeNull();
    expect(result.error).toBe('Network error');
  });
});

// ── getRepoOverview ──

describe('getRepoOverview()', () => {
  it('returns repo overview on success', async () => {
    const overview = {
      full_name: 'org/repo',
      description: 'A repo',
      stargazers_count: 42,
      forks_count: 10,
      open_issues_count: 5,
      language: 'TypeScript',
      pushed_at: '2024-06-01T00:00:00Z',
    };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(overview),
    });

    const result = await getRepoOverview({ token: 'tok', owner: 'org', repo: 'repo' });
    expect(result).toEqual({ data: overview, error: null });
  });
});

// ── getOpenIssues ──

describe('getOpenIssues()', () => {
  it('filters out pull requests from issues', async () => {
    const issues = [
      { number: 1, title: 'Bug', labels: [], assignees: [], created_at: '2024-01-01', comments: 0 },
      { number: 2, title: 'PR', labels: [], assignees: [], created_at: '2024-01-01', comments: 0, pull_request: {} },
      { number: 3, title: 'Feature', labels: [], assignees: [], created_at: '2024-01-01', comments: 0 },
    ];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(issues),
    });

    const result = await getOpenIssues({ token: 'tok', owner: 'org', repo: 'repo' });
    expect(result.data).toHaveLength(2);
    expect(result.data?.map(i => i.number)).toEqual([1, 3]);
  });
});

// ── getOpenPullRequests ──

describe('getOpenPullRequests()', () => {
  it('returns open PRs and filters merged from closed', async () => {
    const openPRs = [{ number: 10, title: 'Open PR', user: null, draft: false, created_at: '2024-01-01', merged_at: null, requested_reviewers: [] }];
    const closedPRs = [
      { number: 5, title: 'Merged', user: null, draft: false, created_at: '2024-01-01', merged_at: '2024-01-02', requested_reviewers: [] },
      { number: 6, title: 'Closed not merged', user: null, draft: false, created_at: '2024-01-01', merged_at: null, requested_reviewers: [] },
    ];
    globalThis.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(openPRs) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(closedPRs) });

    const result = await getOpenPullRequests({ token: 'tok', owner: 'org', repo: 'repo' });
    expect(result.data?.open).toHaveLength(1);
    expect(result.data?.recentlyMerged).toHaveLength(1);
    expect(result.data?.recentlyMerged[0].number).toBe(5);
  });
});

// ── getReleases ──

describe('getReleases()', () => {
  it('returns releases on success', async () => {
    const releases = [{ tag_name: 'v1.0.0', name: 'First Release', published_at: '2024-01-01', body: 'Notes' }];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(releases),
    });

    const result = await getReleases({ token: 'tok', owner: 'org', repo: 'repo' });
    expect(result).toEqual({ data: releases, error: null });
  });
});

// ── getAllGitHubData ──

describe('getAllGitHubData()', () => {
  it('returns results from all endpoints via Promise.allSettled', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const result = await getAllGitHubData({ token: 'tok', owner: 'org', repo: 'repo' });
    expect(result).toHaveProperty('overview');
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('pullRequests');
    expect(result).toHaveProperty('releases');
  });

  it('handles partial failures gracefully', async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      // First call (overview) succeeds, rest fail
      if (callCount === 1) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ full_name: 'org/repo', stargazers_count: 1, forks_count: 0, open_issues_count: 0, language: 'TS', pushed_at: null, description: null }) });
      }
      return Promise.resolve({ ok: false, status: 500, statusText: 'Server Error' });
    });

    const result = await getAllGitHubData({ token: 'tok', owner: 'org', repo: 'repo' });
    expect(result.overview.data).not.toBeNull();
    // Other sections may have errors but should not throw
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('pullRequests');
    expect(result).toHaveProperty('releases');
  });
});

// ── Timeout test ──

describe('GitHub API timeout', () => {
  it('returns timeout error when request takes too long', async () => {
    globalThis.fetch = vi.fn().mockImplementation(() =>
      new Promise((_, reject) => {
        const error = new DOMException('The operation was aborted', 'AbortError');
        setTimeout(() => reject(error), 10);
      }),
    );

    const result = await getUserRepos('ghp_token');
    expect(result.data).toBeNull();
    expect(result.error).toContain('timed out');
  });
});

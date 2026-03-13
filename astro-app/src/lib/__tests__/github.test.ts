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
  getCommitActivity,
  getContributors,
  getWorkflowRuns,
  getRecentCommits,
  getLanguages,
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

  it('throws on invalid format (no slash)', () => {
    expect(() => parseGitHubRepo('noslash')).toThrow('Invalid GitHub repo format');
  });

  it('throws on empty string', () => {
    expect(() => parseGitHubRepo('')).toThrow('Invalid GitHub repo format');
  });

  it('throws on too many slashes', () => {
    expect(() => parseGitHubRepo('a/b/c')).toThrow('Invalid GitHub repo format');
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

// ── getCommitActivity ──

describe('getCommitActivity()', () => {
  const config = { token: 'tok', owner: 'org', repo: 'repo' };

  it('returns last 12 weeks of commit activity', async () => {
    const weeklyData = Array.from({ length: 52 }, (_, i) => ({
      week: 1700000000 + i * 604800,
      total: i + 1,
      days: [0, 1, 2, 3, 4, 5, 0],
    }));
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(weeklyData),
    });

    const result = await getCommitActivity(config);
    expect(result.data).toHaveLength(12);
    // Should be the last 12 weeks
    expect(result.data![0].week).toBe(weeklyData[40].week);
    expect(result.error).toBeNull();
  });

  it('returns empty array when API returns empty', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const result = await getCommitActivity(config);
    expect(result.data).toEqual([]);
    expect(result.error).toBeNull();
  });

  it('handles 202 Accepted (stats being computed)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 202,
      statusText: 'Accepted',
    });

    const result = await getCommitActivity(config);
    expect(result.data).toBeNull();
    expect(result.error).toContain('being computed');
  });

  it('returns error on non-ok non-202 response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    });

    const result = await getCommitActivity(config);
    expect(result.data).toBeNull();
    expect(result.error).toContain('500');
  });
});

// ── getContributors ──

describe('getContributors()', () => {
  const config = { token: 'tok', owner: 'org', repo: 'repo' };

  it('returns contributors sorted by total commits descending', async () => {
    const contributors = [
      { author: { login: 'alice', avatar_url: 'https://a.com/alice.png' }, total: 50, weeks: [] },
      { author: { login: 'bob', avatar_url: 'https://a.com/bob.png' }, total: 100, weeks: [] },
    ];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(contributors),
    });

    const result = await getContributors(config);
    expect(result.data).toHaveLength(2);
    expect(result.data![0].author.login).toBe('bob');
    expect(result.data![1].author.login).toBe('alice');
    expect(result.error).toBeNull();
  });

  it('handles 202 Accepted (stats being computed)', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 202,
      statusText: 'Accepted',
    });

    const result = await getContributors(config);
    expect(result.data).toBeNull();
    expect(result.error).toContain('being computed');
  });
});

// ── getWorkflowRuns ──

describe('getWorkflowRuns()', () => {
  const config = { token: 'tok', owner: 'org', repo: 'repo' };

  it('returns workflow runs on success', async () => {
    const runs = {
      workflow_runs: [
        {
          id: 1,
          name: 'CI',
          status: 'completed',
          conclusion: 'success',
          head_branch: 'main',
          head_commit: { message: 'fix: something' },
          run_started_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:05:00Z',
          html_url: 'https://github.com/org/repo/actions/runs/1',
        },
      ],
    };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(runs),
    });

    const result = await getWorkflowRuns(config);
    expect(result.data).toHaveLength(1);
    expect(result.data![0].name).toBe('CI');
    expect(result.error).toBeNull();
  });

  it('returns empty array when no workflow runs', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ workflow_runs: [] }),
    });

    const result = await getWorkflowRuns(config);
    expect(result.data).toEqual([]);
    expect(result.error).toBeNull();
  });
});

// ── getRecentCommits ──

describe('getRecentCommits()', () => {
  const config = { token: 'tok', owner: 'org', repo: 'repo' };

  it('returns recent commits on success', async () => {
    const commits = [
      {
        sha: 'abc1234567890',
        commit: { message: 'feat: add feature\n\nDetailed description', author: { name: 'Alice', date: '2024-06-01T00:00:00Z' } },
        author: { login: 'alice', avatar_url: 'https://a.com/alice.png' },
        html_url: 'https://github.com/org/repo/commit/abc1234567890',
      },
    ];
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(commits),
    });

    const result = await getRecentCommits(config);
    expect(result.data).toHaveLength(1);
    expect(result.data![0].sha).toBe('abc1234567890');
    expect(result.error).toBeNull();
  });
});

// ── getLanguages ──

describe('getLanguages()', () => {
  const config = { token: 'tok', owner: 'org', repo: 'repo' };

  it('returns language data on success', async () => {
    const languages = { TypeScript: 50000, JavaScript: 30000, CSS: 10000 };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(languages),
    });

    const result = await getLanguages(config);
    expect(result.data).toEqual(languages);
    expect(result.error).toBeNull();
  });

  it('returns empty object for empty repo', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });

    const result = await getLanguages(config);
    expect(result.data).toEqual({});
    expect(result.error).toBeNull();
  });
});

// ── getAllGitHubData with extended fields ──

describe('getAllGitHubData() extended fields', () => {
  it('returns new fields alongside existing ones', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });

    const result = await getAllGitHubData({ token: 'tok', owner: 'org', repo: 'repo' });
    expect(result).toHaveProperty('commitActivity');
    expect(result).toHaveProperty('contributors');
    expect(result).toHaveProperty('workflowRuns');
    expect(result).toHaveProperty('recentCommits');
    expect(result).toHaveProperty('languages');
    // Existing fields still present
    expect(result).toHaveProperty('overview');
    expect(result).toHaveProperty('issues');
    expect(result).toHaveProperty('pullRequests');
    expect(result).toHaveProperty('releases');
  });

  it('handles partial failures for new endpoints', async () => {
    let callCount = 0;
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++;
      // First 4 calls (existing) succeed, next 5 (new) fail
      if (callCount <= 4) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve(callCount <= 1 ? { full_name: 'org/repo', stargazers_count: 1, forks_count: 0, open_issues_count: 0, language: 'TS', pushed_at: null, description: null } : []) });
      }
      return Promise.resolve({ ok: false, status: 500, statusText: 'Server Error' });
    });

    const result = await getAllGitHubData({ token: 'tok', owner: 'org', repo: 'repo' });
    // Existing fields should have data
    expect(result.overview.data).not.toBeNull();
    // New fields should have errors but not throw
    expect(result).toHaveProperty('commitActivity');
    expect(result).toHaveProperty('contributors');
    expect(result).toHaveProperty('workflowRuns');
    expect(result).toHaveProperty('recentCommits');
    expect(result).toHaveProperty('languages');
  });
});

// ── Helper function tests (for GitHubDashboard logic) ──

describe('Language percentage calculation', () => {
  it('calculates percentages correctly', () => {
    const languages = { TypeScript: 50000, JavaScript: 30000, CSS: 20000 };
    const total = Object.values(languages).reduce((s, b) => s + b, 0);
    const percentages = Object.entries(languages).map(([name, bytes]) => ({
      name,
      percentage: (bytes / total) * 100,
    }));
    expect(percentages[0]).toEqual({ name: 'TypeScript', percentage: 50 });
    expect(percentages[1]).toEqual({ name: 'JavaScript', percentage: 30 });
    expect(percentages[2]).toEqual({ name: 'CSS', percentage: 20 });
  });

  it('groups languages under 1% as "Other"', () => {
    const languages = { TypeScript: 99000, Shell: 500, Makefile: 300, Dockerfile: 200 };
    const total = Object.values(languages).reduce((s, b) => s + b, 0);
    const entries = Object.entries(languages)
      .map(([name, bytes]) => ({ name, percentage: (bytes / total) * 100 }))
      .sort((a, b) => b.percentage - a.percentage);

    const visible: Array<{ name: string; percentage: number }> = [];
    let otherPct = 0;
    for (const entry of entries) {
      if (entry.percentage >= 1) {
        visible.push(entry);
      } else {
        otherPct += entry.percentage;
      }
    }
    if (otherPct > 0) visible.push({ name: 'Other', percentage: otherPct });

    expect(visible.length).toBe(2); // TypeScript + Other
    expect(visible[0].name).toBe('TypeScript');
    expect(visible[1].name).toBe('Other');
    expect(visible[1].percentage).toBeGreaterThan(0);
    expect(visible[1].percentage).toBeLessThan(2);
  });
});

describe('Commit message first-line extraction', () => {
  it('extracts first line from multi-line message', () => {
    const message = 'feat: add feature\n\nDetailed description here';
    const firstLine = message.split('\n')[0];
    expect(firstLine).toBe('feat: add feature');
  });

  it('returns full message if single line', () => {
    const message = 'fix: quick bug fix';
    const firstLine = message.split('\n')[0];
    expect(firstLine).toBe('fix: quick bug fix');
  });

  it('handles empty message', () => {
    const message = '';
    const firstLine = message.split('\n')[0];
    expect(firstLine).toBe('');
  });
});

describe('Workflow run duration calculation', () => {
  it('calculates duration in minutes and seconds', () => {
    const startedAt = '2024-01-01T00:00:00Z';
    const updatedAt = '2024-01-01T00:02:34Z';
    const ms = new Date(updatedAt).getTime() - new Date(startedAt).getTime();
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const formatted = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    expect(formatted).toBe('2m 34s');
  });

  it('shows seconds only when under 1 minute', () => {
    const startedAt = '2024-01-01T00:00:00Z';
    const updatedAt = '2024-01-01T00:00:45Z';
    const ms = new Date(updatedAt).getTime() - new Date(startedAt).getTime();
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const formatted = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    expect(formatted).toBe('45s');
  });

  it('handles exact minute boundary', () => {
    const startedAt = '2024-01-01T00:00:00Z';
    const updatedAt = '2024-01-01T00:05:00Z';
    const ms = new Date(updatedAt).getTime() - new Date(startedAt).getTime();
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const formatted = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
    expect(formatted).toBe('5m 0s');
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

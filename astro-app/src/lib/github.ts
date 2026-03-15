/**
 * GitHub token retrieval (D1) + REST API utilities.
 * Server-side only — token is never exposed to client.
 */
import { eq, and } from 'drizzle-orm';
import { account, user } from './drizzle-schema';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type * as schema from './drizzle-schema';

// ── Types ────────────────────────────────────────────────────────────

export interface GitHubRepo {
  full_name: string;
  description: string | null;
  private: boolean;
  updated_at: string;
}

export interface RepoOverview {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  pushed_at: string | null;
}

export interface GitHubIssue {
  number: number;
  title: string;
  labels: Array<{ name: string; color: string }>;
  assignees: Array<{ login: string; avatar_url: string }>;
  created_at: string;
  comments: number;
  pull_request?: unknown;
}

export interface GitHubPullRequest {
  number: number;
  title: string;
  user: { login: string; avatar_url: string } | null;
  draft: boolean;
  created_at: string;
  merged_at: string | null;
  requested_reviewers: Array<{ login: string; avatar_url: string }>;
}

export interface GitHubRelease {
  tag_name: string;
  name: string | null;
  published_at: string | null;
  body_html?: string;
  body?: string;
}

export interface GitHubCommitActivity {
  week: number;
  total: number;
  days: number[];
}

export interface GitHubContributor {
  author: { login: string; avatar_url: string };
  total: number;
  weeks: Array<{ w: number; a: number; d: number; c: number }>;
}

export interface GitHubWorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  head_branch: string;
  head_commit: { message: string } | null;
  run_started_at: string;
  updated_at: string;
  html_url: string;
}

export interface GitHubCommit {
  sha: string;
  commit: { message: string; author: { name: string; date: string } };
  author: { login: string; avatar_url: string } | null;
  html_url: string;
}

export type GitHubLanguages = Record<string, number>;

export interface GitHubApiConfig {
  token: string;
  owner: string;
  repo: string;
}

export type GitHubResult<T> =
  | { data: T; error: null }
  | { data: T; error: string }   // partial success (e.g., pagination cut short)
  | { data: null; error: string };

export type GitHubTokenResult =
  | { token: string; error?: undefined }
  | { token?: undefined; error: 'no-github-account' | 'missing-scope' | 'token-expired' };

// ── Token Retrieval ──────────────────────────────────────────────────

/**
 * Retrieve the GitHub OAuth access token for a user from D1.
 * Returns the token if available, or an error code indicating the issue.
 */
export async function getGitHubToken(
  db: DrizzleD1Database<typeof schema>,
  email: string,
): Promise<GitHubTokenResult> {
  let result;
  try {
    result = await db
      .select({
        accessToken: account.accessToken,
        scope: account.scope,
        accessTokenExpiresAt: account.accessTokenExpiresAt,
      })
      .from(account)
      .innerJoin(user, eq(account.userId, user.id))
      .where(and(eq(user.email, email), eq(account.providerId, 'github')))
      .get();
  } catch {
    // D1 may not be available in dev mode (plain Astro dev server without wrangler)
    result = null;
  }

  if (!result?.accessToken) {
    // Dev mode fallback: set GITHUB_DEV_TOKEN in .env for local testing
    if (import.meta.env.DEV && import.meta.env.GITHUB_DEV_TOKEN) {
      return { token: import.meta.env.GITHUB_DEV_TOKEN };
    }
    return { error: 'no-github-account' };
  }

  // Check token expiry (relevant for GitHub Apps; OAuth App tokens don't expire)
  if (result.accessTokenExpiresAt && result.accessTokenExpiresAt.getTime() < Date.now()) {
    return { error: 'token-expired' };
  }

  // Check scope — split on spaces or commas per OAuth2 spec
  const scopes = result.scope?.split(/[\s,]+/) ?? [];
  if (!scopes.includes('repo')) {
    return { error: 'missing-scope' };
  }

  return { token: result.accessToken };
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Parse "owner/repo" string into { owner, repo }.
 */
export function parseGitHubRepo(githubRepo: string): { owner: string; repo: string } {
  const parts = githubRepo.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new Error(`Invalid GitHub repo format: "${githubRepo}". Expected "owner/repo".`);
  }
  return { owner: parts[0], repo: parts[1] };
}

const GITHUB_API = 'https://api.github.com';
const TIMEOUT_MS = 5000;

async function githubFetch<T>(
  url: string,
  token: string,
  accept = 'application/vnd.github.v3+json',
  options?: { handle202?: boolean },
): Promise<GitHubResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: accept,
        'User-Agent': 'astro-shadcn-sanity-portal',
      },
      signal: controller.signal,
    });

    // Log warning when GitHub API rate limit is running low
    const rateLimitRemaining = response.headers?.get?.('X-RateLimit-Remaining');
    if (rateLimitRemaining) {
      const remaining = parseInt(rateLimitRemaining, 10);
      if (remaining < 100) {
        const resetAt = response.headers?.get?.('X-RateLimit-Reset');
        const resetTime = resetAt ? new Date(parseInt(resetAt, 10) * 1000).toISOString() : 'unknown';
        console.warn(`[github] Rate limit low: ${remaining} remaining, resets at ${resetTime}`);
      }
    }

    if (options?.handle202 && response.status === 202) {
      return { data: null, error: 'Stats are being computed. Please refresh in a moment.' };
    }

    if (!response.ok) {
      return { data: null, error: `GitHub API ${response.status}: ${response.statusText}` };
    }

    const data = (await response.json()) as T;
    return { data, error: null };
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return { data: null, error: 'Request timed out (5s)' };
    }
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── GitHub API Functions ─────────────────────────────────────────────

/**
 * List the authenticated user's repos, sorted by updated_at desc.
 */
export async function getUserRepos(token: string): Promise<GitHubResult<GitHubRepo[]>> {
  const allRepos: GitHubRepo[] = [];
  const maxPages = 3; // Cap at 300 repos

  for (let page = 1; page <= maxPages; page++) {
    const result = await githubFetch<GitHubRepo[]>(
      `${GITHUB_API}/user/repos?sort=updated&per_page=100&type=all&page=${page}`,
      token,
    );

    if (!result.data) {
      return allRepos.length > 0
        ? { data: allRepos, error: `Partial results (page ${page} failed: ${result.error})` }
        : result;
    }

    allRepos.push(...result.data);
    if (result.data.length < 100) break; // Last page
  }

  return { data: allRepos, error: null };
}

/**
 * Fetch repository overview (stars, forks, description, etc.).
 */
export async function getRepoOverview(config: GitHubApiConfig): Promise<GitHubResult<RepoOverview>> {
  return githubFetch<RepoOverview>(
    `${GITHUB_API}/repos/${config.owner}/${config.repo}`,
    config.token,
  );
}

/**
 * Fetch open issues (excluding PRs).
 */
export async function getOpenIssues(config: GitHubApiConfig): Promise<GitHubResult<GitHubIssue[]>> {
  const result = await githubFetch<GitHubIssue[]>(
    `${GITHUB_API}/repos/${config.owner}/${config.repo}/issues?state=open&per_page=30`,
    config.token,
  );

  if (result.data) {
    return { data: result.data.filter(issue => !issue.pull_request), error: null };
  }
  return result;
}

/**
 * Fetch open PRs + recently merged (last 10).
 */
export async function getOpenPullRequests(config: GitHubApiConfig): Promise<GitHubResult<{
  open: GitHubPullRequest[];
  recentlyMerged: GitHubPullRequest[];
}>> {
  const [openResult, mergedResult] = await Promise.all([
    githubFetch<GitHubPullRequest[]>(
      `${GITHUB_API}/repos/${config.owner}/${config.repo}/pulls?state=open&per_page=30`,
      config.token,
    ),
    githubFetch<GitHubPullRequest[]>(
      `${GITHUB_API}/repos/${config.owner}/${config.repo}/pulls?state=closed&sort=updated&direction=desc&per_page=20`,
      config.token,
    ),
  ]);

  if (openResult.error && mergedResult.error) {
    return { data: null, error: openResult.error };
  }

  const open = openResult.data ?? [];
  const recentlyMerged = (mergedResult.data ?? [])
    .filter(pr => pr.merged_at !== null)
    .slice(0, 10);

  return { data: { open, recentlyMerged }, error: null };
}

/**
 * Fetch releases (last 10).
 */
export async function getReleases(config: GitHubApiConfig): Promise<GitHubResult<GitHubRelease[]>> {
  return githubFetch<GitHubRelease[]>(
    `${GITHUB_API}/repos/${config.owner}/${config.repo}/releases?per_page=10`,
    config.token,
    'application/vnd.github.full+json',
  );
}

/**
 * Fetch weekly commit activity (last 12 weeks).
 * Handles 202 Accepted (stats being computed).
 */
export async function getCommitActivity(config: GitHubApiConfig): Promise<GitHubResult<GitHubCommitActivity[]>> {
  const result = await githubFetch<GitHubCommitActivity[]>(
    `${GITHUB_API}/repos/${config.owner}/${config.repo}/stats/commit_activity`,
    config.token,
    'application/vnd.github.v3+json',
    { handle202: true },
  );

  if (result.data) {
    // Return only the last 12 weeks
    return { data: result.data.slice(-12), error: null };
  }
  return result;
}

/**
 * Fetch contributor stats, sorted by total commits descending.
 * Handles 202 Accepted (stats being computed).
 */
export async function getContributors(config: GitHubApiConfig): Promise<GitHubResult<GitHubContributor[]>> {
  const result = await githubFetch<GitHubContributor[]>(
    `${GITHUB_API}/repos/${config.owner}/${config.repo}/stats/contributors`,
    config.token,
    'application/vnd.github.v3+json',
    { handle202: true },
  );

  if (result.data) {
    // Sort by total commits descending
    const sorted = [...result.data].sort((a, b) => b.total - a.total);
    return { data: sorted, error: null };
  }
  return result;
}

/**
 * Fetch last 10 GitHub Actions workflow runs.
 */
export async function getWorkflowRuns(config: GitHubApiConfig): Promise<GitHubResult<GitHubWorkflowRun[]>> {
  const result = await githubFetch<{ workflow_runs: GitHubWorkflowRun[] }>(
    `${GITHUB_API}/repos/${config.owner}/${config.repo}/actions/runs?per_page=10`,
    config.token,
  );

  if (result.data) {
    return { data: result.data.workflow_runs, error: null };
  }
  return { data: null, error: result.error };
}

/**
 * Fetch last 20 commits on the default branch.
 */
export async function getRecentCommits(config: GitHubApiConfig): Promise<GitHubResult<GitHubCommit[]>> {
  return githubFetch<GitHubCommit[]>(
    `${GITHUB_API}/repos/${config.owner}/${config.repo}/commits?per_page=20`,
    config.token,
  );
}

/**
 * Fetch language breakdown (language → bytes).
 */
export async function getLanguages(config: GitHubApiConfig): Promise<GitHubResult<GitHubLanguages>> {
  return githubFetch<GitHubLanguages>(
    `${GITHUB_API}/repos/${config.owner}/${config.repo}/languages`,
    config.token,
  );
}

export interface AllGitHubData {
  overview: GitHubResult<RepoOverview>;
  issues: GitHubResult<GitHubIssue[]>;
  pullRequests: GitHubResult<{ open: GitHubPullRequest[]; recentlyMerged: GitHubPullRequest[] }>;
  releases: GitHubResult<GitHubRelease[]>;
  commitActivity: GitHubResult<GitHubCommitActivity[]>;
  contributors: GitHubResult<GitHubContributor[]>;
  workflowRuns: GitHubResult<GitHubWorkflowRun[]>;
  recentCommits: GitHubResult<GitHubCommit[]>;
  languages: GitHubResult<GitHubLanguages>;
}

/**
 * Fetch all GitHub data for a repo in parallel.
 * Uses Promise.allSettled so partial failures don't block other sections.
 */
export async function getAllGitHubData(config: GitHubApiConfig): Promise<AllGitHubData> {
  const [
    overviewResult,
    issuesResult,
    prsResult,
    releasesResult,
    commitActivityResult,
    contributorsResult,
    workflowRunsResult,
    recentCommitsResult,
    languagesResult,
  ] = await Promise.allSettled([
    getRepoOverview(config),
    getOpenIssues(config),
    getOpenPullRequests(config),
    getReleases(config),
    getCommitActivity(config),
    getContributors(config),
    getWorkflowRuns(config),
    getRecentCommits(config),
    getLanguages(config),
  ]);

  const settled = <T>(r: PromiseSettledResult<GitHubResult<T>>): GitHubResult<T> =>
    r.status === 'fulfilled' ? r.value : { data: null, error: 'Failed to fetch' };

  return {
    overview: settled(overviewResult),
    issues: settled(issuesResult),
    pullRequests: settled(prsResult),
    releases: settled(releasesResult),
    commitActivity: settled(commitActivityResult),
    contributors: settled(contributorsResult),
    workflowRuns: settled(workflowRunsResult),
    recentCommits: settled(recentCommitsResult),
    languages: settled(languagesResult),
  };
}

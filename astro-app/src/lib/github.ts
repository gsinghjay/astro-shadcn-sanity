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

export interface GitHubApiConfig {
  token: string;
  owner: string;
  repo: string;
}

export type GitHubResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };

export type GitHubTokenResult =
  | { token: string; error?: undefined }
  | { token?: undefined; error: 'no-github-account' | 'missing-scope' };

// ── Token Retrieval ──────────────────────────────────────────────────

/**
 * Retrieve the GitHub OAuth access token for a user from D1.
 * Returns the token if available, or an error code indicating the issue.
 */
export async function getGitHubToken(
  db: DrizzleD1Database<typeof schema>,
  email: string,
): Promise<GitHubTokenResult> {
  const result = await db
    .select({ accessToken: account.accessToken, scope: account.scope })
    .from(account)
    .innerJoin(user, eq(account.userId, user.id))
    .where(and(eq(user.email, email), eq(account.providerId, 'github')))
    .get();

  if (!result?.accessToken) {
    return { error: 'no-github-account' };
  }

  if (!result.scope?.includes('repo')) {
    return { error: 'missing-scope' };
  }

  return { token: result.accessToken };
}

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Parse "owner/repo" string into { owner, repo }.
 */
export function parseGitHubRepo(githubRepo: string): { owner: string; repo: string } {
  const [owner, repo] = githubRepo.split('/');
  return { owner, repo };
}

const GITHUB_API = 'https://api.github.com';
const TIMEOUT_MS = 5000;

async function githubFetch<T>(url: string, token: string): Promise<GitHubResult<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'astro-shadcn-sanity-portal',
      },
      signal: controller.signal,
    });

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
  return githubFetch<GitHubRepo[]>(
    `${GITHUB_API}/user/repos?sort=updated&per_page=100&type=all`,
    token,
  );
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
  );
}

/**
 * Fetch all GitHub data for a repo in parallel.
 * Uses Promise.allSettled so partial failures don't block other sections.
 */
export async function getAllGitHubData(config: GitHubApiConfig) {
  const [overviewResult, issuesResult, prsResult, releasesResult] = await Promise.allSettled([
    getRepoOverview(config),
    getOpenIssues(config),
    getOpenPullRequests(config),
    getReleases(config),
  ]);

  return {
    overview: overviewResult.status === 'fulfilled' ? overviewResult.value : { data: null, error: 'Failed to fetch' },
    issues: issuesResult.status === 'fulfilled' ? issuesResult.value : { data: null, error: 'Failed to fetch' },
    pullRequests: prsResult.status === 'fulfilled' ? prsResult.value : { data: null, error: 'Failed to fetch' },
    releases: releasesResult.status === 'fulfilled' ? releasesResult.value : { data: null, error: 'Failed to fetch' },
  };
}

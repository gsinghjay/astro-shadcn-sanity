import { useState } from 'react';
import type {
  RepoOverview,
  GitHubIssue,
  GitHubPullRequest,
  GitHubRelease,
  GitHubCommitActivity,
  GitHubContributor,
  GitHubWorkflowRun,
  GitHubCommit,
  GitHubLanguages,
} from '../../lib/github';

// ── Inline SVG icons ──

const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const GitForkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" />
    <path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" /><path d="M12 12v3" />
  </svg>
);

const CircleDotIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="1" />
  </svg>
);

const GitPullRequestIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" x2="6" y1="9" y2="21" />
  </svg>
);

const TagIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
    <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
  </svg>
);

const ExternalLinkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
  </svg>
);

const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const CodeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
  </svg>
);

const GitCommitIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" /><line x1="3" x2="9" y1="12" y2="12" /><line x1="15" x2="21" y1="12" y2="12" />
  </svg>
);


const PlayCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><line x1="15" x2="9" y1="9" y2="15" /><line x1="9" x2="15" y1="9" y2="15" />
  </svg>
);

const MinusCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" /><line x1="8" x2="16" y1="12" y2="12" />
  </svg>
);

// ── Types ──

interface ProjectDashboardData {
  projectTitle: string;
  githubRepo: string;
  overview: RepoOverview | null;
  issues: GitHubIssue[] | null;
  pullRequests: { open: GitHubPullRequest[]; recentlyMerged: GitHubPullRequest[] } | null;
  releases: GitHubRelease[] | null;
  commitActivity: GitHubCommitActivity[] | null;
  contributors: GitHubContributor[] | null;
  workflowRuns: GitHubWorkflowRun[] | null;
  recentCommits: GitHubCommit[] | null;
  languages: GitHubLanguages | null;
  errors: {
    overview?: string;
    issues?: string;
    pullRequests?: string;
    releases?: string;
    commitActivity?: string;
    contributors?: string;
    workflowRuns?: string;
    recentCommits?: string;
    languages?: string;
  };
}

interface GitHubDashboardProps {
  projects: ProjectDashboardData[];
}

type TabId = 'overview' | 'issues' | 'pullRequests' | 'releases' | 'resources' | 'activity' | 'contributors' | 'cicd';

// ── Constants ──

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  C: '#555555',
  'C++': '#f34b7d',
  'C#': '#178600',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Scala: '#c22d40',
  Haskell: '#5e5086',
  Lua: '#000080',
  R: '#198CE7',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Astro: '#ff5d01',
  MDX: '#fcb32c',
  Dockerfile: '#384d54',
  Makefile: '#427819',
  Nix: '#7e7eff',
};

// ── Helpers ──

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function relativeTime(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (isNaN(seconds)) return 'N/A';
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function formatDuration(startedAt: string, updatedAt: string): string {
  const ms = new Date(updatedAt).getTime() - new Date(startedAt).getTime();
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function formatWeekDate(weekTimestamp: number): string {
  return new Date(weekTimestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getFirstLine(message: string): string {
  return message.split('\n')[0] || '(no message)';
}

function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? '#8b8b8b';
}

// ── Sub-Components ──

function ErrorSection({ message }: { message: string }) {
  return (
    <div className="border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      Failed to load: {message}
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="border bg-card p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}

// ── Language Breakdown (Task 3) ──

export function calculateLanguageBreakdown(data: GitHubLanguages): Array<{ name: string; percentage: number }> {
  const totalBytes = Object.values(data).reduce((sum, bytes) => sum + bytes, 0);
  if (totalBytes === 0) return [];

  const entries = Object.entries(data)
    .map(([name, bytes]) => ({ name, percentage: (bytes / totalBytes) * 100 }))
    .sort((a, b) => b.percentage - a.percentage);

  const visible: Array<{ name: string; percentage: number }> = [];
  let otherPercentage = 0;

  for (const entry of entries) {
    if (entry.percentage >= 1) {
      visible.push(entry);
    } else {
      otherPercentage += entry.percentage;
    }
  }

  if (otherPercentage > 0) {
    visible.push({ name: 'Other', percentage: otherPercentage });
  }

  return visible;
}

function LanguageBar({ data, error }: { data: GitHubLanguages | null; error?: string }) {
  if (error) return <ErrorSection message={error} />;
  if (!data || Object.keys(data).length === 0) return null;

  const visible = calculateLanguageBreakdown(data);
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <CodeIcon className="size-4" />
        Languages
      </h3>
      {/* Stacked bar */}
      <div className="flex h-3 w-full overflow-hidden">
        {visible.map(lang => (
          <div
            key={lang.name}
            title={`${lang.name}: ${lang.percentage.toFixed(1)}%`}
            style={{
              width: `${lang.percentage}%`,
              backgroundColor: getLanguageColor(lang.name),
            }}
          />
        ))}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {visible.map(lang => (
          <div key={lang.name} className="flex items-center gap-1.5 text-xs">
            <span
              className="size-2.5 inline-block shrink-0"
              style={{ backgroundColor: getLanguageColor(lang.name) }}
            />
            <span className="text-muted-foreground">{lang.name}</span>
            <span className="font-medium">{lang.percentage.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Recent Commits (Task 4) ──

function RecentCommits({ data, error }: { data: GitHubCommit[] | null; error?: string }) {
  const [expandedShas, setExpandedShas] = useState<Set<string>>(new Set());

  if (error) return <ErrorSection message={error} />;
  if (!data || data.length === 0) return null;

  const toggleExpand = (sha: string) => {
    setExpandedShas(prev => {
      const next = new Set(prev);
      if (next.has(sha)) {
        next.delete(sha);
      } else {
        next.add(sha);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold flex items-center gap-2">
        <GitCommitIcon className="size-4" />
        Recent Commits
      </h3>
      <div className="flex flex-col gap-1">
        {data.map(commit => {
          const firstLine = getFirstLine(commit.commit.message);
          const hasMultiline = commit.commit.message.includes('\n');
          const isExpanded = expandedShas.has(commit.sha);

          return (
            <div key={commit.sha} className="border bg-card p-3 flex flex-col gap-1">
              <div className="flex items-start gap-2">
                <a
                  href={commit.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-primary hover:underline shrink-0 mt-0.5"
                >
                  {commit.sha.slice(0, 7)}
                </a>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <a
                      href={commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm hover:underline truncate"
                    >
                      {firstLine}
                    </a>
                    {hasMultiline && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(commit.sha)}
                        className="shrink-0 text-muted-foreground hover:text-foreground"
                        title={isExpanded ? 'Collapse' : 'Expand'}
                        aria-expanded={isExpanded}
                      >
                        <ChevronDownIcon className={`size-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                  {isExpanded && (
                    <pre className="text-xs text-muted-foreground whitespace-pre-wrap mt-1">
                      {commit.commit.message}
                    </pre>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {commit.author && (
                      <span className="flex items-center gap-1">
                        <img
                          src={commit.author.avatar_url}
                          alt={commit.author.login}
                          className="size-4"
                          loading="lazy"
                        />
                        <a
                          href={`https://github.com/${commit.author.login}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {commit.author.login}
                        </a>
                      </span>
                    )}
                    {!commit.author && (
                      <span>{commit.commit.author.name}</span>
                    )}
                    <span>{relativeTime(commit.commit.author.date)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Overview Tab (updated with Language + Commits) ──

function OverviewTab({
  data,
  errors,
  languages,
  languagesError,
  recentCommits,
  recentCommitsError,
}: {
  data: RepoOverview | null;
  errors?: string;
  languages: GitHubLanguages | null;
  languagesError?: string;
  recentCommits: GitHubCommit[] | null;
  recentCommitsError?: string;
}) {
  if (errors) return <ErrorSection message={errors} />;
  if (!data) return <p className="text-sm text-muted-foreground">No data available.</p>;

  return (
    <div className="flex flex-col gap-6">
      {data.description && (
        <p className="text-sm text-muted-foreground">{data.description}</p>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Stars" value={data.stargazers_count} icon={<StarIcon className="size-4" />} />
        <StatCard label="Forks" value={data.forks_count} icon={<GitForkIcon className="size-4" />} />
        <StatCard label="Open Issues" value={data.open_issues_count} icon={<CircleDotIcon className="size-4" />} />
        <StatCard label="Language" value={data.language ?? 'N/A'} icon={<CodeIcon className="size-4" />} />
        <StatCard label="Last Push" value={timeAgo(data.pushed_at)} icon={<GitPullRequestIcon className="size-4" />} />
      </div>
      <LanguageBar data={languages} error={languagesError} />
      <RecentCommits data={recentCommits} error={recentCommitsError} />
    </div>
  );
}

// ── Issues Tab ──

function IssuesTab({ data, errors }: { data: GitHubIssue[] | null; errors?: string }) {
  if (errors) return <ErrorSection message={errors} />;
  if (!data || data.length === 0) return <p className="text-sm text-muted-foreground">No open issues.</p>;

  return (
    <div className="flex flex-col gap-2">
      {data.map(issue => (
        <div key={issue.number} className="border bg-card p-3 flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <CircleDotIcon className="size-4 text-green-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium">#{issue.number}</span>
                <span className="text-sm">{issue.title}</span>
              </div>
              {issue.labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {issue.labels.map(label => (
                    <span
                      key={label.name}
                      className="px-1.5 py-0.5 text-xs font-medium"
                      style={{
                        backgroundColor: `#${label.color}20`,
                        color: `#${label.color}`,
                        border: `1px solid #${label.color}40`,
                      }}
                    >
                      {label.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{formatDate(issue.created_at)}</span>
                {issue.comments > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageSquareIcon className="size-3" />
                    {issue.comments}
                  </span>
                )}
                {issue.assignees.length > 0 && (
                  <div className="flex -space-x-1">
                    {issue.assignees.slice(0, 3).map(a => (
                      <img
                        key={a.login}
                        src={a.avatar_url}
                        alt={a.login}
                        className="size-4 border border-background"
                        loading="lazy"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Pull Requests Tab ──

function PullRequestsTab({ data, errors }: { data: { open: GitHubPullRequest[]; recentlyMerged: GitHubPullRequest[] } | null; errors?: string }) {
  const [showMerged, setShowMerged] = useState(false);

  if (errors) return <ErrorSection message={errors} />;
  if (!data) return <p className="text-sm text-muted-foreground">No pull request data.</p>;

  const renderPR = (pr: GitHubPullRequest, merged?: boolean) => (
    <div key={pr.number} className="border bg-card p-3 flex flex-col gap-2">
      <div className="flex items-start gap-2">
        <GitPullRequestIcon className={`size-4 shrink-0 mt-0.5 ${merged ? 'text-purple-500' : 'text-green-500'}`} />
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">#{pr.number}</span>
            <span className="text-sm">{pr.title}</span>
            {pr.draft && (
              <span className="px-1.5 py-0.5 text-xs bg-muted text-muted-foreground font-medium">Draft</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {pr.user && (
              <span className="flex items-center gap-1">
                <img src={pr.user.avatar_url} alt={pr.user.login} className="size-4" loading="lazy" />
                {pr.user.login}
              </span>
            )}
            <span>{merged ? `Merged ${formatDate(pr.merged_at)}` : formatDate(pr.created_at)}</span>
            {pr.requested_reviewers.length > 0 && (
              <div className="flex -space-x-1">
                {pr.requested_reviewers.slice(0, 3).map(r => (
                  <img key={r.login} src={r.avatar_url} alt={r.login} className="size-4 border border-background" loading="lazy" />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      {data.open.length === 0 ? (
        <p className="text-sm text-muted-foreground">No open pull requests.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {data.open.map(pr => renderPR(pr))}
        </div>
      )}

      {data.recentlyMerged.length > 0 && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowMerged(!showMerged)}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline self-start"
          >
            <ChevronDownIcon className={`size-4 transition-transform ${showMerged ? 'rotate-180' : ''}`} />
            Recently Merged ({data.recentlyMerged.length})
          </button>
          {showMerged && (
            <div className="flex flex-col gap-2">
              {data.recentlyMerged.map(pr => renderPR(pr, true))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Releases Tab ──

function ReleasesTab({ data, errors }: { data: GitHubRelease[] | null; errors?: string }) {
  if (errors) return <ErrorSection message={errors} />;
  if (!data || data.length === 0) return <p className="text-sm text-muted-foreground">No releases.</p>;

  return (
    <div className="flex flex-col gap-3">
      {data.map((release, idx) => (
        <div key={release.tag_name} className="border bg-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <TagIcon className="size-4 text-primary" />
            <span className="text-sm font-semibold">{release.tag_name}</span>
            {idx === 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground font-medium">Latest</span>
            )}
          </div>
          {release.name && release.name !== release.tag_name && (
            <span className="text-sm">{release.name}</span>
          )}
          <span className="text-xs text-muted-foreground">{formatDate(release.published_at)}</span>
          {release.body_html ? (
            // body_html is pre-sanitized by GitHub's markdown processor — safe to render
            <div
              className="prose prose-sm max-w-none text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: release.body_html }}
            />
          ) : release.body ? (
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap max-h-40 overflow-y-auto">
              {release.body}
            </pre>
          ) : null}
        </div>
      ))}
    </div>
  );
}

// ── Resources Tab ──

function ResourcesTab({ githubRepo }: { githubRepo: string }) {
  const baseUrl = `https://github.com/${githubRepo}`;
  const resources = [
    { label: 'Repository', href: baseUrl, icon: <CodeIcon className="size-5" /> },
    { label: 'Issues Board', href: `${baseUrl}/issues`, icon: <CircleDotIcon className="size-5" /> },
    { label: 'Pull Requests', href: `${baseUrl}/pulls`, icon: <GitPullRequestIcon className="size-5" /> },
    { label: 'Wiki', href: `${baseUrl}/wiki`, icon: <ExternalLinkIcon className="size-5" /> },
    { label: 'Discussions', href: `${baseUrl}/discussions`, icon: <MessageSquareIcon className="size-5" /> },
    { label: 'CI Status', href: `${baseUrl}/actions`, icon: <ExternalLinkIcon className="size-5" /> },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {resources.map(r => (
        <a
          key={r.label}
          href={r.href}
          target="_blank"
          rel="noopener noreferrer"
          className="border bg-card p-4 flex flex-col items-center gap-2 text-center hover:bg-accent transition-colors"
        >
          <span className="text-muted-foreground">{r.icon}</span>
          <span className="text-sm font-medium">{r.label}</span>
        </a>
      ))}
    </div>
  );
}

// ── Activity Tab (Task 5) ──

function CommitActivityChart({ data, error }: { data: GitHubCommitActivity[] | null; error?: string }) {
  if (error) return <ErrorSection message={error} />;
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent commit activity.</p>;
  }

  const maxCommits = Math.max(...data.map(w => w.total), 1);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Weekly Commit Activity (Last 12 Weeks)</h3>
      <div className="flex items-end gap-1 h-40">
        {data.map(week => {
          const heightPercent = (week.total / maxCommits) * 100;
          return (
            <div
              key={week.week}
              className="flex-1 flex flex-col items-center gap-1 min-w-0"
            >
              <div className="w-full flex items-end justify-center" style={{ height: '128px' }}>
                <div
                  className="w-full bg-primary transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary"
                  style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  title={`${week.total} commits`}
                  tabIndex={0}
                  role="img"
                  aria-label={`${formatWeekDate(week.week)}: ${week.total} commits`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                {formatWeekDate(week.week)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Contributors Tab (Task 6) ──

function ContributorsList({ data, error }: { data: GitHubContributor[] | null; error?: string }) {
  const [showAll, setShowAll] = useState(false);

  if (error) return <ErrorSection message={error} />;
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">No contributor data available.</p>;
  }

  const displayedContributors = showAll ? data : data.slice(0, 10);
  const totalAdditions = (contributor: GitHubContributor) =>
    contributor.weeks.reduce((sum, w) => sum + w.a, 0);
  const totalDeletions = (contributor: GitHubContributor) =>
    contributor.weeks.reduce((sum, w) => sum + w.d, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {displayedContributors.map(contributor => (
          <div key={contributor.author.login} className="border bg-card p-3 flex items-center gap-3">
            <img
              src={contributor.author.avatar_url}
              alt={contributor.author.login}
              className="size-8 shrink-0"
              loading="lazy"
            />
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <a
                href={`https://github.com/${contributor.author.login}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline truncate"
              >
                {contributor.author.login}
              </a>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-medium">{contributor.total} commits</span>
                <span className="text-green-600">+{totalAdditions(contributor).toLocaleString()}</span>
                <span className="text-red-600">-{totalDeletions(contributor).toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {data.length > 10 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-sm font-medium text-primary hover:underline self-start flex items-center gap-1"
          aria-expanded={showAll}
        >
          <ChevronDownIcon className={`size-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
          {showAll ? 'Show top 10' : `Show all ${data.length} contributors`}
        </button>
      )}
    </div>
  );
}

// ── CI/CD Tab (Task 7) ──

function WorkflowRunStatusIcon({ status, conclusion }: { status: string; conclusion: string | null }) {
  if (status === 'in_progress') return <PlayCircleIcon className="size-4 text-yellow-500" />;
  if (conclusion === 'success') return <CheckCircleIcon className="size-4 text-green-500" />;
  if (conclusion === 'failure') return <XCircleIcon className="size-4 text-red-500" />;
  return <MinusCircleIcon className="size-4 text-muted-foreground" />;
}

function WorkflowRunStatusBadge({ status, conclusion }: { status: string; conclusion: string | null }) {
  let label: string;
  let colorClass: string;

  if (status === 'in_progress') {
    label = 'In Progress';
    colorClass = 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30';
  } else if (conclusion === 'success') {
    label = 'Success';
    colorClass = 'bg-green-500/10 text-green-700 border-green-500/30';
  } else if (conclusion === 'failure') {
    label = 'Failure';
    colorClass = 'bg-red-500/10 text-red-700 border-red-500/30';
  } else if (conclusion === 'cancelled') {
    label = 'Cancelled';
    colorClass = 'bg-muted text-muted-foreground border-border';
  } else {
    label = conclusion ?? status;
    colorClass = 'bg-muted text-muted-foreground border-border';
  }

  return (
    <span className={`px-1.5 py-0.5 text-xs font-medium border ${colorClass}`}>
      {label}
    </span>
  );
}

function WorkflowRuns({ data, error }: { data: GitHubWorkflowRun[] | null; error?: string }) {
  if (error) return <ErrorSection message={error} />;
  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">No CI/CD workflows configured.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {data.map(run => {
        const isFailed = run.conclusion === 'failure';

        return (
          <div
            key={run.id}
            className={`border bg-card p-3 flex flex-col gap-2 ${isFailed ? 'bg-destructive/5' : ''}`}
          >
            <div className="flex items-start gap-2">
              <WorkflowRunStatusIcon status={run.status} conclusion={run.conclusion} />
              <div className="flex flex-col gap-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <a
                    href={run.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium hover:underline"
                  >
                    {run.name}
                  </a>
                  <WorkflowRunStatusBadge status={run.status} conclusion={run.conclusion} />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <span className="font-mono">{run.head_branch}</span>
                  {run.head_commit && (
                    <span className="truncate max-w-[200px]">{getFirstLine(run.head_commit.message)}</span>
                  )}
                  <span>{formatDuration(run.run_started_at, run.updated_at)}</span>
                  <span>{relativeTime(run.updated_at)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Component ──

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'issues', label: 'Issues' },
  { id: 'pullRequests', label: 'Pull Requests' },
  { id: 'releases', label: 'Releases' },
  { id: 'activity', label: 'Activity' },
  { id: 'contributors', label: 'Contributors' },
  { id: 'cicd', label: 'CI/CD' },
  { id: 'resources', label: 'Resources' },
];

export default function GitHubDashboard({ projects }: GitHubDashboardProps) {
  const [selectedProject, setSelectedProject] = useState(0);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  if (projects.length === 0) {
    return <p className="text-sm text-muted-foreground">No linked projects to display.</p>;
  }

  const current = projects[selectedProject];

  return (
    <div className="flex flex-col gap-4">
      {/* Project picker */}
      {projects.length > 1 ? (
        <div className="flex flex-col gap-1">
          <label htmlFor="project-picker" className="text-sm font-medium">
            Select Project
          </label>
          <select
            id="project-picker"
            value={selectedProject}
            onChange={e => {
              setSelectedProject(Number(e.target.value));
              setActiveTab('overview');
            }}
            className="border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring max-w-sm"
          >
            {projects.map((p, i) => (
              <option key={i} value={i}>
                {p.projectTitle} — {p.githubRepo}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">{current.projectTitle}</h2>
          <span className="text-sm text-muted-foreground font-mono">{current.githubRepo}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b flex gap-0 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[200px]">
        {activeTab === 'overview' && (
          <OverviewTab
            data={current.overview}
            errors={current.errors.overview}
            languages={current.languages}
            languagesError={current.errors.languages}
            recentCommits={current.recentCommits}
            recentCommitsError={current.errors.recentCommits}
          />
        )}
        {activeTab === 'issues' && (
          <IssuesTab data={current.issues} errors={current.errors.issues} />
        )}
        {activeTab === 'pullRequests' && (
          <PullRequestsTab data={current.pullRequests} errors={current.errors.pullRequests} />
        )}
        {activeTab === 'releases' && (
          <ReleasesTab data={current.releases} errors={current.errors.releases} />
        )}
        {activeTab === 'activity' && (
          <CommitActivityChart data={current.commitActivity} error={current.errors.commitActivity} />
        )}
        {activeTab === 'contributors' && (
          <ContributorsList data={current.contributors} error={current.errors.contributors} />
        )}
        {activeTab === 'cicd' && (
          <WorkflowRuns data={current.workflowRuns} error={current.errors.workflowRuns} />
        )}
        {activeTab === 'resources' && (
          <ResourcesTab githubRepo={current.githubRepo} />
        )}
      </div>
    </div>
  );
}

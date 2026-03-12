import { useState } from 'react';

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

// ── Types ──

interface RepoOverview {
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  pushed_at: string | null;
}

interface GitHubIssue {
  number: number;
  title: string;
  labels: Array<{ name: string; color: string }>;
  assignees: Array<{ login: string; avatar_url: string }>;
  created_at: string;
  comments: number;
}

interface GitHubPullRequest {
  number: number;
  title: string;
  user: { login: string; avatar_url: string } | null;
  draft: boolean;
  created_at: string;
  merged_at: string | null;
  requested_reviewers: Array<{ login: string; avatar_url: string }>;
}

interface GitHubRelease {
  tag_name: string;
  name: string | null;
  published_at: string | null;
  body_html?: string;
  body?: string;
}

interface ProjectDashboardData {
  projectTitle: string;
  githubRepo: string;
  overview: RepoOverview | null;
  issues: GitHubIssue[] | null;
  pullRequests: { open: GitHubPullRequest[]; recentlyMerged: GitHubPullRequest[] } | null;
  releases: GitHubRelease[] | null;
  errors: {
    overview?: string;
    issues?: string;
    pullRequests?: string;
    releases?: string;
  };
}

interface GitHubDashboardProps {
  projects: ProjectDashboardData[];
}

type TabId = 'overview' | 'issues' | 'pullRequests' | 'releases' | 'resources';

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

function OverviewTab({ data, errors }: { data: RepoOverview | null; errors?: string }) {
  if (errors) return <ErrorSection message={errors} />;
  if (!data) return <p className="text-sm text-muted-foreground">No data available.</p>;

  return (
    <div className="flex flex-col gap-4">
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
    </div>
  );
}

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

// ── Main Component ──

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'issues', label: 'Issues' },
  { id: 'pullRequests', label: 'Pull Requests' },
  { id: 'releases', label: 'Releases' },
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
          <OverviewTab data={current.overview} errors={current.errors.overview} />
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
        {activeTab === 'resources' && (
          <ResourcesTab githubRepo={current.githubRepo} />
        )}
      </div>
    </div>
  );
}

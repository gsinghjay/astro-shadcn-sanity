import { useState, useEffect, useMemo } from 'react';

// ── Inline SVG icons (avoid 500KB PortalIcon JSON in hydrated island) ──

const LinkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const UnlinkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" />
    <path d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" />
    <line x1="8" x2="8" y1="2" y2="5" />
    <line x1="2" x2="5" y1="8" y2="8" />
    <line x1="16" x2="16" y1="19" y2="22" />
    <line x1="19" x2="22" y1="16" y2="16" />
  </svg>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

// ── Types ──

interface ProjectInfo {
  _id: string;
  title: string | null;
  slug: string | null;
  status: string | null;
}

interface RepoLink {
  id: string;
  userEmail: string;
  projectSanityId: string;
  githubRepo: string;
  linkedAt: string | number;
}

interface GitHubRepo {
  full_name: string;
  description: string | null;
  private: boolean;
}

interface RepoLinkerProps {
  projects: ProjectInfo[];
  links: RepoLink[];
  linkEndpoint: string;
  reposEndpoint: string;
}

// ── Component ──

export default function RepoLinker({ projects, links, linkEndpoint, reposEndpoint }: RepoLinkerProps) {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkMap, setLinkMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const link of links) {
      map[link.projectSanityId] = link.githubRepo;
    }
    return map;
  });
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(reposEndpoint)
      .then(r => {
        if (!r.ok) throw new Error(`Failed to fetch repos: ${r.status}`);
        return r.json();
      })
      .then((data: GitHubRepo[]) => {
        setRepos(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [reposEndpoint]);

  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return repos;
    const q = searchQuery.toLowerCase();
    return repos.filter(r => r.full_name.toLowerCase().includes(q));
  }, [repos, searchQuery]);

  const handleLink = async (projectId: string) => {
    const repo = selections[projectId];
    if (!repo) return;

    setSaving(prev => ({ ...prev, [projectId]: true }));
    try {
      const res = await fetch(linkEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectSanityId: projectId, githubRepo: repo }),
      });
      if (!res.ok) throw new Error('Failed to link repository');
      setLinkMap(prev => ({ ...prev, [projectId]: repo }));
      setSelections(prev => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      // Reload to show dashboard for newly linked project
      window.location.reload();
    } catch {
      setError('Failed to link repository. Please try again.');
    } finally {
      setSaving(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleUnlink = async (projectId: string) => {
    setSaving(prev => ({ ...prev, [projectId]: true }));
    try {
      const res = await fetch(linkEndpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectSanityId: projectId }),
      });
      if (!res.ok) throw new Error('Failed to unlink repository');
      setLinkMap(prev => {
        const next = { ...prev };
        delete next[projectId];
        return next;
      });
      window.location.reload();
    } catch {
      setError('Failed to unlink repository. Please try again.');
    } finally {
      setSaving(prev => ({ ...prev, [projectId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Link Repositories</h2>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="border bg-card p-4">
              <div className="h-4 w-48 bg-muted animate-pulse" />
              <div className="h-8 w-full bg-muted animate-pulse mt-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Link Repositories</h2>
      <p className="text-sm text-muted-foreground">
        Connect a GitHub repository to each project to view live development data.
      </p>

      {error && (
        <div className="border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Search repos */}
      {repos.length > 5 && (
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search repositories…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full border bg-background pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {projects.map(project => {
          const linked = linkMap[project._id];
          const isSaving = saving[project._id];

          return (
            <div key={project._id} className="border bg-card p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">{project.title ?? 'Untitled Project'}</h3>
                {linked && (
                  <span className="text-xs text-muted-foreground font-mono">{linked}</span>
                )}
              </div>

              {linked ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelections(prev => ({ ...prev, [project._id]: linked }));
                      setLinkMap(prev => {
                        const next = { ...prev };
                        delete next[project._id];
                        return next;
                      });
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnlink(project._id)}
                    disabled={isSaving}
                    className="flex items-center gap-1 text-xs text-destructive hover:underline disabled:opacity-50"
                  >
                    <UnlinkIcon className="size-3" />
                    {isSaving ? 'Unlinking…' : 'Unlink'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selections[project._id] ?? ''}
                    onChange={e => setSelections(prev => ({ ...prev, [project._id]: e.target.value }))}
                    className="flex-1 border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select a repository…</option>
                    {filteredRepos.map(repo => (
                      <option key={repo.full_name} value={repo.full_name}>
                        {repo.full_name}{repo.private ? ' (private)' : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => handleLink(project._id)}
                    disabled={!selections[project._id] || isSaving}
                    className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <LinkIcon className="size-4" />
                    {isSaving ? 'Linking…' : 'Link Repository'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

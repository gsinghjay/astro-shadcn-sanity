import { useState, useMemo } from 'react';
import type { SPONSOR_PORTAL_QUERY_RESULT } from '@/sanity.types';

/** Project type extracted from the portal query result. */
type PortalProject = NonNullable<SPONSOR_PORTAL_QUERY_RESULT>['projects'][number];

/** Inline SVG icons — avoids shipping 500KB PortalIcon JSON to client. */
const ChevronDown = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ChevronUp = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m18 15-6-6-6 6" />
  </svg>
);

const FolderIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
  </svg>
);

/** Status badge colors — Swiss design, no rounded corners. */
const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-600 text-white',
  completed: 'bg-blue-600 text-white',
  archived: 'bg-muted text-muted-foreground',
};

/**
 * Extract a plain-text excerpt from Portable Text content.
 * Returns the first `maxLength` characters of concatenated text spans.
 */
function excerptFromPortableText(
  content: PortalProject['content'],
  maxLength = 150,
): string {
  if (!content || !Array.isArray(content)) return '';
  const texts: string[] = [];
  for (const block of content) {
    if (block._type === 'block' && Array.isArray((block as any).children)) {
      for (const child of (block as any).children) {
        if (child._type === 'span' && typeof child.text === 'string') {
          texts.push(child.text);
        }
      }
    }
  }
  const full = texts.join(' ');
  if (full.length <= maxLength) return full;
  return full.slice(0, maxLength).trimEnd() + '…';
}

interface SponsorProjectsProps {
  projects: PortalProject[];
}

/**
 * React island for the sponsor portal project list.
 * Hydrated with `client:load` — receives server-fetched data as props.
 *
 * Features:
 * - Status badges (active/completed/archived)
 * - Technology tags
 * - Expand/collapse per card for team details
 * - Text filter by title or technology tag
 */
export default function SponsorProjects({ projects }: SponsorProjectsProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    if (!filter.trim()) return projects;
    const q = filter.toLowerCase();
    return projects.filter(
      p =>
        p.title?.toLowerCase().includes(q) ||
        p.technologyTags?.some(tag => tag.toLowerCase().includes(q)),
    );
  }, [projects, filter]);

  const toggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <FolderIcon className="size-12 text-muted-foreground" />
        <p className="text-muted-foreground">No projects found for this sponsor.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filter input */}
      <div className="flex flex-col gap-2">
        <label htmlFor="project-filter" className="text-sm font-medium">
          Filter projects
        </label>
        <input
          id="project-filter"
          type="text"
          placeholder="Search by title or technology…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filtered results count */}
      {filter.trim() && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Project cards */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No projects match &ldquo;{filter}&rdquo;
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(project => {
            const isExpanded = expandedIds.has(project._id);
            const statusLabel = project.status ?? 'active';
            const statusClass = STATUS_STYLES[statusLabel] ?? STATUS_STYLES.active;

            return (
              <div
                key={project._id}
                className="border bg-card text-card-foreground shadow-sm"
              >
                {/* Card header */}
                <div className="flex flex-col gap-3 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <h3 className="text-lg font-semibold leading-tight">
                        {project.title ?? 'Untitled Project'}
                      </h3>
                      {project.semester && (
                        <span className="text-sm text-muted-foreground">
                          {project.semester}
                        </span>
                      )}
                    </div>
                    <span
                      className={`shrink-0 px-2 py-0.5 text-xs font-medium uppercase tracking-wider ${statusClass}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Description excerpt */}
                  {project.content && (
                    <p className="text-sm text-muted-foreground">
                      {excerptFromPortableText(project.content)}
                    </p>
                  )}

                  {/* Technology tags */}
                  {project.technologyTags && project.technologyTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologyTags.map(tag => (
                        <span
                          key={tag}
                          className="bg-secondary text-secondary-foreground px-2 py-0.5 text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Team summary + expand toggle */}
                  <button
                    type="button"
                    onClick={() => toggle(project._id)}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mt-1 self-start"
                    aria-expanded={isExpanded}
                    aria-controls={`team-${project._id}`}
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="size-4" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="size-4" />
                        Show Details
                        {project.team && project.team.length > 0 && (
                          <span className="text-muted-foreground font-normal">
                            ({project.team.length} team member{project.team.length !== 1 ? 's' : ''})
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div
                    id={`team-${project._id}`}
                    className="border-t px-6 py-4 flex flex-col gap-4"
                  >
                    {/* Team members */}
                    {project.team && project.team.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-semibold">Team Members</h4>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {project.team.map(member => (
                            <div
                              key={member._key}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div className="flex size-7 shrink-0 items-center justify-center bg-primary text-primary-foreground text-xs font-bold">
                                {member.name?.charAt(0).toUpperCase() ?? '?'}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">{member.name}</span>
                                {member.role && (
                                  <span className="text-xs text-muted-foreground">
                                    {member.role}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No team members assigned.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

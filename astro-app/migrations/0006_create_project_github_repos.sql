-- Story 9-4: GitHub Dev Dashboard — sponsor self-serve repo linking
CREATE TABLE IF NOT EXISTS project_github_repos (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  project_sanity_id TEXT NOT NULL,
  github_repo TEXT NOT NULL,
  linked_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  UNIQUE(user_email, project_sanity_id)
);

CREATE INDEX idx_github_repos_user ON project_github_repos(user_email);

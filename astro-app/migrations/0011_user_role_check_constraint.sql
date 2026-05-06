-- Story 24.7: Add CHECK(role IN ('student', 'sponsor')) to user.role.
-- SQLite cannot ALTER COLUMN to add a CHECK; rebuild the table.
--
-- Pre-migration column inventory (verified via PRAGMA table_info(user) on local D1):
--   id, name, email, email_verified, image, created_at, updated_at, role,
--   agreement_accepted_at, agreement_version, agreement_accepted_ip, agreement_accepted_user_agent.
-- Indexes: only sqlite_autoindex (PK + UNIQUE on email). No explicit CREATE INDEX to recreate.
--
-- Pre-flight aborting on non-conformant rows: SQLite's RAISE(ABORT,...) is only valid inside a
-- trigger program, so we instead rely on the CHECK constraint of `user_new` itself: the INSERT
-- SELECT step fails atomically with a CHECK constraint error if any existing row has a role
-- outside ('student','sponsor'). Expected: zero such rows (middleware writes 'sponsor', Better
-- Auth user-create hook writes 'student' or 'sponsor'). If this INSERT errors, triage the
-- offending row(s) and re-run the migration; the original `user` table is still intact.

-- 1. Rebuild user table with CHECK constraint on role.
--    Mirrors the original CREATE TABLE plus the four ALTER-added columns,
--    preserving column order, types, NOT NULL, and DEFAULT clauses.
CREATE TABLE user_new (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
  updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
  role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student','sponsor')),
  agreement_accepted_at INTEGER,
  agreement_version TEXT,
  agreement_accepted_ip TEXT,
  agreement_accepted_user_agent TEXT
);

-- 2. Copy data verbatim. The CHECK on user_new.role rejects any row outside the set,
--    aborting the migration before the original table is touched.
INSERT INTO user_new (
  id, name, email, email_verified, image, created_at, updated_at, role,
  agreement_accepted_at, agreement_version,
  agreement_accepted_ip, agreement_accepted_user_agent
)
SELECT
  id, name, email, email_verified, image, created_at, updated_at, role,
  agreement_accepted_at, agreement_version,
  agreement_accepted_ip, agreement_accepted_user_agent
FROM user;

-- 3. Swap.
DROP TABLE user;
ALTER TABLE user_new RENAME TO user;

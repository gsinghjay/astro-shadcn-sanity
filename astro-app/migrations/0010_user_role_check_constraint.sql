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
--
-- FK handling: `session.user_id` and `account.user_id` reference `user(id) ON DELETE CASCADE`
-- (migration 0001). Cloudflare's D1 docs state `foreign_keys = OFF` by default, but the
-- `wrangler d1 migrations apply --remote` runner executes with FKs ON in practice — confirmed
-- on 2026-05-07 prod apply: the `DROP TABLE user` step cascade-deleted all 29 session rows and
-- all 8 account rows. User rows were preserved (INSERT-SELECT into user_new ran first), and
-- the rebuilt `user` table inherits the same FK references after the RENAME. `defer_foreign_keys
-- = ON` only defers *constraint* enforcement to COMMIT — it does NOT defer the CASCADE *action*.
-- Operational impact accepted as a one-time event (users re-auth via OAuth/magic-link; Better
-- Auth re-creates account rows on next sign-in keyed by (provider, providerAccountId), so user
-- history is preserved through the email match). To avoid the cascade on future user-table
-- rebuilds: pre-bridge dependent rows (INSERT OR IGNORE into snapshot tables before DROP) or
-- run the rebuild via non-migration `wrangler d1 execute` with `PRAGMA foreign_keys = OFF`
-- explicitly set on the connection. The pragma is per-transaction; D1 wraps each migration
-- file in an implicit transaction, so the deferral resets at COMMIT.

PRAGMA defer_foreign_keys = ON;

-- Idempotency guard: if a prior partial run left `user_new` on disk (e.g. INSERT-SELECT aborted
-- on a non-conformant row), drop it before recreating. Without this the CREATE below would fail
-- with `table user_new already exists` and the migration runner would loop without recovery.
DROP TABLE IF EXISTS user_new;

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

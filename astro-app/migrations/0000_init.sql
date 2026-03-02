-- Portal D1 Schema — Story 9.8
-- Creates transactional data tables for the sponsor portal.
-- Sanity remains the content layer; D1 handles relational, user-specific state.
--
-- NOTE: `updated_at DEFAULT (datetime('now'))` only fires on INSERT.
-- D1/SQLite has no UPDATE triggers — application code MUST set
-- `updated_at = datetime('now')` explicitly in every UPDATE/UPSERT query.

-- Portal Activity Tracking (Story 9.9)
CREATE TABLE IF NOT EXISTS portal_activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sponsor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_activity_email ON portal_activity(sponsor_email);
CREATE INDEX IF NOT EXISTS idx_activity_created ON portal_activity(created_at);

-- Event RSVPs (Story 9.10)
CREATE TABLE IF NOT EXISTS event_rsvps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_sanity_id TEXT NOT NULL,
  sponsor_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('attending', 'maybe', 'declined')),
  dietary_notes TEXT,
  plus_ones INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(event_sanity_id, sponsor_email)
);
CREATE INDEX IF NOT EXISTS idx_rsvps_event ON event_rsvps(event_sanity_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_email ON event_rsvps(sponsor_email);

-- Sponsor Evaluations (Story 9.11)
CREATE TABLE IF NOT EXISTS evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_sanity_id TEXT NOT NULL,
  evaluator_email TEXT NOT NULL,
  evaluation_period TEXT NOT NULL CHECK(evaluation_period IN ('midterm', 'final', 'sprint')),
  scores TEXT NOT NULL,
  comments TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(project_sanity_id, evaluator_email, evaluation_period)
);
CREATE INDEX IF NOT EXISTS idx_evaluations_project ON evaluations(project_sanity_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_email ON evaluations(evaluator_email);

-- Agreement Signatures (Story 9.12)
CREATE TABLE IF NOT EXISTS agreement_signatures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sponsor_email TEXT NOT NULL,
  agreement_type TEXT NOT NULL,
  agreement_version TEXT NOT NULL,
  signed_at TEXT NOT NULL DEFAULT (datetime('now')),
  ip_address TEXT,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_signatures_email ON agreement_signatures(sponsor_email);
CREATE INDEX IF NOT EXISTS idx_signatures_type_version ON agreement_signatures(agreement_type, agreement_version);

-- Notification Preferences (Story 9.13)
CREATE TABLE IF NOT EXISTS notification_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sponsor_email TEXT NOT NULL UNIQUE,
  email_digest TEXT NOT NULL DEFAULT 'none' CHECK(email_digest IN ('none', 'daily', 'weekly')),
  notify_milestone INTEGER NOT NULL DEFAULT 1,
  notify_events INTEGER NOT NULL DEFAULT 1,
  notify_evaluations INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Notifications (Story 9.13)
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sponsor_email TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  notification_type TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_email ON notifications(sponsor_email);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(sponsor_email, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Story 2-13: Event Reminder Notifications
-- Creates subscribers table for event reminder preferences

CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL,
  discord_user_id TEXT,
  remind_days_before INTEGER DEFAULT 7,
  subscribed_at TEXT DEFAULT (datetime('now')),
  active INTEGER DEFAULT 1
);

CREATE INDEX idx_subscribers_active ON subscribers(active);
CREATE UNIQUE INDEX idx_subscribers_email ON subscribers(email);

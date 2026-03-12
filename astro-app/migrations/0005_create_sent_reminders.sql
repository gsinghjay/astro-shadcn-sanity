-- Story 2-13: Event Reminder Notifications
-- Creates sent_reminders table to prevent duplicate notifications
-- Note: subscriber_id references subscribers(id) but D1/SQLite does not enforce
-- FOREIGN KEY constraints by default (requires PRAGMA foreign_keys = ON per-connection).
-- Channel-level notifications (e.g. Discord) use subscriber_id = 0 as a sentinel.

CREATE TABLE IF NOT EXISTS sent_reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  subscriber_id INTEGER NOT NULL,
  channel TEXT NOT NULL,
  sent_at TEXT DEFAULT (datetime('now')),
  UNIQUE(event_id, subscriber_id, channel)
);

CREATE INDEX idx_sent_reminders_event ON sent_reminders(event_id, subscriber_id, channel);

-- Story 15.11: Sponsor Agreement Gate — version pinning + audit capture.
-- Three NULL-able columns; no backfill (existing rows treated as version-drift on next request).
ALTER TABLE user ADD COLUMN agreement_version TEXT;
ALTER TABLE user ADD COLUMN agreement_accepted_ip TEXT;
ALTER TABLE user ADD COLUMN agreement_accepted_user_agent TEXT;

-- Story: Sponsor Agreement Gate — track per-user acceptance of CMS-managed agreement PDF
ALTER TABLE user ADD COLUMN agreement_accepted_at INTEGER;

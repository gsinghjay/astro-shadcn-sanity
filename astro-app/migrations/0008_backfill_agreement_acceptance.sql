-- Backfill: grandfather existing users so they don't see the agreement modal on first
-- post-deploy login. Stamp them with the deploy timestamp (unix ms). New users created
-- after this migration runs will continue to have NULL until they accept.
UPDATE user SET agreement_accepted_at = (CAST(unixepoch('subsecond') * 1000 AS INTEGER))
WHERE agreement_accepted_at IS NULL;

-- Migration: Backfill existing users with sponsor role
-- Story: 9.18 — One-time backfill for users whose email matches a sponsor document.
--
-- WHEN TO RUN: After deploying Story 9.18 to production. Only needed if any sponsor
-- email already exists in the D1 `user` table (e.g., logged in during testing).
-- The databaseHooks.user.create.before hook handles NEW user creation automatically.
--
-- HOW TO RUN:
--   1. Query Sanity for sponsor emails:
--      *[_type == "sponsor"]{ contactEmail, allowedEmails }
--   2. Replace the placeholder emails below with actual sponsor emails.
--   3. Execute against each D1 database:
--      wrangler d1 execute ywcc-capstone-portal --command="UPDATE user SET role = 'sponsor' WHERE email IN ('sponsor1@company.com', 'sponsor2@company.com');"
--      wrangler d1 execute ywcc-capstone-portal --env=preview --command="UPDATE user SET role = 'sponsor' WHERE email IN ('sponsor1@company.com', 'sponsor2@company.com');"
--
-- VERIFY:
--   wrangler d1 execute ywcc-capstone-portal --command="SELECT id, email, role FROM user WHERE role = 'sponsor';"
--
-- SAFE TO RE-RUN: Yes — UPDATE is idempotent. Running twice has no side effects.

-- Replace with actual sponsor emails from Sanity before executing:
UPDATE user SET role = 'sponsor' WHERE email IN (
  'REPLACE_WITH_SPONSOR_1@company.com',
  'REPLACE_WITH_SPONSOR_2@company.com'
);

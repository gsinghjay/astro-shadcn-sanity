-- Migration: Add role column to user table
-- Story: 9.18 — Migrate sponsors from CF Access to Better Auth
-- Backward-compatible: existing users default to 'student'
ALTER TABLE user ADD COLUMN role TEXT DEFAULT 'student' NOT NULL;

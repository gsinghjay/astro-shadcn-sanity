import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { user } from '@/lib/drizzle-schema';

describe('drizzle-schema — user table', () => {
  it('defines a role column on the user table', () => {
    expect(user.role).toBeDefined();
    expect(user.role.name).toBe('role');
  });

  it('role column has text type with student/sponsor enum', () => {
    expect(user.role.columnType).toBe('SQLiteText');
    expect(user.role.enumValues).toEqual(['student', 'sponsor']);
  });

  it('role column defaults to "student"', () => {
    expect(user.role.hasDefault).toBe(true);
    expect(user.role.default).toBe('student');
  });

  it('role column is NOT NULL', () => {
    expect(user.role.notNull).toBe(true);
  });
});

// Story 24.7 (M-5): D1 migration 0011 rebuilds `user` with CHECK(role IN ('student','sponsor')).
// Apply the migration against an in-memory SQLite mirror of the production schema and verify
// the CHECK constraint rejects writes outside the canonical role set.
describe('migration 0011 — user.role CHECK constraint', () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = new DatabaseSync(':memory:');
    // Pre-migration shape: matches production D1 after migrations 0001 + 0002 + 0007 + 0009.
    db.exec(`
      CREATE TABLE user (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        email_verified INTEGER NOT NULL DEFAULT 0,
        image TEXT,
        created_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
        updated_at INTEGER NOT NULL DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)),
        role TEXT DEFAULT 'student' NOT NULL,
        agreement_accepted_at INTEGER,
        agreement_version TEXT,
        agreement_accepted_ip TEXT,
        agreement_accepted_user_agent TEXT
      );
    `);
    const migrationSql = readFileSync(
      resolve(import.meta.dirname, '../../../migrations/0011_user_role_check_constraint.sql'),
      'utf8',
    );
    db.exec(migrationSql);
  });

  it('migrated user table includes CHECK(role IN (...)) clause', () => {
    const row = db
      .prepare(`SELECT sql FROM sqlite_master WHERE type='table' AND name='user'`)
      .get() as { sql: string };
    expect(row.sql).toMatch(/CHECK\(role IN \('student','sponsor'\)\)/);
  });

  it('INSERT with role=student succeeds', () => {
    expect(() =>
      db
        .prepare(
          `INSERT INTO user (id, name, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 0)`,
        )
        .run('s1', 'Student One', 'student1@example.com', 'student'),
    ).not.toThrow();
  });

  it('INSERT with role=sponsor succeeds', () => {
    expect(() =>
      db
        .prepare(
          `INSERT INTO user (id, name, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 0)`,
        )
        .run('p1', 'Sponsor One', 'sponsor1@example.com', 'sponsor'),
    ).not.toThrow();
  });

  it('INSERT with role=admin fails with CHECK constraint error', () => {
    expect(() =>
      db
        .prepare(
          `INSERT INTO user (id, name, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 0)`,
        )
        .run('a1', 'Admin One', 'admin1@example.com', 'admin'),
    ).toThrow(/CHECK constraint/);
  });

  it('UPDATE existing row to role=admin fails with CHECK constraint error', () => {
    db.prepare(
      `INSERT INTO user (id, name, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 0)`,
    ).run('s2', 'Student Two', 'student2@example.com', 'student');
    expect(() => db.prepare(`UPDATE user SET role = 'hacker' WHERE id = ?`).run('s2')).toThrow(
      /CHECK constraint/,
    );
  });

  it('default role is "student" when omitted', () => {
    db.prepare(
      `INSERT INTO user (id, name, email, created_at, updated_at) VALUES (?, ?, ?, 0, 0)`,
    ).run('s3', 'Student Three', 'student3@example.com');
    const row = db.prepare(`SELECT role FROM user WHERE id = ?`).get('s3') as { role: string };
    expect(row.role).toBe('student');
  });
});

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

// Story 24.7 (M-5): D1 migration 0010 rebuilds `user` with CHECK(role IN ('student','sponsor')).
// Apply the migration against an in-memory SQLite mirror of the production schema and verify
// the CHECK constraint rejects writes outside the canonical role set.
const MIGRATION_PATH = '../../../migrations/0010_user_role_check_constraint.sql';

const PRE_MIGRATION_USER_DDL = `
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
`;

function loadMigration(): string {
  return readFileSync(resolve(import.meta.dirname, MIGRATION_PATH), 'utf8');
}

function setupPreMigrationDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(PRE_MIGRATION_USER_DDL);
  return db;
}

describe('migration 0010 — user.role CHECK constraint (post-migration semantics)', () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = setupPreMigrationDb();
    db.exec(loadMigration());
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

// The migration's load-bearing claim is "if the original `user` table contains a row with a role
// outside the set, the INSERT-SELECT step aborts before DROP TABLE runs and the original table
// is intact." These tests exercise that contract directly: seed pre-migration rows, run the
// migration, and assert the survival/abort semantics.
describe('migration 0010 — table-rebuild semantics (pre-migration data)', () => {
  it('preserves valid student/sponsor rows across the rebuild', () => {
    const db = setupPreMigrationDb();
    db.prepare(
      `INSERT INTO user (id, name, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, 100, 100)`,
    ).run('u-student', 'Pre-migration Student', 'preStudent@example.com', 'student');
    db.prepare(
      `INSERT INTO user (id, name, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, 200, 200)`,
    ).run('u-sponsor', 'Pre-migration Sponsor', 'preSponsor@example.com', 'sponsor');

    db.exec(loadMigration());

    const rows = db
      .prepare(`SELECT id, role, created_at FROM user ORDER BY id`)
      .all() as Array<{ id: string; role: string; created_at: number }>;
    expect(rows).toEqual([
      { id: 'u-sponsor', role: 'sponsor', created_at: 200 },
      { id: 'u-student', role: 'student', created_at: 100 },
    ]);
  });

  it('preserves all carried columns (agreement_*) across the rebuild', () => {
    const db = setupPreMigrationDb();
    db.prepare(
      `INSERT INTO user (
        id, name, email, role, created_at, updated_at,
        agreement_accepted_at, agreement_version, agreement_accepted_ip, agreement_accepted_user_agent
      ) VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?, ?)`,
    ).run(
      'u-1',
      'User One',
      'one@example.com',
      'sponsor',
      1700000000000,
      'v1.2',
      '203.0.113.7',
      'Mozilla/5.0',
    );

    db.exec(loadMigration());

    const row = db
      .prepare(
        `SELECT agreement_accepted_at, agreement_version, agreement_accepted_ip, agreement_accepted_user_agent FROM user WHERE id = ?`,
      )
      .get('u-1') as {
      agreement_accepted_at: number;
      agreement_version: string;
      agreement_accepted_ip: string;
      agreement_accepted_user_agent: string;
    };
    expect(row).toEqual({
      agreement_accepted_at: 1700000000000,
      agreement_version: 'v1.2',
      agreement_accepted_ip: '203.0.113.7',
      agreement_accepted_user_agent: 'Mozilla/5.0',
    });
  });

  it('aborts with CHECK error if a pre-existing row has a role outside the set, leaving original `user` table intact', () => {
    const db = setupPreMigrationDb();
    db.prepare(
      `INSERT INTO user (id, name, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 0)`,
    ).run('u-bad', 'Legacy Admin', 'legacy@example.com', 'admin');

    expect(() => db.exec(loadMigration())).toThrow(/CHECK constraint/);

    // The original `user` table must still exist with the bad row preserved — no data loss.
    const row = db.prepare(`SELECT role FROM user WHERE id = ?`).get('u-bad') as {
      role: string;
    };
    expect(row).toEqual({ role: 'admin' });

    // Idempotency guard: re-running the migration after the abort starts cleanly because
    // `DROP TABLE IF EXISTS user_new` clears the half-built shadow table. The second run
    // also aborts (bad row still present), but it aborts on the same INSERT-SELECT step
    // rather than a stale-table CREATE error.
    expect(() => db.exec(loadMigration())).toThrow(/CHECK constraint/);
  });

  // D1 defaults `foreign_keys = OFF` (per Cloudflare D1 docs). With FKs disabled, `DROP TABLE
  // user` does not trigger ON DELETE CASCADE, so dependent session/account rows survive the
  // rebuild and the rebuilt `user` table inherits the existing FK references after RENAME.
  // This test pins that production-equivalent behavior.
  it('preserves dependent rows under D1 default (foreign_keys = OFF)', () => {
    const db = setupPreMigrationDb();
    db.exec(`
      CREATE TABLE session (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
      );
    `);
    db.prepare(
      `INSERT INTO user (id, name, email, role, created_at, updated_at) VALUES (?, ?, ?, ?, 0, 0)`,
    ).run('u-fk', 'FK User', 'fk@example.com', 'sponsor');
    db.prepare(`INSERT INTO session (id, user_id) VALUES (?, ?)`).run('s-fk', 'u-fk');

    // Explicit OFF — `node:sqlite` defaults FKs OFF anyway, but pin the expectation so the
    // assertion is unambiguous about what we're verifying.
    db.exec(`PRAGMA foreign_keys = OFF;`);
    db.exec(loadMigration());

    const row = db
      .prepare(
        `SELECT s.id AS session_id, u.id AS user_id FROM session s JOIN user u ON u.id = s.user_id`,
      )
      .get() as { session_id: string; user_id: string } | undefined;
    expect(row).toEqual({ session_id: 's-fk', user_id: 'u-fk' });
  });
});

import { describe, it, expect } from 'vitest';
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

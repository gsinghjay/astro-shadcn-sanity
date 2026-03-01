import { describe, it, expect, vi } from 'vitest';

const { mockDrizzle } = vi.hoisted(() => {
  const mockDrizzle = vi.fn().mockReturnValue({ __drizzle: true });
  return { mockDrizzle };
});

vi.mock('drizzle-orm/d1', () => ({
  drizzle: mockDrizzle,
}));

import { getDb, getDrizzle } from '@/lib/db';

describe('getDb() — D1 binding accessor', () => {
  it('returns the PORTAL_DB binding from locals', () => {
    const mockD1 = { prepare: vi.fn() } as unknown as D1Database;
    const locals = { runtime: { env: { PORTAL_DB: mockD1 } } } as unknown as App.Locals;
    expect(getDb(locals)).toBe(mockD1);
  });

  it('throws when PORTAL_DB binding is missing', () => {
    const locals = { runtime: { env: {} } } as unknown as App.Locals;
    expect(() => getDb(locals)).toThrow('PORTAL_DB binding not available');
  });

  it('throws when runtime.env is undefined', () => {
    const locals = { runtime: { env: { PORTAL_DB: undefined } } } as unknown as App.Locals;
    expect(() => getDb(locals)).toThrow('PORTAL_DB binding not available');
  });
});

describe('getDrizzle() — shared Drizzle ORM instance', () => {
  it('returns a Drizzle instance wrapping PORTAL_DB', () => {
    const mockD1 = { prepare: vi.fn() } as unknown as D1Database;
    const locals = { runtime: { env: { PORTAL_DB: mockD1 } } } as unknown as App.Locals;
    const result = getDrizzle(locals);
    expect(result).toBeDefined();
    expect(mockDrizzle).toHaveBeenCalledWith(mockD1, expect.objectContaining({}));
  });

  it('passes schema to drizzle()', () => {
    const mockD1 = { prepare: vi.fn() } as unknown as D1Database;
    const locals = { runtime: { env: { PORTAL_DB: mockD1 } } } as unknown as App.Locals;
    getDrizzle(locals);
    const call = mockDrizzle.mock.calls[0];
    expect(call[1]).toHaveProperty('schema');
  });
});

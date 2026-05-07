import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDrizzle, mockEnv } = vi.hoisted(() => {
  const mockDrizzle = vi.fn().mockReturnValue({ __drizzle: true });
  const mockEnv: Record<string, unknown> = {};
  return { mockDrizzle, mockEnv };
});

vi.mock('drizzle-orm/d1', () => ({
  drizzle: mockDrizzle,
}));

vi.mock('cloudflare:workers', () => ({
  env: mockEnv,
}));

import { getDb, getDrizzle } from '@/lib/db';

beforeEach(() => {
  for (const k of Object.keys(mockEnv)) delete mockEnv[k];
  mockDrizzle.mockClear();
});

describe('getDb() — D1 binding accessor', () => {
  it('returns the PORTAL_DB binding from cloudflare:workers env', () => {
    const mockD1 = { prepare: vi.fn() } as unknown as D1Database;
    mockEnv.PORTAL_DB = mockD1;
    expect(getDb()).toBe(mockD1);
  });

  it('throws when PORTAL_DB binding is missing', () => {
    expect(() => getDb()).toThrow('PORTAL_DB binding not available');
  });

  it('throws when PORTAL_DB binding is undefined', () => {
    mockEnv.PORTAL_DB = undefined;
    expect(() => getDb()).toThrow('PORTAL_DB binding not available');
  });
});

describe('getDrizzle() — shared Drizzle ORM instance', () => {
  it('returns a Drizzle instance wrapping PORTAL_DB', () => {
    const mockD1 = { prepare: vi.fn() } as unknown as D1Database;
    mockEnv.PORTAL_DB = mockD1;
    const result = getDrizzle();
    expect(result).toBeDefined();
    expect(mockDrizzle).toHaveBeenCalledWith(mockD1, expect.objectContaining({}));
  });

  it('passes schema to drizzle()', () => {
    const mockD1 = { prepare: vi.fn() } as unknown as D1Database;
    mockEnv.PORTAL_DB = mockD1;
    getDrizzle();
    const call = mockDrizzle.mock.calls[0];
    expect(call[1]).toHaveProperty('schema');
  });

  it('propagates error when PORTAL_DB binding is missing', () => {
    expect(() => getDrizzle()).toThrow('PORTAL_DB binding not available');
  });
});

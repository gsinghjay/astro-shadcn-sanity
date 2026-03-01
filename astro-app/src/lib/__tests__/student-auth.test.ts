import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockBetterAuth, mockDrizzleAdapter } = vi.hoisted(() => {
  const mockBetterAuth = vi.fn().mockReturnValue({
    handler: vi.fn(),
    api: { getSession: vi.fn() },
  });
  const mockDrizzleAdapter = vi.fn().mockReturnValue({ __adapter: true });
  return { mockBetterAuth, mockDrizzleAdapter };
});

vi.mock('better-auth', () => ({
  betterAuth: mockBetterAuth,
}));

vi.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: mockDrizzleAdapter,
}));

import { createAuth } from '@/lib/student-auth';

// Minimal mock env without PORTAL_DB — createAuth should accept db externally
const mockEnv = {
  GOOGLE_CLIENT_ID: 'test-client-id',
  GOOGLE_CLIENT_SECRET: 'test-client-secret',
  BETTER_AUTH_SECRET: 'test-secret-at-least-32-chars-long!!',
  BETTER_AUTH_URL: 'http://localhost:4321',
};

// Mock Drizzle instance (from getDrizzle)
const mockDb = { __drizzle: true } as any;

describe('createAuth() — auth factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts a Drizzle db instance and auth env (no PORTAL_DB)', () => {
    const auth = createAuth({ db: mockDb, env: mockEnv });
    expect(auth).toBeDefined();
    expect(auth.handler).toBeDefined();
  });

  it('passes the provided Drizzle instance to drizzleAdapter', () => {
    createAuth({ db: mockDb, env: mockEnv });
    expect(mockDrizzleAdapter).toHaveBeenCalledWith(mockDb, { provider: 'sqlite' });
  });

  it('does not create its own Drizzle instance', () => {
    createAuth({ db: mockDb, env: mockEnv });
    // drizzleAdapter should receive the exact db reference passed in
    const adapterCall = mockDrizzleAdapter.mock.calls[0];
    expect(adapterCall[0]).toBe(mockDb);
  });

  it('configures Google social provider', () => {
    createAuth({ db: mockDb, env: mockEnv });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.socialProviders.google).toEqual({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    });
  });

  it('sets basePath to /api/auth', () => {
    createAuth({ db: mockDb, env: mockEnv });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.basePath).toBe('/api/auth');
  });

  it('configures session expiresIn to 7 days', () => {
    createAuth({ db: mockDb, env: mockEnv });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.session.expiresIn).toBe(60 * 60 * 24 * 7);
  });

  it('configures session updateAge to 1 day', () => {
    createAuth({ db: mockDb, env: mockEnv });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.session.updateAge).toBe(60 * 60 * 24);
  });

  it('enables cookie cache with 5-minute maxAge', () => {
    createAuth({ db: mockDb, env: mockEnv });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.session.cookieCache).toEqual({
      enabled: true,
      maxAge: 5 * 60,
    });
  });

  it('configures trustedOrigins from env', () => {
    createAuth({ db: mockDb, env: mockEnv });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.trustedOrigins).toContain('http://localhost:4321');
  });

  it('throws descriptive error when BETTER_AUTH_SECRET is missing', () => {
    const badEnv = { ...mockEnv, BETTER_AUTH_SECRET: '' };
    expect(() => createAuth({ db: mockDb, env: badEnv })).toThrow('BETTER_AUTH_SECRET');
  });

  it('throws descriptive error when BETTER_AUTH_URL is missing', () => {
    const badEnv = { ...mockEnv, BETTER_AUTH_URL: '' };
    expect(() => createAuth({ db: mockDb, env: badEnv })).toThrow('BETTER_AUTH_URL');
  });

  it('throws descriptive error when GOOGLE_CLIENT_ID is missing', () => {
    const badEnv = { ...mockEnv, GOOGLE_CLIENT_ID: '' };
    expect(() => createAuth({ db: mockDb, env: badEnv })).toThrow('GOOGLE_CLIENT_ID');
  });

  it('throws descriptive error when GOOGLE_CLIENT_SECRET is missing', () => {
    const badEnv = { ...mockEnv, GOOGLE_CLIENT_SECRET: '' };
    expect(() => createAuth({ db: mockDb, env: badEnv })).toThrow('GOOGLE_CLIENT_SECRET');
  });

  it('throws when env var is whitespace-only', () => {
    const badEnv = { ...mockEnv, BETTER_AUTH_SECRET: '   ' };
    expect(() => createAuth({ db: mockDb, env: badEnv })).toThrow('BETTER_AUTH_SECRET');
  });
});

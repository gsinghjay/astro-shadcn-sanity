import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockBetterAuth, mockDrizzleAdapter, mockMagicLink } = vi.hoisted(() => {
  const mockBetterAuth = vi.fn().mockReturnValue({
    handler: vi.fn(),
    api: { getSession: vi.fn() },
  });
  const mockDrizzleAdapter = vi.fn().mockReturnValue({ __adapter: true });
  const mockMagicLink = vi.fn().mockReturnValue({ id: 'magic-link' });
  return { mockBetterAuth, mockDrizzleAdapter, mockMagicLink };
});

vi.mock('better-auth', () => ({
  betterAuth: mockBetterAuth,
}));

vi.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: mockDrizzleAdapter,
}));

vi.mock('better-auth/plugins/magic-link', () => ({
  magicLink: mockMagicLink,
}));

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn().mockResolvedValue({ id: 'mock-email-id' }) },
  })),
}));

import { createAuth, checkSponsorWhitelist } from '@/lib/auth-config';

const mockEnv = {
  GOOGLE_CLIENT_ID: 'test-client-id',
  GOOGLE_CLIENT_SECRET: 'test-client-secret',
  GITHUB_CLIENT_ID: 'test-github-id',
  GITHUB_CLIENT_SECRET: 'test-github-secret',
  BETTER_AUTH_SECRET: 'test-secret-at-least-32-chars-long!!',
  BETTER_AUTH_URL: 'http://localhost:4321',
  RESEND_API_KEY: 'test-resend-key',
};

const mockDb = { __drizzle: true } as any;

describe('createAuth() — unified auth factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('accepts a Drizzle db instance and auth env', () => {
    const auth = createAuth({ db: mockDb, env: mockEnv });
    expect(auth).toBeDefined();
    expect(auth.handler).toBeDefined();
  });

  it('passes the provided Drizzle instance to drizzleAdapter', () => {
    createAuth({ db: mockDb, env: mockEnv });
    expect(mockDrizzleAdapter).toHaveBeenCalledWith(mockDb, { provider: 'sqlite' });
  });

  it('configures Google social provider', () => {
    createAuth({ db: mockDb, env: mockEnv });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.socialProviders.google).toEqual({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    });
  });

  it('configures GitHub social provider', () => {
    createAuth({ db: mockDb, env: mockEnv });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.socialProviders.github).toEqual({
      clientId: 'test-github-id',
      clientSecret: 'test-github-secret',
      scope: ['repo'],
    });
  });

  it('enables account linking', () => {
    createAuth({ db: mockDb, env: mockEnv });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.account.accountLinking).toEqual({ enabled: true });
  });

  it('registers Magic Link plugin', () => {
    createAuth({ db: mockDb, env: mockEnv });
    expect(mockMagicLink).toHaveBeenCalled();
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.plugins).toContainEqual({ id: 'magic-link' });
  });

  it('configures user.additionalFields.role', () => {
    createAuth({ db: mockDb, env: mockEnv });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.user.additionalFields.role).toEqual({
      type: 'string',
      required: false,
      defaultValue: 'student',
      input: false,
    });
  });

  it('configures databaseHooks.user.create.before', () => {
    createAuth({ db: mockDb, env: mockEnv });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.databaseHooks.user.create.before).toBeTypeOf('function');
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

  it('throws when GITHUB_CLIENT_ID is missing', () => {
    const badEnv = { ...mockEnv, GITHUB_CLIENT_ID: '' };
    expect(() => createAuth({ db: mockDb, env: badEnv })).toThrow('GITHUB_CLIENT_ID');
  });

  it('throws when GITHUB_CLIENT_SECRET is missing', () => {
    const badEnv = { ...mockEnv, GITHUB_CLIENT_SECRET: '' };
    expect(() => createAuth({ db: mockDb, env: badEnv })).toThrow('GITHUB_CLIENT_SECRET');
  });

  it('throws when RESEND_API_KEY is missing', () => {
    const badEnv = { ...mockEnv, RESEND_API_KEY: '' };
    expect(() => createAuth({ db: mockDb, env: badEnv })).toThrow('RESEND_API_KEY');
  });

  it('throws when BETTER_AUTH_SECRET is missing', () => {
    const badEnv = { ...mockEnv, BETTER_AUTH_SECRET: '' };
    expect(() => createAuth({ db: mockDb, env: badEnv })).toThrow('BETTER_AUTH_SECRET');
  });

  it('throws when GOOGLE_CLIENT_ID is missing', () => {
    const badEnv = { ...mockEnv, GOOGLE_CLIENT_ID: '' };
    expect(() => createAuth({ db: mockDb, env: badEnv })).toThrow('GOOGLE_CLIENT_ID');
  });

  it('throws when env var is whitespace-only', () => {
    const badEnv = { ...mockEnv, BETTER_AUTH_SECRET: '   ' };
    expect(() => createAuth({ db: mockDb, env: badEnv })).toThrow('BETTER_AUTH_SECRET');
  });
});

describe('checkSponsorWhitelist()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', vi.fn());
    // Stub import.meta.env values
    import.meta.env.PUBLIC_SANITY_STUDIO_PROJECT_ID = 'test-project';
    import.meta.env.PUBLIC_SANITY_STUDIO_DATASET = 'production';
  });

  it('returns true when email is on the sponsor whitelist', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ result: true })));
    const result = await checkSponsorWhitelist('sponsor@company.com');
    expect(result).toBe(true);
  });

  it('returns false when email is not on the sponsor whitelist', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ result: false })));
    const result = await checkSponsorWhitelist('unknown@test.com');
    expect(result).toBe(false);
  });

  it('returns false when Sanity API returns error', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('Server Error', { status: 500 }));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await checkSponsorWhitelist('sponsor@test.com');
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('[auth] Sanity whitelist query failed: 500');
    consoleSpy.mockRestore();
  });

  it('returns false when fetch throws a network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await checkSponsorWhitelist('sponsor@test.com');
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('[auth] Sanity whitelist check error:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('returns false when response is not valid JSON', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('not json', { status: 200 }));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await checkSponsorWhitelist('sponsor@test.com');
    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith('[auth] Sanity whitelist check error:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  it('calls Sanity API with correct query URL', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ result: false })));
    await checkSponsorWhitelist('test@example.com');
    const callUrl = vi.mocked(fetch).mock.calls[0][0] as string;
    expect(callUrl).toContain('test-project.api.sanity.io');
    expect(callUrl).toContain('production');
    expect(callUrl).toContain(encodeURIComponent('test@example.com'));
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sanityClient } from 'sanity:client';

const {
  mockBetterAuth,
  mockDrizzleAdapter,
  mockMagicLink,
  mockEmailOTP,
  mockResendSend,
  serverEnv,
} = vi.hoisted(() => {
  const mockBetterAuth = vi.fn().mockReturnValue({
    handler: vi.fn(),
    api: { getSession: vi.fn() },
  });
  const mockDrizzleAdapter = vi.fn().mockReturnValue({ __adapter: true });
  const mockMagicLink = vi.fn().mockReturnValue({ id: 'magic-link' });
  const mockEmailOTP = vi.fn().mockReturnValue({ id: 'email-otp' });
  const mockResendSend = vi.fn().mockResolvedValue({ id: 'mock-email-id' });
  // Mutable state for the astro:env/server mock — getters read this object so
  // each createAuth() call sees the current values without resetModules.
  const serverEnv: Record<string, string | undefined> = {
    GOOGLE_CLIENT_ID: 'test-client-id',
    GOOGLE_CLIENT_SECRET: 'test-client-secret',
    GITHUB_CLIENT_ID: 'test-github-id',
    GITHUB_CLIENT_SECRET: 'test-github-secret',
    BETTER_AUTH_SECRET: 'test-secret-at-least-32-chars-long!!',
    BETTER_AUTH_URL: 'http://localhost:4321',
    RESEND_API_KEY: 'test-resend-key',
    RESEND_FROM_EMAIL: undefined,
  };
  return {
    mockBetterAuth,
    mockDrizzleAdapter,
    mockMagicLink,
    mockEmailOTP,
    mockResendSend,
    serverEnv,
  };
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

vi.mock('better-auth/plugins/email-otp', () => ({
  emailOTP: mockEmailOTP,
}));

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: mockResendSend },
  })),
}));

// Live-binding mock: destructured imports in auth-config.ts read these
// getters at use-time, so tests can mutate `serverEnv` between assertions.
vi.mock('astro:env/server', () => ({
  get GOOGLE_CLIENT_ID() { return serverEnv.GOOGLE_CLIENT_ID; },
  get GOOGLE_CLIENT_SECRET() { return serverEnv.GOOGLE_CLIENT_SECRET; },
  get GITHUB_CLIENT_ID() { return serverEnv.GITHUB_CLIENT_ID; },
  get GITHUB_CLIENT_SECRET() { return serverEnv.GITHUB_CLIENT_SECRET; },
  get BETTER_AUTH_SECRET() { return serverEnv.BETTER_AUTH_SECRET; },
  get BETTER_AUTH_URL() { return serverEnv.BETTER_AUTH_URL; },
  get RESEND_API_KEY() { return serverEnv.RESEND_API_KEY; },
  get RESEND_FROM_EMAIL() { return serverEnv.RESEND_FROM_EMAIL; },
}));

import { createAuth, checkSponsorWhitelist } from '@/lib/auth-config';

const validEnv: Record<string, string | undefined> = {
  GOOGLE_CLIENT_ID: 'test-client-id',
  GOOGLE_CLIENT_SECRET: 'test-client-secret',
  GITHUB_CLIENT_ID: 'test-github-id',
  GITHUB_CLIENT_SECRET: 'test-github-secret',
  BETTER_AUTH_SECRET: 'test-secret-at-least-32-chars-long!!',
  BETTER_AUTH_URL: 'http://localhost:4321',
  RESEND_API_KEY: 'test-resend-key',
  RESEND_FROM_EMAIL: undefined,
};

const mockDb = { __drizzle: true } as never;

describe('createAuth() — unified auth factory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(serverEnv, validEnv);
  });

  it('accepts a Drizzle db instance', () => {
    const auth = createAuth({ db: mockDb });
    expect(auth).toBeDefined();
    expect(auth.handler).toBeDefined();
  });

  it('passes the provided Drizzle instance to drizzleAdapter', () => {
    createAuth({ db: mockDb });
    expect(mockDrizzleAdapter).toHaveBeenCalledWith(mockDb, { provider: 'sqlite' });
  });

  it('configures Google social provider', () => {
    createAuth({ db: mockDb });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.socialProviders.google).toEqual({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
    });
  });

  it('configures GitHub social provider', () => {
    createAuth({ db: mockDb });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.socialProviders.github).toEqual({
      clientId: 'test-github-id',
      clientSecret: 'test-github-secret',
      scope: ['repo'],
    });
  });

  it('enables account linking', () => {
    createAuth({ db: mockDb });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.account.accountLinking).toEqual({ enabled: true, allowDifferentEmails: true });
  });

  it('registers Magic Link plugin', () => {
    createAuth({ db: mockDb });
    expect(mockMagicLink).toHaveBeenCalled();
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.plugins).toContainEqual({ id: 'magic-link' });
  });

  it('registers Email OTP plugin', () => {
    createAuth({ db: mockDb });
    expect(mockEmailOTP).toHaveBeenCalled();
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.plugins).toContainEqual({ id: 'email-otp' });
  });

  it('Email OTP sendVerificationOTP sends sign-in code via Resend', async () => {
    serverEnv.RESEND_FROM_EMAIL = 'YWCC <noreply@example.com>';
    createAuth({ db: mockDb });
    const otpOpts = mockEmailOTP.mock.calls[0][0];
    await otpOpts.sendVerificationOTP({ email: 'user@example.com', otp: '123456', type: 'sign-in' });
    expect(mockResendSend).toHaveBeenCalledWith(expect.objectContaining({
      from: 'YWCC <noreply@example.com>',
      to: 'user@example.com',
      subject: expect.stringContaining('sign-in code'),
      html: expect.stringContaining('123456'),
    }));
  });

  it('Email OTP sendVerificationOTP skips non-sign-in types', async () => {
    createAuth({ db: mockDb });
    const otpOpts = mockEmailOTP.mock.calls[0][0];
    await otpOpts.sendVerificationOTP({ email: 'user@example.com', otp: '123456', type: 'email-verification' });
    expect(mockResendSend).not.toHaveBeenCalled();
  });

  it('configures user.additionalFields.role', () => {
    createAuth({ db: mockDb });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.user.additionalFields.role).toEqual({
      type: 'string',
      required: false,
      defaultValue: 'student',
      input: false,
    });
  });

  it('configures databaseHooks.user.create.before', () => {
    createAuth({ db: mockDb });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.databaseHooks.user.create.before).toBeTypeOf('function');
  });

  it('sets basePath to /api/auth', () => {
    createAuth({ db: mockDb });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.basePath).toBe('/api/auth');
  });

  it('configures session expiresIn to 7 days', () => {
    createAuth({ db: mockDb });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.session.expiresIn).toBe(60 * 60 * 24 * 7);
  });

  it('configures session updateAge to 1 day', () => {
    createAuth({ db: mockDb });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.session.updateAge).toBe(60 * 60 * 24);
  });

  it('enables cookie cache with 5-minute maxAge', () => {
    createAuth({ db: mockDb });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.session.cookieCache).toEqual({
      enabled: true,
      maxAge: 5 * 60,
    });
  });

  it('configures trustedOrigins from env', () => {
    createAuth({ db: mockDb });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.trustedOrigins).toContain('http://localhost:4321');
  });

  it('throws when GITHUB_CLIENT_ID is missing', () => {
    serverEnv.GITHUB_CLIENT_ID = '';
    expect(() => createAuth({ db: mockDb })).toThrow('GITHUB_CLIENT_ID');
  });

  it('throws when GITHUB_CLIENT_SECRET is missing', () => {
    serverEnv.GITHUB_CLIENT_SECRET = '';
    expect(() => createAuth({ db: mockDb })).toThrow('GITHUB_CLIENT_SECRET');
  });

  it('throws when RESEND_API_KEY is missing', () => {
    serverEnv.RESEND_API_KEY = '';
    expect(() => createAuth({ db: mockDb })).toThrow('RESEND_API_KEY');
  });

  it('throws when BETTER_AUTH_SECRET is missing', () => {
    serverEnv.BETTER_AUTH_SECRET = '';
    expect(() => createAuth({ db: mockDb })).toThrow('BETTER_AUTH_SECRET');
  });

  it('throws when GOOGLE_CLIENT_ID is missing', () => {
    serverEnv.GOOGLE_CLIENT_ID = '';
    expect(() => createAuth({ db: mockDb })).toThrow('GOOGLE_CLIENT_ID');
  });

  it('throws when env var is whitespace-only', () => {
    serverEnv.BETTER_AUTH_SECRET = '   ';
    expect(() => createAuth({ db: mockDb })).toThrow('BETTER_AUTH_SECRET');
  });
});

describe('checkSponsorWhitelist()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when email is on the sponsor whitelist', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce(true as never);
    const result = await checkSponsorWhitelist('sponsor@company.com');
    expect(result).toBe(true);
  });

  it('returns false when email is not on the sponsor whitelist', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce(false as never);
    const result = await checkSponsorWhitelist('unknown@test.com');
    expect(result).toBe(false);
  });

  it('returns false when sanityClient.fetch rejects', async () => {
    vi.mocked(sanityClient.fetch).mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await checkSponsorWhitelist('sponsor@test.com');
    expect(result).toBe(false);
    // Story 22.10: structured JSON logger replaces ad-hoc `[auth] ...` strings.
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(parsed.level).toBe('error');
    expect(parsed.msg).toBe('auth-sanity-whitelist-check-failed');
    expect(parsed.error).toBe('Network error');
    consoleSpy.mockRestore();
  });

  it('returns false when sanityClient.fetch returns non-boolean payload', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce(undefined as never);
    const result = await checkSponsorWhitelist('sponsor@test.com');
    expect(result).toBe(false);
  });

  it('passes the email through as a GROQ param (not interpolated into the query)', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce(false as never);
    await checkSponsorWhitelist('test@example.com');
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.stringContaining('$email'),
      { email: 'test@example.com' },
    );
  });

  it('handles + aliases without breaking the query (regression: hand-built URL leaked)', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce(true as never);
    const result = await checkSponsorWhitelist('sponsor+alias@example.com');
    expect(result).toBe(true);
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { email: 'sponsor+alias@example.com' },
    );
  });

  it('handles Unicode local-parts (regression: encodeURIComponent only encoded inner)', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce(true as never);
    const result = await checkSponsorWhitelist('用户@example.com');
    expect(result).toBe(true);
    expect(sanityClient.fetch).toHaveBeenCalledWith(
      expect.any(String),
      { email: '用户@example.com' },
    );
  });
});

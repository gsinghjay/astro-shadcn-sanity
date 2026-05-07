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

  it('enables account linking but disallows different emails (Story 24.2)', () => {
    createAuth({ db: mockDb });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.account.accountLinking).toEqual({ enabled: true, allowDifferentEmails: false });
  });

  it('configures magic-link with disableSignUp + 600s expiry (Story 24.2)', () => {
    createAuth({ db: mockDb });
    const magicLinkOpts = mockMagicLink.mock.calls[0][0];
    expect(magicLinkOpts.disableSignUp).toBe(true);
    expect(magicLinkOpts.expiresIn).toBe(600);
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

  it('static trustedOrigins on capstone returns [BETTER_AUTH_URL] (Story 24.2)', () => {
    vi.stubEnv('CLOUDFLARE_ENV', 'capstone');
    try {
      createAuth({ db: mockDb });
      const config = mockBetterAuth.mock.calls[0][0];
      expect(config.trustedOrigins).toEqual(['http://localhost:4321']);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('static trustedOrigins on rwc_us returns [] (Story 24.2)', () => {
    vi.stubEnv('CLOUDFLARE_ENV', 'rwc_us');
    try {
      createAuth({ db: mockDb });
      const config = mockBetterAuth.mock.calls[0][0];
      expect(config.trustedOrigins).toEqual([]);
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('static trustedOrigins ignores any request-derived origin (Story 24.2 — H-3/M-3 fix)', () => {
    // Regression: pre-24.2, createAuth({ db, requestOrigin }) pushed requestOrigin
    // into trustedOrigins. The new signature takes only { db }; even if a caller
    // tried to pass extra fields they'd be ignored at the type level. This test
    // documents the invariant: trustedOrigins is BETTER_AUTH_URL or empty, period.
    vi.stubEnv('CLOUDFLARE_ENV', 'capstone');
    try {
      // @ts-expect-error — proving the extra field is rejected by the type system
      createAuth({ db: mockDb, requestOrigin: 'https://attacker.workers.dev' });
      const config = mockBetterAuth.mock.calls[0][0];
      expect(config.trustedOrigins).toEqual(['http://localhost:4321']);
      expect(config.trustedOrigins).not.toContain('https://attacker.workers.dev');
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('baseURL is sourced from BETTER_AUTH_URL (no request reflection) (Story 24.2)', () => {
    createAuth({ db: mockDb });
    const config = mockBetterAuth.mock.calls[0][0];
    expect(config.baseURL).toBe('http://localhost:4321');
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

describe('databaseHooks.user.create.before — verified-email sponsor gate (Story 24.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(serverEnv, validEnv);
  });

  /** Pull the configured create-before hook out of the most recent betterAuth() call. */
  function getCreateBeforeHook() {
    createAuth({ db: mockDb });
    const config = mockBetterAuth.mock.calls.at(-1)?.[0];
    return config.databaseHooks.user.create.before as (
      user: { email: string; emailVerified?: boolean; name?: string },
      ctx?: { path?: string },
    ) => Promise<{ data: { role: 'sponsor' | 'student' } }>;
  }

  it('returns student when emailVerified is false (Google email_verified === false)', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue(true as never); // even if whitelisted
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const before = getCreateBeforeHook();

    const result = await before(
      { email: 'attacker@sponsor.com', emailVerified: false, name: 'A' },
      { path: '/callback/google' },
    );

    expect(result.data.role).toBe('student');
    // Whitelist must NOT be queried when verification fails — the gate is upstream.
    expect(sanityClient.fetch).not.toHaveBeenCalled();
    const parsed = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(parsed.msg).toBe('auth-denied-sponsor-role-unverified-email');
    expect(parsed.email).toBe('attacker@sponsor.com');
    expect(parsed.pathSegment).toBe('google');
    consoleSpy.mockRestore();
  });

  it('returns student when emailVerified is missing (no provider verification claim)', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValue(true as never);
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const before = getCreateBeforeHook();

    const result = await before({ email: 'sponsor@company.com', name: 'X' }, { path: '/callback/github' });

    expect(result.data.role).toBe('student');
    expect(sanityClient.fetch).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('returns sponsor when emailVerified is true AND email is whitelisted', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce(true as never);
    const before = getCreateBeforeHook();

    const result = await before(
      { email: 'sponsor@company.com', emailVerified: true, name: 'S' },
      { path: '/callback/google' },
    );

    expect(result.data.role).toBe('sponsor');
    expect(sanityClient.fetch).toHaveBeenCalledTimes(1);
  });

  it('returns student when emailVerified is true but email is NOT whitelisted', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce(false as never);
    const before = getCreateBeforeHook();

    const result = await before(
      { email: 'student@school.edu', emailVerified: true, name: 'S' },
      { path: '/callback/google' },
    );

    expect(result.data.role).toBe('student');
  });

  it('classifies a magic-link-shaped invocation as verified (documents intended behaviour)', async () => {
    // Production reachability note: with `disableSignUp: true`, Better Auth rejects unknown
    // emails on the magic-link click with `new_user_signup_disabled` BEFORE this hook runs,
    // so a real magic-link click does NOT exercise this branch. The test invokes the hook
    // directly to document what *would* happen if a future flow created a user via the
    // magic-link plugin path (e.g. admin pre-provisioning) — the plugin would set
    // `emailVerified: true` because the click itself proves email control.
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce(true as never);
    const before = getCreateBeforeHook();

    const result = await before(
      { email: 'sponsor@company.com', emailVerified: true, name: 'S' },
      { path: '/sign-in/magic-link' },
    );

    expect(result.data.role).toBe('sponsor');
  });

  it('logs unknown pathSegment when context.path is absent', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const before = getCreateBeforeHook();

    await before({ email: 'x@y.com', emailVerified: false, name: 'X' });

    const parsed = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    expect(parsed.pathSegment).toBe('unknown');
    consoleSpy.mockRestore();
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

  it('lowercases email before GROQ comparison (Story 24.2 review fix)', async () => {
    vi.mocked(sanityClient.fetch).mockResolvedValueOnce(true as never);
    await checkSponsorWhitelist('Sponsor@Company.com');
    // GROQ `==` is case-sensitive; the create-before hook receives raw provider emails
    // (e.g. Google may return mixed case) while middleware escalation runs through
    // `normalizeEmail()` first. Folding here keeps both call sites consistent.
    expect(sanityClient.fetch).toHaveBeenCalledWith(expect.anything(), { email: 'sponsor@company.com' });
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

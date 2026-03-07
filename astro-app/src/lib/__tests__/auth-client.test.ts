import { describe, it, expect, vi } from 'vitest';

const { mockCreateAuthClient, mockMagicLinkClient } = vi.hoisted(() => {
  const mockCreateAuthClient = vi.fn().mockReturnValue({
    signIn: { social: vi.fn(), magicLink: vi.fn() },
    signOut: vi.fn(),
    getSession: vi.fn(),
  });
  const mockMagicLinkClient = vi.fn().mockReturnValue({ id: 'magic-link' });
  return { mockCreateAuthClient, mockMagicLinkClient };
});

vi.mock('better-auth/client', () => ({
  createAuthClient: mockCreateAuthClient,
}));

vi.mock('better-auth/client/plugins', () => ({
  magicLinkClient: mockMagicLinkClient,
}));

import { authClient } from '@/lib/auth-client';

describe('authClient — client-side auth', () => {
  it('exports an authClient instance', () => {
    expect(authClient).toBeDefined();
  });

  it('provides signIn.social method', () => {
    expect(authClient.signIn).toBeDefined();
    expect(authClient.signIn.social).toBeTypeOf('function');
  });

  it('provides signIn.magicLink method', () => {
    expect(authClient.signIn.magicLink).toBeTypeOf('function');
  });

  it('provides signOut method', () => {
    expect(authClient.signOut).toBeTypeOf('function');
  });

  it('provides getSession method', () => {
    expect(authClient.getSession).toBeTypeOf('function');
  });

  it('configures baseURL ending in /api/auth', () => {
    const config = mockCreateAuthClient.mock.calls[0][0];
    expect(config.baseURL).toMatch(/\/api\/auth$/);
  });

  it('includes magicLinkClient plugin', () => {
    expect(mockMagicLinkClient).toHaveBeenCalled();
    expect(mockCreateAuthClient).toHaveBeenCalledWith(
      expect.objectContaining({
        plugins: expect.arrayContaining([{ id: 'magic-link' }]),
      }),
    );
  });
});

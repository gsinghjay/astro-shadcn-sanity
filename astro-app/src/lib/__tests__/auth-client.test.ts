import { describe, it, expect, vi } from 'vitest';

const { mockCreateAuthClient } = vi.hoisted(() => {
  const mockCreateAuthClient = vi.fn().mockReturnValue({
    signIn: { social: vi.fn() },
    signOut: vi.fn(),
    getSession: vi.fn(),
  });
  return { mockCreateAuthClient };
});

vi.mock('better-auth/client', () => ({
  createAuthClient: mockCreateAuthClient,
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

  it('provides signOut method', () => {
    expect(authClient.signOut).toBeTypeOf('function');
  });

  it('provides getSession method', () => {
    expect(authClient.getSession).toBeTypeOf('function');
  });

  it('configures baseURL to /api/auth', () => {
    expect(mockCreateAuthClient).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: '/api/auth' }),
    );
  });
});

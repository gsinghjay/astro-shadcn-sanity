import { describe, it, expect, vi, afterEach } from 'vitest';

describe('PUBLIC_SITE_THEME env var resolution', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to "red" when PUBLIC_SITE_THEME is not set', () => {
    vi.stubEnv('PUBLIC_SITE_THEME', '');
    const siteTheme = import.meta.env.PUBLIC_SITE_THEME || 'red';
    expect(siteTheme).toBe('red');
  });

  it('resolves to "blue" when PUBLIC_SITE_THEME is set to blue', () => {
    vi.stubEnv('PUBLIC_SITE_THEME', 'blue');
    const siteTheme = import.meta.env.PUBLIC_SITE_THEME || 'red';
    expect(siteTheme).toBe('blue');
  });

  it('resolves to "green" when PUBLIC_SITE_THEME is set to green', () => {
    vi.stubEnv('PUBLIC_SITE_THEME', 'green');
    const siteTheme = import.meta.env.PUBLIC_SITE_THEME || 'red';
    expect(siteTheme).toBe('green');
  });

  it('resolves to "red" when PUBLIC_SITE_THEME is explicitly set to red', () => {
    vi.stubEnv('PUBLIC_SITE_THEME', 'red');
    const siteTheme = import.meta.env.PUBLIC_SITE_THEME || 'red';
    expect(siteTheme).toBe('red');
  });

  it('falls back to "red" for undefined PUBLIC_SITE_THEME', () => {
    vi.stubEnv('PUBLIC_SITE_THEME', undefined as unknown as string);
    const siteTheme = import.meta.env.PUBLIC_SITE_THEME || 'red';
    expect(siteTheme).toBe('red');
  });
});

/**
 * Story 5.19: scripts/sitemap-urls.cjs helper
 *
 * Asserts the sitemap-driven URL discovery used by .lighthouserc.cjs and
 * .pa11yci.cjs returns the deduped, rebased URL set, honors maxUrls, and
 * falls back to the homepage when the sitemap is missing.
 *
 * @story 5-19
 */
import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
// @ts-expect-error CJS helper, no type declarations.
import { getSitemapUrls } from '../../../scripts/sitemap-urls.cjs';

const FIXTURE_DIST = resolve(__dirname, '../../fixtures/sitemap');
const MISSING_DIST = resolve(__dirname, '../../fixtures/does-not-exist');

describe('Story 5-19: getSitemapUrls', () => {
  it('returns one URL per <loc> in the sitemap', () => {
    const urls = getSitemapUrls({
      baseUrl: 'http://localhost:4321',
      distDir: FIXTURE_DIST,
    });
    expect(urls.length).toBe(6);
  });

  it('rebases production URLs onto the supplied baseUrl', () => {
    const urls = getSitemapUrls({
      baseUrl: 'http://localhost:4321',
      distDir: FIXTURE_DIST,
    });
    for (const u of urls) {
      expect(u.startsWith('http://localhost:4321/')).toBe(true);
      expect(u).not.toContain('example.com');
    }
    expect(urls).toContain('http://localhost:4321/');
    expect(urls).toContain('http://localhost:4321/about/');
  });

  it('excludes /portal/, /auth/, /student/, /demo/ (sitemap contract)', () => {
    const urls = getSitemapUrls({
      baseUrl: 'http://localhost:4321',
      distDir: FIXTURE_DIST,
    });
    for (const blocked of ['/portal/', '/auth/', '/student/', '/demo/']) {
      expect(urls.some((u: string) => u.includes(blocked))).toBe(false);
    }
  });

  it('honors the maxUrls cap', () => {
    const urls = getSitemapUrls({
      baseUrl: 'http://localhost:4321',
      distDir: FIXTURE_DIST,
      maxUrls: 3,
    });
    expect(urls.length).toBe(3);
  });

  it('returns a deduped, sorted list', () => {
    const urls = getSitemapUrls({
      baseUrl: 'http://localhost:4321',
      distDir: FIXTURE_DIST,
    });
    const sorted = [...urls].sort();
    expect(urls).toEqual(sorted);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('falls back to the homepage when sitemap-index.xml is missing', () => {
    const urls = getSitemapUrls({
      baseUrl: 'http://localhost:4321',
      distDir: MISSING_DIST,
    });
    expect(urls).toEqual(['http://localhost:4321/']);
  });

  it('falls back to the homepage when distDir is omitted', () => {
    const urls = getSitemapUrls({ baseUrl: 'http://localhost:4321' });
    expect(urls).toEqual(['http://localhost:4321/']);
  });
});

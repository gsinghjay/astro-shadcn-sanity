import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '../../..');

describe('RSS Feed — Story 19.5', () => {
  describe('Task 1: @astrojs/rss dependency', () => {
    const pkg = JSON.parse(
      readFileSync(resolve(ROOT, 'package.json'), 'utf-8'),
    );

    it('lists @astrojs/rss in dependencies', () => {
      expect(pkg.dependencies?.['@astrojs/rss']).toBeDefined();
    });

    it('is NOT in devDependencies (used at build time by endpoint)', () => {
      expect(pkg.devDependencies?.['@astrojs/rss']).toBeUndefined();
    });
  });

  describe('Task 2: rss.xml.ts endpoint', () => {
    const endpointPath = resolve(ROOT, 'src/pages/rss.xml.ts');
    const content = existsSync(endpointPath)
      ? readFileSync(endpointPath, 'utf-8')
      : '';

    it('endpoint file exists', () => {
      expect(existsSync(endpointPath)).toBe(true);
    });

    it('imports from @astrojs/rss', () => {
      expect(content).toContain("from '@astrojs/rss'");
    });

    it('imports getAllArticles and getSiteSettings from @/lib/sanity', () => {
      expect(content).toMatch(
        /getAllArticles.*getSiteSettings|getSiteSettings.*getAllArticles/,
      );
      expect(content).toContain("from '@/lib/sanity'");
    });

    it('exports async GET handler with APIContext', () => {
      expect(content).toMatch(
        /export\s+async\s+function\s+GET\s*\(\s*context\s*:\s*APIContext/,
      );
    });

    it('throws when context.site is undefined', () => {
      expect(content).toMatch(/if\s*\(\s*!context\.site\s*\)/);
      expect(content).toContain('throw new Error');
    });

    it('filters articles missing publishedAt and slug', () => {
      // Filter-then-map pattern: articles.filter(...) must reference both
      // publishedAt and slug before any .map() call.
      const filterIdx = content.indexOf('.filter');
      const mapIdx = content.indexOf('.map');
      expect(filterIdx).toBeGreaterThan(-1);
      expect(mapIdx).toBeGreaterThan(filterIdx);
      const filterBlock = content.slice(filterIdx, mapIdx);
      expect(filterBlock).toContain('publishedAt');
      expect(filterBlock).toContain('slug');
    });

    it('filters articles whose publishedAt parses to Invalid Date', () => {
      // Hardening beyond AC #9: corrupted publishedAt strings that survive
      // stegaClean but still produce Invalid Date must not reach rss().
      const filterIdx = content.indexOf('.filter');
      const mapIdx = content.indexOf('.map');
      const filterBlock = content.slice(filterIdx, mapIdx);
      expect(filterBlock).toMatch(/Number\.isNaN\s*\(\s*Date\.parse/);
      expect(filterBlock).toContain('stegaClean');
    });

    it('uses stegaClean on channel and item strings', () => {
      expect(content).toContain('stegaClean');
      // at least 4 stegaClean calls: title, description, slug, publishedAt
      // (plus optional category/author)
      const matches = content.match(/stegaClean\s*\(/g) ?? [];
      expect(matches.length).toBeGreaterThanOrEqual(4);
    });

    it('constructs Date for pubDate', () => {
      expect(content).toMatch(/new Date\s*\(\s*stegaClean/);
    });

    it('uses relative article link path', () => {
      expect(content).toContain('/articles/');
      // must not pre-concatenate site
      expect(content).not.toMatch(/context\.site.*\/articles\//);
    });

    it('passes context.site directly to rss() options', () => {
      expect(content).toMatch(/site\s*:\s*context\.site/);
    });
  });

  describe('Task 3: Layout.astro auto-discovery link', () => {
    const layoutPath = resolve(ROOT, 'src/layouts/Layout.astro');
    const content = readFileSync(layoutPath, 'utf-8');

    it('contains rel="alternate" RSS link', () => {
      expect(content).toMatch(
        /rel="alternate"[^>]*type="application\/rss\+xml"/s,
      );
    });

    it('href points to /rss.xml', () => {
      expect(content).toMatch(/href="\/rss\.xml"/);
    });

    it('title includes stegaCleaned siteName', () => {
      expect(content).toMatch(/title=\{[^}]*stegaClean[^}]*siteName/);
    });

    it('link is placed before <slot name="head" />', () => {
      const linkIdx = content.indexOf('type="application/rss+xml"');
      const slotIdx = content.indexOf('<slot name="head"');
      expect(linkIdx).toBeGreaterThan(-1);
      expect(slotIdx).toBeGreaterThan(-1);
      expect(linkIdx).toBeLessThan(slotIdx);
    });

    it('link is placed after canonical link', () => {
      const canonicalIdx = content.indexOf('rel="canonical"');
      const rssIdx = content.indexOf('type="application/rss+xml"');
      expect(canonicalIdx).toBeGreaterThan(-1);
      expect(rssIdx).toBeGreaterThan(canonicalIdx);
    });
  });
});

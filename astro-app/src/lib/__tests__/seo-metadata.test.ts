import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const ROOT = resolve(__dirname, '../../..');

describe('SEO Metadata & Sitemap — Configuration', () => {
  describe('Task 1: @astrojs/sitemap integration', () => {
    const configContent = readFileSync(resolve(ROOT, 'astro.config.mjs'), 'utf-8');

    it('imports @astrojs/sitemap', () => {
      expect(configContent).toContain("import sitemap from \"@astrojs/sitemap\"");
    });

    it('includes sitemap() in integrations array', () => {
      expect(configContent).toContain('sitemap(');
    });

    it('filters out /portal/ routes from sitemap', () => {
      expect(configContent).toContain("/portal/");
      expect(configContent).toMatch(/filter.*portal/s);
    });

    it('filters out /auth/ routes from sitemap', () => {
      expect(configContent).toContain("/auth/");
    });

    it('filters out /student/ routes from sitemap', () => {
      expect(configContent).toContain("/student/");
    });

    it('has site config set for URL generation', () => {
      expect(configContent).toContain('site: siteUrl');
    });
  });

  describe('Task 2: robots.txt', () => {
    const robotsPath = resolve(ROOT, 'public/robots.txt');

    it('robots.txt exists in public/', () => {
      expect(existsSync(robotsPath)).toBe(true);
    });

    it('contains User-agent directive', () => {
      const content = readFileSync(robotsPath, 'utf-8');
      expect(content).toContain('User-agent: *');
    });

    it('contains Allow directive', () => {
      const content = readFileSync(robotsPath, 'utf-8');
      expect(content).toContain('Allow: /');
    });

    it('contains Sitemap directive with production URL', () => {
      const content = readFileSync(robotsPath, 'utf-8');
      expect(content).toContain('Sitemap:');
      expect(content).toContain('sitemap-index.xml');
      expect(content).not.toContain('localhost');
    });
  });

  describe('Task 3: noIndex field in Sanity SEO schema', () => {
    const schemaPath = resolve(ROOT, '../studio/src/schemaTypes/objects/seo.ts');
    const schemaContent = readFileSync(schemaPath, 'utf-8');

    it('schema has noIndex field', () => {
      expect(schemaContent).toContain("name: 'noIndex'");
    });

    it('noIndex field is boolean type', () => {
      expect(schemaContent).toContain("type: 'boolean'");
    });

    it('noIndex field has initialValue false', () => {
      expect(schemaContent).toContain('initialValue: false');
    });

    it('noIndex field has description about hiding from search engines', () => {
      expect(schemaContent).toMatch(/description:.*[Hh]ide.*search/);
    });
  });

  describe('Task 4: GROQ queries include noIndex', () => {
    const sanityTsPath = resolve(ROOT, 'src/lib/sanity.ts');
    const sanityContent = readFileSync(sanityTsPath, 'utf-8');

    it('SPONSOR_BY_SLUG_QUERY seo projection includes noIndex', () => {
      const sponsorMatch = sanityContent.match(/SPONSOR_BY_SLUG_QUERY[\s\S]*?seo\s*\{([^}]+)\}/);
      expect(sponsorMatch?.[1]).toContain('noIndex');
    });

    it('PROJECT_BY_SLUG_QUERY seo projection includes noIndex', () => {
      const projectMatch = sanityContent.match(/PROJECT_BY_SLUG_QUERY[\s\S]*?seo\s*\{([^}]+)\}/);
      expect(projectMatch?.[1]).toContain('noIndex');
    });

    it('EVENT_BY_SLUG_QUERY seo projection includes noIndex', () => {
      const eventMatch = sanityContent.match(/EVENT_BY_SLUG_QUERY[\s\S]*?seo\s*\{([^}]+)\}/);
      expect(eventMatch?.[1]).toContain('noIndex');
    });

    it('PAGE_BY_SLUG_QUERY seo projection includes noIndex', () => {
      const pageMatch = sanityContent.match(/PAGE_BY_SLUG_QUERY[\s\S]*?seo\s*\{([^}]+)\}/);
      expect(pageMatch?.[1]).toContain('noIndex');
    });
  });

  describe('Task 4: SeoProps type includes noIndex', () => {
    const typesPath = resolve(ROOT, 'src/lib/types.ts');
    const typesContent = readFileSync(typesPath, 'utf-8');

    it('SeoProps has noIndex field', () => {
      expect(typesContent).toMatch(/noIndex\??\s*:\s*boolean/);
    });
  });

  describe('Task 5: Layout.astro canonical and robots meta', () => {
    const layoutPath = resolve(ROOT, 'src/layouts/Layout.astro');
    const layoutContent = readFileSync(layoutPath, 'utf-8');

    it('renders canonical URL link tag', () => {
      expect(layoutContent).toContain('rel="canonical"');
      expect(layoutContent).toContain('Astro.url.href');
    });

    it('renders conditional noindex meta tag based on seo.noIndex', () => {
      expect(layoutContent).toContain('noIndex');
      expect(layoutContent).toMatch(/meta\s+name="robots"\s+content="noindex"/);
    });
  });
});

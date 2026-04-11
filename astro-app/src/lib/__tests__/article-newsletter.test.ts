import { describe, test, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Story 19.7 AC #11 — File-content wire-up assertion for the
// `articles/[slug].astro` integration of <ArticleNewsletterCta>.
//
// Pattern reference: article-jsonld.test.ts (Story 19.6 AC #13).
// This file verifies the source file has the correct import + tag + ordering.
// Rendering of the component itself is covered by
// `src/components/__tests__/ArticleNewsletterCta.test.ts`.

describe('articles/[slug].astro — ArticleNewsletterCta integration (Story 19.7)', () => {
  const pagePath = resolve(__dirname, '../../pages/articles/[slug].astro');
  const content = existsSync(pagePath) ? readFileSync(pagePath, 'utf-8') : '';

  test('page file exists', () => {
    expect(existsSync(pagePath)).toBe(true);
  });

  test('imports ArticleNewsletterCta from @/components/ArticleNewsletterCta', () => {
    expect(content).toMatch(
      /import\s+ArticleNewsletterCta\s+from\s+['"]@\/components\/ArticleNewsletterCta(?:\.astro)?['"]/,
    );
  });

  test('renders <ArticleNewsletterCta variant="article-body"', () => {
    expect(content).toContain('<ArticleNewsletterCta variant="article-body"');
  });

  test('CTA tag appears AFTER <PortableText and BEFORE the related articles heading', () => {
    const ptIdx = content.indexOf('<PortableText');
    const ctaIdx = content.indexOf('<ArticleNewsletterCta');
    const relatedIdx = content.indexOf('Related Articles');

    expect(ptIdx).toBeGreaterThan(-1);
    expect(ctaIdx).toBeGreaterThan(-1);
    expect(relatedIdx).toBeGreaterThan(-1);

    // Order in source: PortableText body → CTA → Related Articles
    expect(ctaIdx).toBeGreaterThan(ptIdx);
    expect(relatedIdx).toBeGreaterThan(ctaIdx);
  });

  test('does NOT wrap the CTA in a new <Section> on the detail page', () => {
    // Grab everything between the PortableText body and the related articles
    // heading and assert no <Section opening tag appears in that slice.
    // This enforces the single-Section discipline documented in CLAUDE.md.
    const ptIdx = content.indexOf('<PortableText');
    const relatedIdx = content.indexOf('Related Articles');
    const between = content.slice(ptIdx, relatedIdx);

    expect(between).toContain('<ArticleNewsletterCta');
    expect(between).not.toContain('<Section');
  });
});

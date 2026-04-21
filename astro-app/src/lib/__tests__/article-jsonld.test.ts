import { describe, test, expect, vi } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Mock @/lib/image BEFORE importing the builder so safeUrlFor is predictable.
// Pattern reference: json-ld-blocks.test.ts:5-23
vi.mock('@/lib/image', () => ({
  urlFor: (_img: unknown) => ({
    width: () => ({
      height: () => ({ url: () => 'https://cdn.sanity.io/mock-image.jpg' }),
      url: () => 'https://cdn.sanity.io/mock-image.jpg',
    }),
    url: () => 'https://cdn.sanity.io/mock-image.jpg',
  }),
  safeUrlFor: (img: unknown) => {
    if (!img || !(img as { asset?: unknown })?.asset) return null;
    return {
      width: (w: number) => ({
        height: (h: number) => ({
          url: () => `https://cdn.sanity.io/mock-image-${w}x${h}.jpg`,
        }),
        url: () => 'https://cdn.sanity.io/mock-image.jpg',
      }),
      url: () => 'https://cdn.sanity.io/mock-image.jpg',
    };
  },
}));

import { buildArticleJsonLd } from '@/lib/article-jsonld';
import type {
  ARTICLE_BY_SLUG_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
} from '@/sanity.types';
import {
  articleDetailFull,
  articleDetailNews,
  siteSettingsFull,
  siteSettingsNoLogo,
} from '@/components/__tests__/__fixtures__/articles';

type TestArticle = NonNullable<ARTICLE_BY_SLUG_QUERY_RESULT>;
type TestSiteSettings = NonNullable<SITE_SETTINGS_QUERY_RESULT>;

const TEST_URL = 'https://example.com/articles/test-slug';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively assert no zero-width stega markers in any string leaf. */
function assertNoStegaMarkers(value: unknown, path = 'root'): void {
  if (typeof value === 'string') {
    expect(
      value,
      `${path} should not contain zero-width stega markers`,
    ).not.toMatch(/[\u200B-\u200D\uFEFF]/);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => assertNoStegaMarkers(v, `${path}[${i}]`));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      assertNoStegaMarkers(v, `${path}.${k}`);
    }
  }
}

/** Recursively assert no `undefined` values (should have been omitted). */
function assertNoUndefined(value: unknown, path = 'root'): void {
  if (value === undefined) {
    throw new Error(
      `${path} is undefined — should have been omitted via conditional spread`,
    );
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => assertNoUndefined(v, `${path}[${i}]`));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      assertNoUndefined(v, `${path}.${k}`);
    }
  }
}

// ---------------------------------------------------------------------------
// @type resolution (AC #3, #11 bullets 1-3)
// ---------------------------------------------------------------------------

describe('buildArticleJsonLd — @type resolution', () => {
  test('@type is "Article" when category.slug is "blog"', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      TEST_URL,
    );
    expect(result['@type']).toBe('Article');
  });

  test('@type is "NewsArticle" when category.slug is "news"', () => {
    const result = buildArticleJsonLd(
      articleDetailNews,
      siteSettingsFull,
      TEST_URL,
    );
    expect(result['@type']).toBe('NewsArticle');
  });

  test('@type is "Article" (default) when category.slug is "NEWS" (case-sensitive)', () => {
    const override = {
      ...articleDetailNews,
      category: { title: 'News', slug: 'NEWS' },
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result['@type']).toBe('Article');
  });

  test('@type is "Article" (default) when category is null', () => {
    const override = {
      ...articleDetailFull,
      category: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result['@type']).toBe('Article');
  });
});

// ---------------------------------------------------------------------------
// Required fields (AC #4, #11 bullet 4)
// ---------------------------------------------------------------------------

describe('buildArticleJsonLd — required fields', () => {
  test('headline, description, datePublished, mainEntityOfPage, publisher are all present for a fully populated article', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      TEST_URL,
    );
    expect(result.headline).toBe('Deep Dive: Astro Server Islands');
    expect(result.description).toBe(
      'How Astro 5 server islands unlock dynamic content inside static pages.',
    );
    expect(result.datePublished).toBe('2026-04-11T09:00:00.000Z');
    expect(result.mainEntityOfPage).toBe(TEST_URL);
    expect(result.publisher).toBeDefined();
    expect((result.publisher as Record<string, unknown>)['@type']).toBe(
      'Organization',
    );
  });

  test('headline falls back to "Untitled" when article.title is null', () => {
    const override = {
      ...articleDetailFull,
      title: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result.headline).toBe('Untitled');
  });

  test('description key is omitted when article.excerpt is null', () => {
    const override = {
      ...articleDetailFull,
      excerpt: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result).not.toHaveProperty('description');
  });

  test('mainEntityOfPage equals the canonicalUrl argument', () => {
    const url = 'https://mysite.example/articles/foo-bar';
    const result = buildArticleJsonLd(articleDetailFull, siteSettingsFull, url);
    expect(result.mainEntityOfPage).toBe(url);
  });

  test('breadcrumb @id references the page with #breadcrumb fragment', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      TEST_URL,
    );
    expect(result.breadcrumb).toEqual({ '@id': `${TEST_URL}#breadcrumb` });
  });
});

// ---------------------------------------------------------------------------
// dateModified + Invalid Date hardening (AC #4, #11 bullets 5-8)
// ---------------------------------------------------------------------------

describe('buildArticleJsonLd — datetime hardening', () => {
  test('dateModified equals updatedAt when present and valid', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      TEST_URL,
    );
    expect(result.dateModified).toBe('2026-04-11T15:30:00.000Z');
  });

  test('dateModified falls back to publishedAt when updatedAt is null', () => {
    const override = {
      ...articleDetailFull,
      updatedAt: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result.dateModified).toBe('2026-04-11T09:00:00.000Z');
  });

  test('dateModified falls back to publishedAt when updatedAt is "garbage" (Invalid Date guard)', () => {
    const override = {
      ...articleDetailFull,
      updatedAt: 'garbage',
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result.dateModified).toBe('2026-04-11T09:00:00.000Z');
  });

  test('datePublished key is OMITTED when publishedAt is "not-a-date" (Invalid Date guard)', () => {
    const override = {
      ...articleDetailFull,
      publishedAt: 'not-a-date',
      updatedAt: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result).not.toHaveProperty('datePublished');
    expect(result).not.toHaveProperty('dateModified');
  });

  test('datePublished key is OMITTED when publishedAt is null', () => {
    const override = {
      ...articleDetailFull,
      publishedAt: null,
      updatedAt: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result).not.toHaveProperty('datePublished');
    expect(result).not.toHaveProperty('dateModified');
  });
});

// ---------------------------------------------------------------------------
// image omission (AC #5, #11 bullets 9-10)
// ---------------------------------------------------------------------------

describe('buildArticleJsonLd — image omission', () => {
  test('image is a string URL when featuredImage is present', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      TEST_URL,
    );
    expect(typeof result.image).toBe('string');
    expect(result.image).toMatch(/^https:\/\/cdn\.sanity\.io\/mock-image/);
  });

  test('image key is OMITTED when featuredImage is null', () => {
    const override = {
      ...articleDetailFull,
      featuredImage: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result).not.toHaveProperty('image');
  });

  test('image key is OMITTED when featuredImage.asset is null (safeUrlFor returns null)', () => {
    const override = {
      ...articleDetailFull,
      featuredImage: {
        ...articleDetailFull.featuredImage!,
        asset: null,
      },
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result).not.toHaveProperty('image');
  });

  test('image is NOT an ImageObject — it is a plain string URL', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      TEST_URL,
    );
    expect(result.image).not.toMatchObject({ '@type': 'ImageObject' });
  });
});

// ---------------------------------------------------------------------------
// author object (AC #6, #11 bullets 11-15)
// ---------------------------------------------------------------------------

describe('buildArticleJsonLd — author object', () => {
  test('author is emitted with @type: "Person", name, and url when slug is present', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      TEST_URL,
    );
    const author = result.author as Record<string, unknown>;
    expect(author['@type']).toBe('Person');
    expect(author.name).toBe('Alex Singh');
    expect(author.url).toBe('https://example.com/authors/alex-singh');
  });

  test('author.name falls back to "Unknown" when author.name is null', () => {
    const override = {
      ...articleDetailFull,
      author: {
        ...articleDetailFull.author!,
        name: null,
      },
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect((result.author as Record<string, unknown>).name).toBe('Unknown');
  });

  test('author.url is OMITTED when author.slug is null', () => {
    const override = {
      ...articleDetailFull,
      author: {
        ...articleDetailFull.author!,
        slug: null,
      },
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result.author).toBeDefined();
    expect(result.author).not.toHaveProperty('url');
  });

  test('author.sameAs is emitted when the array has entries', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      TEST_URL,
    );
    const author = result.author as Record<string, unknown>;
    expect(author.sameAs).toEqual([
      'https://github.com/alexsingh',
      'https://twitter.com/alexsingh',
    ]);
  });

  test('author.sameAs is OMITTED when the array is empty', () => {
    const override = {
      ...articleDetailFull,
      author: {
        ...articleDetailFull.author!,
        sameAs: [],
      },
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result.author).not.toHaveProperty('sameAs');
  });

  test('author.sameAs is OMITTED when all entries are empty strings', () => {
    const override = {
      ...articleDetailFull,
      author: {
        ...articleDetailFull.author!,
        sameAs: ['', ''],
      },
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result.author).toBeDefined();
    expect(result.author).not.toHaveProperty('sameAs');
  });

  test('author.sameAs is OMITTED when the array is null', () => {
    const override = {
      ...articleDetailFull,
      author: {
        ...articleDetailFull.author!,
        sameAs: null,
      },
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result.author).not.toHaveProperty('sameAs');
  });

  test('author key is entirely OMITTED when article.author is null', () => {
    const override = {
      ...articleDetailFull,
      author: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result).not.toHaveProperty('author');
  });

  test('author.url origin is derived from canonicalUrl (not hardcoded)', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      'https://other-site.org/articles/some-slug',
    );
    const author = result.author as Record<string, unknown>;
    expect(author.url).toBe('https://other-site.org/authors/alex-singh');
  });
});

// ---------------------------------------------------------------------------
// publisher object (AC #7, #11 bullets 16-18)
// ---------------------------------------------------------------------------

describe('buildArticleJsonLd — publisher object', () => {
  test('publisher.name uses stegaClean(siteSettings.siteName)', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      TEST_URL,
    );
    const publisher = result.publisher as Record<string, unknown>;
    expect(publisher['@type']).toBe('Organization');
    expect(publisher.name).toBe('Test Org');
  });

  test('publisher.name falls back to "YWCC Industry Capstone" when siteName is null', () => {
    const override = {
      ...siteSettingsFull,
      siteName: null,
    } as TestSiteSettings;
    const result = buildArticleJsonLd(articleDetailFull, override, TEST_URL);
    const publisher = result.publisher as Record<string, unknown>;
    expect(publisher.name).toBe('YWCC Industry Capstone');
  });

  test('publisher.logo is an ImageObject when siteSettings.logo.asset is present', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      TEST_URL,
    );
    const publisher = result.publisher as Record<string, unknown>;
    const logo = publisher.logo as Record<string, unknown>;
    expect(logo['@type']).toBe('ImageObject');
    expect(typeof logo.url).toBe('string');
    expect(logo.url).toMatch(/^https:\/\/cdn\.sanity\.io\/mock-image/);
  });

  test('publisher.logo is OMITTED when siteSettings.logo is null', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsNoLogo,
      TEST_URL,
    );
    const publisher = result.publisher as Record<string, unknown>;
    expect(publisher).not.toHaveProperty('logo');
  });

  test('publisher key is ALWAYS emitted (required for rich results)', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsNoLogo,
      TEST_URL,
    );
    expect(result).toHaveProperty('publisher');
  });
});

// ---------------------------------------------------------------------------
// cleanliness (AC #8, #11 bullets 19-20)
// ---------------------------------------------------------------------------

describe('buildArticleJsonLd — cleanliness', () => {
  test('no schema key contains an `undefined` value', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      TEST_URL,
    );
    expect(() => assertNoUndefined(result)).not.toThrow();
  });

  test('no schema key contains an `undefined` value (minimal article)', () => {
    const override = {
      ...articleDetailFull,
      excerpt: null,
      featuredImage: null,
      author: null,
      publishedAt: null,
      updatedAt: null,
    } as TestArticle;
    const result = buildArticleJsonLd(
      override,
      siteSettingsNoLogo,
      TEST_URL,
    );
    expect(() => assertNoUndefined(result)).not.toThrow();
  });

  test('no string value contains zero-width stega markers (fully populated)', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      TEST_URL,
    );
    expect(() => assertNoStegaMarkers(result)).not.toThrow();
  });

  test('no @context key is emitted by the builder (JsonLd component adds it)', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      TEST_URL,
    );
    expect(result).not.toHaveProperty('@context');
  });
});

// ---------------------------------------------------------------------------
// JSON.stringify round-trip (AC #12)
// ---------------------------------------------------------------------------

describe('buildArticleJsonLd — JSON.stringify round-trip', () => {
  test('the result serializes to valid JSON and parses back to an equivalent object', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      'https://example.com/articles/foo',
    );
    const json = JSON.stringify(result);
    expect(() => JSON.parse(json)).not.toThrow();
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(result);
  });

  test('parsed result has the minimum Article rich-result shape', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      'https://example.com/articles/foo',
    );
    const parsed = JSON.parse(JSON.stringify(result));
    expect(parsed['@type']).toBeDefined();
    expect(parsed.headline).toBeDefined();
    expect(parsed.image).toBeDefined();
    expect(parsed.datePublished).toBeDefined();
    expect(parsed.author).toBeDefined();
    expect(parsed.publisher).toBeDefined();
  });

  test('parsed mainEntityOfPage equals the canonical URL passed in', () => {
    const url = 'https://example.com/articles/foo';
    const result = buildArticleJsonLd(articleDetailFull, siteSettingsFull, url);
    const parsed = JSON.parse(JSON.stringify(result));
    expect(parsed.mainEntityOfPage).toBe(url);
  });
});

// ---------------------------------------------------------------------------
// Page integration — file-content assertions (AC #13)
// ---------------------------------------------------------------------------

describe('articles/[slug].astro integration', () => {
  const pagePath = resolve(
    __dirname,
    '../../pages/articles/[slug].astro',
  );
  const content = existsSync(pagePath)
    ? readFileSync(pagePath, 'utf-8')
    : '';

  test('page file exists', () => {
    expect(existsSync(pagePath)).toBe(true);
  });

  test('imports buildArticleJsonLd from @/lib/article-jsonld', () => {
    expect(content).toMatch(
      /import\s+\{\s*buildArticleJsonLd\s*\}\s+from\s+['"]@\/lib\/article-jsonld['"]/,
    );
  });

  test('imports buildPageGraph from @/lib/page-jsonld', () => {
    expect(content).toContain('buildPageGraph');
    expect(content).toContain("from '@/lib/page-jsonld'");
  });

  test('imports getSiteSettings from @/lib/sanity', () => {
    expect(content).toContain('getSiteSettings');
    expect(content).toContain("from '@/lib/sanity'");
  });

  test('calls buildArticleJsonLd with article, siteSettings, and Astro.url.href', () => {
    expect(content).toMatch(
      /buildArticleJsonLd\s*\(\s*article\s*,\s*siteSettings\s*,\s*Astro\.url\.href\s*\)/,
    );
  });

  test('emits structured data via structured-data slot', () => {
    expect(content).toContain('slot="structured-data"');
    expect(content).toContain('application/ld+json');
    expect(content).toContain('pageGraph');
  });
});

// ---------------------------------------------------------------------------
// CR P1: canonicalUrl validation
// ---------------------------------------------------------------------------

describe('buildArticleJsonLd — canonicalUrl validation (CR P1)', () => {
  test('throws TypeError when canonicalUrl is a relative path', () => {
    expect(() =>
      buildArticleJsonLd(articleDetailFull, siteSettingsFull, '/articles/foo'),
    ).toThrow(TypeError);
  });

  test('throws TypeError when canonicalUrl is an empty string', () => {
    expect(() =>
      buildArticleJsonLd(articleDetailFull, siteSettingsFull, ''),
    ).toThrow(TypeError);
  });

  test('throws TypeError when canonicalUrl is unparseable garbage', () => {
    expect(() =>
      buildArticleJsonLd(articleDetailFull, siteSettingsFull, 'not a url'),
    ).toThrow(TypeError);
  });

  test('throws TypeError when canonicalUrl uses file:// scheme', () => {
    expect(() =>
      buildArticleJsonLd(
        articleDetailFull,
        siteSettingsFull,
        'file:///build/articles/foo.html',
      ),
    ).toThrow(/http\(s\) scheme/);
  });

  test('throws TypeError when canonicalUrl uses data: scheme', () => {
    expect(() =>
      buildArticleJsonLd(
        articleDetailFull,
        siteSettingsFull,
        'data:text/html,<p>foo</p>',
      ),
    ).toThrow(/http\(s\) scheme/);
  });

  test('accepts http:// canonicalUrl', () => {
    expect(() =>
      buildArticleJsonLd(
        articleDetailFull,
        siteSettingsFull,
        'http://example.com/articles/foo',
      ),
    ).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// CR P2: strict ISO 8601 datetime validation
// ---------------------------------------------------------------------------

describe('buildArticleJsonLd — strict ISO 8601 (CR P2)', () => {
  test('datePublished is OMITTED when publishedAt is year-only "2026"', () => {
    const override = {
      ...articleDetailFull,
      publishedAt: '2026',
      updatedAt: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result).not.toHaveProperty('datePublished');
  });

  test('datePublished is OMITTED when publishedAt is "April 11 2026" (loose Date.parse match)', () => {
    const override = {
      ...articleDetailFull,
      publishedAt: 'April 11 2026',
      updatedAt: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result).not.toHaveProperty('datePublished');
  });

  test('datePublished is OMITTED when publishedAt is year-zero "0000-01-01"', () => {
    const override = {
      ...articleDetailFull,
      publishedAt: '0000-01-01',
      updatedAt: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result).not.toHaveProperty('datePublished');
  });

  test('datePublished accepts date-only ISO "2026-04-11"', () => {
    const override = {
      ...articleDetailFull,
      publishedAt: '2026-04-11',
      updatedAt: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result.datePublished).toBe('2026-04-11');
  });

  test('datePublished accepts full ISO with timezone "2026-04-11T09:00:00+00:00"', () => {
    const override = {
      ...articleDetailFull,
      publishedAt: '2026-04-11T09:00:00+00:00',
      updatedAt: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result.datePublished).toBe('2026-04-11T09:00:00+00:00');
  });
});

// ---------------------------------------------------------------------------
// CR P3: whitespace-only fallbacks
// ---------------------------------------------------------------------------

describe('buildArticleJsonLd — whitespace fallbacks (CR P3)', () => {
  test('headline falls back to "Untitled" when title is whitespace-only', () => {
    const override = {
      ...articleDetailFull,
      title: '   ',
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result.headline).toBe('Untitled');
  });

  test('description is OMITTED when excerpt is whitespace-only', () => {
    const override = {
      ...articleDetailFull,
      excerpt: '   ',
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result).not.toHaveProperty('description');
  });

  test('publisher.name falls back when siteName is whitespace-only', () => {
    const override = {
      ...siteSettingsFull,
      siteName: '   ',
    } as TestSiteSettings;
    const result = buildArticleJsonLd(articleDetailFull, override, TEST_URL);
    const publisher = result.publisher as Record<string, unknown>;
    expect(publisher.name).toBe('YWCC Industry Capstone');
  });

  test('author.name falls back to "Unknown" when name is whitespace-only', () => {
    const override = {
      ...articleDetailFull,
      author: {
        ...articleDetailFull.author,
        name: '   ',
      },
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect((result.author as Record<string, unknown>).name).toBe('Unknown');
  });
});

// ---------------------------------------------------------------------------
// CR P4: sameAs whitespace trimming
// ---------------------------------------------------------------------------

describe('buildArticleJsonLd — sameAs whitespace filter (CR P4)', () => {
  test('author.sameAs drops whitespace-only entries and keeps real URLs', () => {
    const override = {
      ...articleDetailFull,
      author: {
        ...articleDetailFull.author,
        sameAs: ['   ', 'https://github.com/x', '  '],
      },
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    const author = result.author as Record<string, unknown>;
    expect(author.sameAs).toEqual(['https://github.com/x']);
  });

  test('author.sameAs is OMITTED when all entries are whitespace', () => {
    const override = {
      ...articleDetailFull,
      author: {
        ...articleDetailFull.author,
        sameAs: ['  ', '   '],
      },
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result.author).toBeDefined();
    expect(result.author).not.toHaveProperty('sameAs');
  });
});

// ---------------------------------------------------------------------------
// CR P5: NewsArticle requires datePublished → downgrade when missing
// ---------------------------------------------------------------------------

describe('buildArticleJsonLd — NewsArticle datePublished requirement (CR P5)', () => {
  test('@type downgrades from "NewsArticle" to "Article" when publishedAt is null', () => {
    const override = {
      ...articleDetailNews,
      publishedAt: null,
      updatedAt: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result['@type']).toBe('Article');
    expect(result).not.toHaveProperty('datePublished');
  });

  test('@type downgrades when news category has invalid publishedAt ("garbage")', () => {
    const override = {
      ...articleDetailNews,
      publishedAt: 'garbage',
      updatedAt: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result['@type']).toBe('Article');
  });

  test('@type downgrades when news category has loose Date.parse match "2026"', () => {
    const override = {
      ...articleDetailNews,
      publishedAt: '2026',
      updatedAt: null,
    } as TestArticle;
    const result = buildArticleJsonLd(override, siteSettingsFull, TEST_URL);
    expect(result['@type']).toBe('Article');
  });

  test('@type remains "NewsArticle" when news category + valid ISO publishedAt', () => {
    const result = buildArticleJsonLd(
      articleDetailNews,
      siteSettingsFull,
      TEST_URL,
    );
    expect(result['@type']).toBe('NewsArticle');
    expect(result.datePublished).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// CR P6: mainEntityOfPage strips query + fragment
// ---------------------------------------------------------------------------

describe('buildArticleJsonLd — canonical URL stripping (CR P6)', () => {
  test('mainEntityOfPage strips query string from canonicalUrl', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      'https://example.com/articles/foo?preview=1',
    );
    expect(result.mainEntityOfPage).toBe('https://example.com/articles/foo');
  });

  test('mainEntityOfPage strips hash fragment from canonicalUrl', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      'https://example.com/articles/foo#section',
    );
    expect(result.mainEntityOfPage).toBe('https://example.com/articles/foo');
  });

  test('mainEntityOfPage strips both query AND fragment', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      'https://example.com/articles/foo?preview=1&utm=x#top',
    );
    expect(result.mainEntityOfPage).toBe('https://example.com/articles/foo');
  });

  test('mainEntityOfPage preserves trailing slash in pathname', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      'https://example.com/articles/foo/',
    );
    expect(result.mainEntityOfPage).toBe('https://example.com/articles/foo/');
  });

  test('author.url origin is still derived correctly after stripping', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      'https://example.com/articles/foo?preview=1',
    );
    const author = result.author as Record<string, unknown>;
    expect(author.url).toBe('https://example.com/authors/alex-singh');
  });

  test('breadcrumb @id uses canonical URL (stripped query/fragment)', () => {
    const result = buildArticleJsonLd(
      articleDetailFull,
      siteSettingsFull,
      'https://example.com/articles/foo?preview=1#top',
    );
    expect(result.breadcrumb).toEqual({
      '@id': 'https://example.com/articles/foo#breadcrumb',
    });
  });
});

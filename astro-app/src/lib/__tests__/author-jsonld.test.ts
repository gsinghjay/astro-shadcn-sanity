import { describe, test, expect, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Mock @/lib/image BEFORE importing the builder so safeUrlFor is predictable.
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

import { buildAuthorJsonLd } from '@/lib/author-jsonld';
import {
  authorDetailFull,
  authorDetailMinimal,
} from '@/components/__tests__/__fixtures__/authors';

const TEST_URL = 'https://example.com/authors/jane-doe';

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

// ===========================================================================
// 1. Person fields — full data
// ===========================================================================

describe('buildAuthorJsonLd — full data', () => {
  const result = buildAuthorJsonLd(authorDetailFull, TEST_URL);

  test('@type is "Person"', () => {
    expect(result['@type']).toBe('Person');
  });

  test('name from author.name', () => {
    expect(result.name).toBe('Jane Doe');
  });

  test('url is canonical (no query/fragment)', () => {
    expect(result.url).toBe('https://example.com/authors/jane-doe');
  });

  test('url strips query string', () => {
    const r = buildAuthorJsonLd(authorDetailFull, 'https://example.com/authors/jane-doe?ref=home');
    expect(r.url).toBe('https://example.com/authors/jane-doe');
  });

  test('url strips fragment', () => {
    const r = buildAuthorJsonLd(authorDetailFull, 'https://example.com/authors/jane-doe#bio');
    expect(r.url).toBe('https://example.com/authors/jane-doe');
  });

  test('jobTitle from author.role', () => {
    expect(result.jobTitle).toBe('Senior Developer');
  });

  test('description from author.bio', () => {
    expect(result.description).toBe(
      'Jane is a senior developer with 10 years of experience in web technologies.',
    );
  });

  test('image is a string URL from safeUrlFor (400x400)', () => {
    expect(result.image).toBe('https://cdn.sanity.io/mock-image-400x400.jpg');
  });

  test('sameAs is array of cleaned URLs', () => {
    expect(result.sameAs).toEqual([
      'https://github.com/janedoe',
      'https://linkedin.com/in/janedoe',
    ]);
  });
});

// ===========================================================================
// 2. Optional field omission — minimal data
// ===========================================================================

describe('buildAuthorJsonLd — minimal data', () => {
  const result = buildAuthorJsonLd(authorDetailMinimal, TEST_URL);

  test('@type is always "Person"', () => {
    expect(result['@type']).toBe('Person');
  });

  test('name present from minimal author', () => {
    expect(result.name).toBe('John Smith');
  });

  test('jobTitle present when role is non-null', () => {
    // authorDetailMinimal has role: 'Contributor'
    expect(result.jobTitle).toBe('Contributor');
  });

  test('description omitted when bio is null', () => {
    expect(result).not.toHaveProperty('description');
  });

  test('image omitted when author.image is null', () => {
    expect(result).not.toHaveProperty('image');
  });

  test('sameAs omitted when author.sameAs is null', () => {
    expect(result).not.toHaveProperty('sameAs');
  });
});

describe('buildAuthorJsonLd — truly bare author (no role)', () => {
  const bareAuthor = {
    ...authorDetailMinimal,
    role: null,
  } as any;
  const result = buildAuthorJsonLd(bareAuthor, TEST_URL);

  test('jobTitle omitted when role is null', () => {
    expect(result).not.toHaveProperty('jobTitle');
  });
});

// ===========================================================================
// 3. Name fallbacks
// ===========================================================================

describe('buildAuthorJsonLd — name fallbacks', () => {
  test('name is "Unknown" when author.name is null', () => {
    const author = { ...authorDetailMinimal, name: null } as any;
    const result = buildAuthorJsonLd(author, TEST_URL);
    expect(result.name).toBe('Unknown');
  });

  test('name is "Unknown" when author.name is whitespace-only', () => {
    const author = { ...authorDetailMinimal, name: '   ' } as any;
    const result = buildAuthorJsonLd(author, TEST_URL);
    expect(result.name).toBe('Unknown');
  });

  test('name is "Unknown" when author.name is empty string', () => {
    const author = { ...authorDetailMinimal, name: '' } as any;
    const result = buildAuthorJsonLd(author, TEST_URL);
    expect(result.name).toBe('Unknown');
  });
});

// ===========================================================================
// 4. sameAs hardening
// ===========================================================================

describe('buildAuthorJsonLd — sameAs hardening', () => {
  test('whitespace-only entries are filtered out', () => {
    const author = {
      ...authorDetailMinimal,
      sameAs: ['https://github.com/test', '   ', 'https://twitter.com/test'],
    } as any;
    const result = buildAuthorJsonLd(author, TEST_URL);
    expect(result.sameAs).toEqual([
      'https://github.com/test',
      'https://twitter.com/test',
    ]);
  });

  test('empty strings are filtered out', () => {
    const author = {
      ...authorDetailMinimal,
      sameAs: ['', 'https://github.com/test', ''],
    } as any;
    const result = buildAuthorJsonLd(author, TEST_URL);
    expect(result.sameAs).toEqual(['https://github.com/test']);
  });

  test('valid URLs are preserved and trimmed', () => {
    const author = {
      ...authorDetailMinimal,
      sameAs: ['  https://github.com/test  ', '  https://linkedin.com/in/test  '],
    } as any;
    const result = buildAuthorJsonLd(author, TEST_URL);
    expect(result.sameAs).toEqual([
      'https://github.com/test',
      'https://linkedin.com/in/test',
    ]);
  });

  test('sameAs omitted when all entries are empty/whitespace', () => {
    const author = {
      ...authorDetailMinimal,
      sameAs: ['', '   ', '  '],
    } as any;
    const result = buildAuthorJsonLd(author, TEST_URL);
    expect(result).not.toHaveProperty('sameAs');
  });

  test('sameAs omitted when empty array', () => {
    const author = {
      ...authorDetailMinimal,
      sameAs: [],
    } as any;
    const result = buildAuthorJsonLd(author, TEST_URL);
    expect(result).not.toHaveProperty('sameAs');
  });
});

// ===========================================================================
// 5. URL validation
// ===========================================================================

describe('buildAuthorJsonLd — canonicalUrl validation', () => {
  test('throws TypeError for relative path', () => {
    expect(() => buildAuthorJsonLd(authorDetailFull, '/authors/jane-doe')).toThrow(TypeError);
  });

  test('throws TypeError for empty string', () => {
    expect(() => buildAuthorJsonLd(authorDetailFull, '')).toThrow(TypeError);
  });

  test('throws TypeError for garbage input', () => {
    expect(() => buildAuthorJsonLd(authorDetailFull, 'not a url at all')).toThrow(TypeError);
  });

  test('throws TypeError for non-http(s) scheme — file://', () => {
    expect(() => buildAuthorJsonLd(authorDetailFull, 'file:///etc/passwd')).toThrow(TypeError);
  });

  test('throws TypeError for non-http(s) scheme — blob:', () => {
    expect(() => buildAuthorJsonLd(authorDetailFull, 'blob:https://example.com/abc')).toThrow(TypeError);
  });

  test('accepts http:// URL', () => {
    const result = buildAuthorJsonLd(authorDetailFull, 'http://example.com/authors/jane-doe');
    expect(result.url).toBe('http://example.com/authors/jane-doe');
  });

  test('accepts https:// URL', () => {
    const result = buildAuthorJsonLd(authorDetailFull, 'https://example.com/authors/jane-doe');
    expect(result.url).toBe('https://example.com/authors/jane-doe');
  });

  test('error message includes the invalid URL', () => {
    expect(() => buildAuthorJsonLd(authorDetailFull, 'garbage')).toThrow(/garbage/);
  });

  test('error message mentions protocol for non-http scheme', () => {
    expect(() => buildAuthorJsonLd(authorDetailFull, 'ftp://example.com/')).toThrow(/ftp:/);
  });
});

// ===========================================================================
// 6. Cleanliness
// ===========================================================================

describe('buildAuthorJsonLd — cleanliness', () => {
  test('no @context in output (JsonLd component adds it)', () => {
    const result = buildAuthorJsonLd(authorDetailFull, TEST_URL);
    expect(result).not.toHaveProperty('@context');
  });

  test('no undefined values (full data)', () => {
    const result = buildAuthorJsonLd(authorDetailFull, TEST_URL);
    assertNoUndefined(result);
  });

  test('no undefined values (minimal data)', () => {
    const result = buildAuthorJsonLd(authorDetailMinimal, TEST_URL);
    assertNoUndefined(result);
  });

  test('no stega markers in output (full data)', () => {
    const result = buildAuthorJsonLd(authorDetailFull, TEST_URL);
    assertNoStegaMarkers(result);
  });

  test('no stega markers in output (minimal data)', () => {
    const result = buildAuthorJsonLd(authorDetailMinimal, TEST_URL);
    assertNoStegaMarkers(result);
  });

  test('JSON.stringify round-trip produces valid JSON', () => {
    const result = buildAuthorJsonLd(authorDetailFull, TEST_URL);
    const json = JSON.stringify(result);
    expect(() => JSON.parse(json)).not.toThrow();
    expect(JSON.parse(json)).toEqual(result);
  });

  test('no null values in output (full data)', () => {
    const result = buildAuthorJsonLd(authorDetailFull, TEST_URL);
    const json = JSON.stringify(result);
    const parsed = JSON.parse(json);
    const values = Object.values(parsed);
    expect(values).not.toContain(null);
  });

  test('no null values in output (minimal data)', () => {
    const result = buildAuthorJsonLd(authorDetailMinimal, TEST_URL);
    const json = JSON.stringify(result);
    const parsed = JSON.parse(json);
    const values = Object.values(parsed);
    expect(values).not.toContain(null);
  });
});

// ===========================================================================
// 7. Page integration (file content assertion)
// ===========================================================================

describe('authors/[slug].astro — JSON-LD integration', () => {
  const pagePath = resolve(__dirname, '../../pages/authors/[slug].astro');
  const pageContent = readFileSync(pagePath, 'utf-8');

  test('imports buildAuthorJsonLd', () => {
    expect(pageContent).toContain('buildAuthorJsonLd');
  });

  test('imports buildPageGraph', () => {
    expect(pageContent).toContain('buildPageGraph');
  });

  test('emits structured data via structured-data slot', () => {
    expect(pageContent).toContain('slot="structured-data"');
    expect(pageContent).toContain('application/ld+json');
    expect(pageContent).toContain('pageGraph');
  });
});

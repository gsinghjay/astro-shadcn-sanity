import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ArticleCategoryChips from '../ArticleCategoryChips.astro';

// Story 19.10 AC #20 — component unit tests for the category chip row.

const categories = [
  { _id: 'cat-1', title: 'News', slug: 'news' },
  { _id: 'cat-2', title: 'Blog', slug: 'blog' },
  { _id: 'cat-3', title: 'Announcements', slug: 'announcements' },
];

// Helpers — `[^>]*` regexes are unsafe here because the rendered class
// attribute contains literal `>` characters from Tailwind arbitrary variants
// like `[&>svg]:size-3`. Split on `<a` tag boundaries and match by content
// between opening `<a ...>` and the next `</a>`.
function splitAnchors(html: string): string[] {
  // First segment (before the first `<a`) is discarded. Each remaining
  // segment starts AFTER the `<a` token, so it contains the attribute
  // block followed by the inner text + `</a>`.
  return html.split(/<a\b/).slice(1);
}

function findAnchorByHref(html: string, href: string): string | null {
  for (const segment of splitAnchors(html)) {
    // Only consider the portion up to the closing `</a>` so adjacent
    // anchors can't contaminate the match.
    const anchor = segment.split('</a>')[0];
    if (anchor.includes(`href="${href}"`)) {
      return anchor;
    }
  }
  return null;
}

describe('ArticleCategoryChips', () => {
  test('renders nothing when categories is empty', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCategoryChips, {
      props: { categories: [] },
    });
    expect(html.trim()).toBe('');
  });

  test('renders nothing when categories only contains null/invalid entries', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCategoryChips, {
      props: {
        categories: [
          null,
          { _id: 'cat-x', title: null, slug: 'has-slug' },
          { _id: 'cat-y', title: 'Has Title', slug: null },
        ],
      },
    });
    expect(html.trim()).toBe('');
  });

  test('renders an "All" chip linking to /articles', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCategoryChips, {
      props: { categories },
    });
    const allAnchor = findAnchorByHref(html, '/articles');
    expect(allAnchor).not.toBeNull();
    // The anchor segment ends before `</a>`, so the inner text is at the
    // tail of the captured string. Match `>` (end of opening tag) followed
    // by optional whitespace and the literal `All`.
    expect(allAnchor).toMatch(/>\s*All\s*$/);
  });

  test('renders one chip per non-null category with category archive href', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCategoryChips, {
      props: { categories },
    });
    const newsAnchor = findAnchorByHref(html, '/articles/category/news');
    const blogAnchor = findAnchorByHref(html, '/articles/category/blog');
    const annAnchor = findAnchorByHref(html, '/articles/category/announcements');
    expect(newsAnchor).toMatch(/News/);
    expect(blogAnchor).toMatch(/Blog/);
    expect(annAnchor).toMatch(/Announcements/);
  });

  test('filters out categories with null title OR null slug', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCategoryChips, {
      props: {
        categories: [
          { _id: 'cat-1', title: 'News', slug: 'news' },
          { _id: 'cat-2', title: null, slug: 'broken-no-title' },
          { _id: 'cat-3', title: 'Broken No Slug', slug: null },
          null,
          { _id: 'cat-4', title: 'Blog', slug: 'blog' },
        ],
      },
    });
    expect(findAnchorByHref(html, '/articles/category/news')).not.toBeNull();
    expect(findAnchorByHref(html, '/articles/category/blog')).not.toBeNull();
    expect(html).not.toContain('broken-no-title');
    expect(html).not.toContain('Broken No Slug');
  });

  test('highlights the "All" chip (variant="default") when currentCategorySlug is undefined', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCategoryChips, {
      props: { categories },
    });
    // The default Badge variant uses `bg-primary text-primary-foreground`.
    // Isolate each chip anchor by href, then assert the "All" chip carries
    // the default classes while category chips do not.
    const allAnchor = findAnchorByHref(html, '/articles');
    expect(allAnchor).not.toBeNull();
    expect(allAnchor).toContain('bg-primary');

    const newsAnchor = findAnchorByHref(html, '/articles/category/news');
    expect(newsAnchor).not.toBeNull();
    expect(newsAnchor).not.toContain('bg-primary');
  });

  test('highlights the matching category chip (variant="default") when currentCategorySlug matches', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCategoryChips, {
      props: { categories, currentCategorySlug: 'news' },
    });

    const newsAnchor = findAnchorByHref(html, '/articles/category/news');
    expect(newsAnchor).not.toBeNull();
    expect(newsAnchor).toContain('bg-primary');

    const allAnchor = findAnchorByHref(html, '/articles');
    expect(allAnchor).not.toBeNull();
    expect(allAnchor).not.toContain('bg-primary');

    const blogAnchor = findAnchorByHref(html, '/articles/category/blog');
    expect(blogAnchor).not.toBeNull();
    expect(blogAnchor).not.toContain('bg-primary');
  });

  test('applies GTM analytics attributes to every chip', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCategoryChips, {
      props: { categories },
    });
    const anchors = splitAnchors(html).map((seg) => seg.split('</a>')[0]);
    // 1 "All" + 3 categories = 4 chips
    expect(anchors).toHaveLength(4);
    anchors.forEach((anchor) => {
      expect(anchor).toContain('data-gtm-category="article"');
      expect(anchor).toContain('data-gtm-action="category-nav"');
    });

    // "All" chip label is the literal 'all', category chips use their slug.
    const allAnchor = findAnchorByHref(html, '/articles')!;
    expect(allAnchor).toContain('data-gtm-label="all"');

    const newsAnchor = findAnchorByHref(html, '/articles/category/news')!;
    expect(newsAnchor).toContain('data-gtm-label="news"');
  });

  test('wraps chips in a <nav> with accessible label', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCategoryChips, {
      props: { categories },
    });
    expect(html).toContain('aria-label="Article categories"');
    expect(html).toMatch(/<nav[^>]*aria-label="Article categories"/);
  });
});

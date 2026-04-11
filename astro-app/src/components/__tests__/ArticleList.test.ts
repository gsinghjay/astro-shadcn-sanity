import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ArticleList from '../blocks/custom/ArticleList.astro';
import {
  articleListFull,
  articleListSplitFeatured,
  articleListVariantList,
  articleListMinimal,
  sampleArticles,
  sampleArticlesWithImages,
} from './__fixtures__/article-list';

describe('ArticleList (Story 19.4)', () => {
  describe('heading / description / CTA rendering', () => {
    test('renders heading and description in grid variant', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: sampleArticles },
      });

      expect(html).toContain('Latest Articles');
      expect(html).toContain('Stay up to date with our news');
    });

    test('renders CTA button links', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: sampleArticles },
      });

      expect(html).toContain('View All Articles');
      expect(html).toContain('/articles');
    });

    test('renders outline button variant correctly', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListVariantList, articles: sampleArticles },
      });

      expect(html).toContain('More News');
      expect(html).toContain('/news');
    });
  });

  describe('empty state (AC #6: no articles)', () => {
    test('grid variant shows "No articles to display" when articles is empty', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: [] },
      });

      expect(html).toContain('No articles to display');
    });

    test('split-featured variant shows empty state when articles is empty', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListSplitFeatured, articles: [] },
      });

      expect(html).toContain('No articles to display');
    });

    test('list variant shows empty state when articles is empty', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListVariantList, articles: [] },
      });

      expect(html).toContain('No articles to display');
    });
  });

  describe('article rendering (AC #9: links to /articles/{slug})', () => {
    test('grid variant links each article to /articles/{slug}', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: sampleArticles },
      });

      expect(html).toContain('href="/articles/astro-5-released"');
      expect(html).toContain('href="/articles/sanity-visual-editing-tips"');
      expect(html).toContain('href="/articles/css-container-queries"');
    });

    test('grid variant renders article titles', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: sampleArticles },
      });

      expect(html).toContain('Astro 5 Released');
      expect(html).toContain('Sanity Visual Editing Tips');
      expect(html).toContain('Why CSS Container Queries Matter');
    });

    test('grid variant renders article excerpts', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: sampleArticles },
      });

      expect(html).toContain('The next major version of Astro');
      expect(html).toContain('component-driven responsive design');
    });

    test('grid variant renders category badges', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: sampleArticles },
      });

      expect(html).toContain('News');
      expect(html).toContain('Blog');
    });

    test('grid variant renders formatted publishedAt dates', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: sampleArticles },
      });

      // "Apr 1, 2026" or similar toLocaleDateString('en-US', short month) format
      expect(html).toMatch(/Apr \d+, 2026/);
      expect(html).toMatch(/Mar \d+, 2026/);
    });
  });

  describe('variant layout markers', () => {
    test('grid variant uses grid layout marker', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: sampleArticles },
      });
      expect(html).toContain('data-variant="grid"');
    });

    test('split-featured variant uses split layout (AC #8: featured + grid)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListSplitFeatured, articles: sampleArticles },
      });
      expect(html).toContain('data-variant="split-featured"');
      expect(html).toContain('data-slot="section-split"');
      // Featured article: first article rendered
      expect(html).toContain('Astro 5 Released');
      // Remaining articles also rendered
      expect(html).toContain('Sanity Visual Editing Tips');
    });

    test('list variant uses divide-y list layout', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListVariantList, articles: sampleArticles },
      });
      expect(html).toContain('data-variant="list"');
      expect(html).toContain('divide-y');
    });
  });

  describe('list variant hides description (existing behavior)', () => {
    test('does not render description text in list variant', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListVariantList, articles: sampleArticles },
      });
      expect(html).toContain('News');
      expect(html).not.toContain('This should be hidden in list variant');
    });
  });

  describe('split-featured variant heading', () => {
    test('renders heading and description', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListSplitFeatured, articles: sampleArticles },
      });
      expect(html).toContain('Featured Articles');
      expect(html).toContain('Our top picks');
    });
  });

  describe('image rendering (AC #10)', () => {
    test('grid variant renders images at 640x360 with lazy loading and LQIP', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: sampleArticlesWithImages },
      });

      expect(html).toContain('width="640"');
      expect(html).toContain('height="360"');
      expect(html).toContain('loading="lazy"');
      expect(html).toContain('background-image: url(data:image/jpeg;base64,');
      expect(html).toContain('alt="Featured article illustration"');
    });

    test('grid variant builds urlFor-derived image URLs (not raw asset.url)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: sampleArticlesWithImages },
      });

      // urlFor() produces URLs with width/height/fit query params + format auto
      expect(html).toMatch(/cdn\.sanity\.io\/images\/test-project\/test-dataset\/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000\.jpg\?[^"]*w=640[^"]*h=360/);
    });

    test('split-featured variant renders featured at 800x450 and side at 320x180', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListSplitFeatured, articles: sampleArticlesWithImages },
      });

      // Featured (first article, large)
      expect(html).toContain('width="800"');
      expect(html).toContain('height="450"');
      // Side card (remaining, compact)
      expect(html).toContain('width="320"');
      expect(html).toContain('height="180"');
      // Both images lazy-loaded with LQIP backgrounds
      expect(html).toContain('loading="lazy"');
      expect(html).toContain('background-image: url(data:image/jpeg;base64,/9j/4AAQFeatured');
      expect(html).toContain('background-image: url(data:image/jpeg;base64,/9j/4AAQSide');
    });

    test('list variant does not render article images', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListVariantList, articles: sampleArticlesWithImages },
      });

      // None of the card image dimensions appear
      expect(html).not.toContain('width="640"');
      expect(html).not.toContain('width="800"');
      expect(html).not.toContain('width="320"');
      expect(html).not.toContain('background-image: url(data:image');
    });
  });

  describe('minimal props safety', () => {
    test('handles minimal data without crashing', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, { props: articleListMinimal });
      expect(html).toBeDefined();
      // Minimal (null variant) defaults to 'grid', articles empty => empty state
      expect(html).toContain('No articles to display');
    });

    test('filters out articles with null slug (cannot link to a detail page)', async () => {
      const container = await AstroContainer.create();
      const mixedArticles = [
        {
          _id: 'a-no-slug',
          title: 'Article Without Slug',
          slug: null,
          excerpt: 'This article has no slug.',
          featuredImage: null,
          author: null,
          publishedAt: '2026-04-02T12:00:00Z',
          category: null,
        },
        {
          _id: 'a-valid',
          title: 'Valid Article',
          slug: 'valid-article',
          excerpt: 'This one is fine.',
          featuredImage: null,
          author: null,
          publishedAt: '2026-04-01T12:00:00Z',
          category: null,
        },
      ] as never;
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: mixedArticles },
      });
      // Null-slug article dropped — never renders anything pointing at a bad URL
      expect(html).not.toContain('Article Without Slug');
      expect(html).not.toContain('href="/articles/"'); // bare listing URL must NEVER appear
      // Valid article still rendered
      expect(html).toContain('Valid Article');
      expect(html).toContain('href="/articles/valid-article"');
    });

    test('shows empty state when ALL articles are filtered out by null slug', async () => {
      const container = await AstroContainer.create();
      const onlyNullSlugs = [
        {
          _id: 'a-1',
          title: 'Article 1',
          slug: null,
          excerpt: null,
          featuredImage: null,
          author: null,
          publishedAt: null,
          category: null,
        },
      ] as never;
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: onlyNullSlugs },
      });
      expect(html).toContain('No articles to display');
      expect(html).not.toContain('href="/articles/"');
    });

    test('formatDate returns null for unparseable date strings (no "Invalid Date" leak)', async () => {
      const container = await AstroContainer.create();
      const badDateArticle = [
        {
          _id: 'a-bad-date',
          title: 'Article With Bad Date',
          slug: 'bad-date',
          excerpt: null,
          featuredImage: null,
          author: null,
          publishedAt: 'not-a-real-date',
          category: null,
        },
      ] as never;
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: badDateArticle },
      });
      // The literal "Invalid Date" string must not leak to users
      expect(html).not.toContain('Invalid Date');
      // Article still renders (just without the date)
      expect(html).toContain('Article With Bad Date');
    });

    test('handles articles with missing optional fields', async () => {
      const container = await AstroContainer.create();
      const minimalArticle = [
        {
          _id: 'a-min',
          title: 'Minimal',
          slug: 'minimal',
          excerpt: null,
          featuredImage: null,
          author: null,
          publishedAt: null,
          category: null,
        },
      ] as never;
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: minimalArticle },
      });
      expect(html).toContain('Minimal');
      expect(html).toContain('href="/articles/minimal"');
    });
  });
});

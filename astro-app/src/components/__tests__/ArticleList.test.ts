import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ArticleList from '../blocks/custom/ArticleList.astro';
import {
  articleListFull,
  articleListSplitFeatured,
  articleListVariantList,
  articleListMinimal,
  articleListBrutalist,
  articleListMagazine,
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

      // Story 19.8: grid variant now delegates to ArticleCard which formats dates
      // with toLocaleDateString('en-US', { month: 'long', ... }) — long month form.
      expect(html).toMatch(/April \d+, 2026/);
      expect(html).toMatch(/March \d+, 2026/);
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

  describe('image rendering (AC #10, Story 19.8 updated to ArticleCard dimensions)', () => {
    test('grid variant renders images via ArticleCard at 1280x720 with srcset and LQIP', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: sampleArticlesWithImages },
      });

      // Story 19.8: grid variant now reuses ArticleCard, which emits 1280x720
      // base dimensions + a responsive srcset spanning [480..1920] widths.
      expect(html).toContain('width="1280"');
      expect(html).toContain('height="720"');
      expect(html).toContain('srcset=');
      expect(html).toContain('loading="lazy"');
      expect(html).toContain('background-image: url(data:image/jpeg;base64,');
      expect(html).toContain('alt="Featured article illustration"');
    });

    test('grid variant builds urlFor-derived image URLs (not raw asset.url)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: sampleArticlesWithImages },
      });

      // urlFor() produces URLs with width/height/fit query params + format auto.
      // ArticleCard emits 1280x720 base dimensions.
      expect(html).toMatch(/cdn\.sanity\.io\/images\/test-project\/test-dataset\/Tb9Ew8CXIwaY6R1kjMvI0uRR-2000x3000\.jpg\?[^"]*w=1280[^"]*h=720/);
    });

    test('split-featured variant renders featured via ArticleCard (1280x720 + srcset) and side at 320x180', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListSplitFeatured, articles: sampleArticlesWithImages },
      });

      // Featured (first article) now rendered via ArticleCard (Story 19.8)
      expect(html).toContain('width="1280"');
      expect(html).toContain('height="720"');
      expect(html).toContain('srcset=');
      // Side card (remaining) still uses inline 320x180 markup — Story 19.8 deliberately
      // kept this layout since ArticleCard's 1280x720 aspect is wrong for a sidebar row.
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

      // No card image markup should appear in the list variant
      expect(html).not.toContain('width="1280"');
      expect(html).not.toContain('width="320"');
      expect(html).not.toContain('srcset=');
      expect(html).not.toContain('background-image: url(data:image');
    });
  });

  describe('ArticleCard reuse (Story 19.8 DRY refactor, AC #6 + #7)', () => {
    test('grid variant emits ArticleCard-distinctive srcset on article images', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: sampleArticlesWithImages },
      });

      // ArticleCard is the only renderer that emits a srcset attribute for ArticleList.
      // Its presence proves the grid variant is routing through ArticleCard.
      expect(html).toContain('srcset=');
      // ArticleCard also emits the article href + title as a distinctive marker.
      expect(html).toContain('href="/articles/featured-with-image"');
      expect(html).toContain('Featured Article With Image');
    });

    test('split-featured variant emits ArticleCard srcset on the featured article', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListSplitFeatured, articles: sampleArticlesWithImages },
      });

      // ArticleCard srcset on the featured article + the featured article title.
      expect(html).toContain('srcset=');
      expect(html).toContain('Featured Article With Image');
      // sizes attribute is distinctive to ArticleCard's responsive image markup.
      expect(html).toContain('sizes=');
    });
  });

  describe('brutalist variant (Story 19.8)', () => {
    test('renders with data-variant="brutalist"', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListBrutalist, articles: sampleArticles },
      });
      expect(html).toContain('data-variant="brutalist"');
    });

    test('renders articles with label-caps category tags (not Badge)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListBrutalist, articles: sampleArticles },
      });
      // label-caps utility class is the brutalist category marker (AC #14)
      expect(html).toContain('label-caps');
      // Category title still rendered
      expect(html).toContain('News');
      expect(html).toContain('Blog');
    });

    test('renders brutalist heading treatment with border-l-4 border-primary', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListBrutalist, articles: sampleArticles },
      });
      // AC #12: brutalist heading reuses CardGrid.astro's border-l-4 border-primary pl-6 pattern
      expect(html).toContain('border-l-4 border-primary pl-6');
      expect(html).toContain('Dispatches');
    });

    test('wraps articles in brutalist frame with border-brutal border-foreground', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListBrutalist, articles: sampleArticles },
      });
      // AC #13 + #16: brutalist frame with border-brutal utility from global.css
      expect(html).toContain('border-brutal');
    });

    test('shows empty state when articles is empty', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListBrutalist, articles: [] },
      });
      expect(html).toContain('No articles to display');
    });

    test('renders CTA buttons inside SectionActions', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListBrutalist, articles: sampleArticles },
      });
      // AC #23: CTA buttons still render on new variants
      expect(html).toContain('Read the archive');
    });
  });

  describe('magazine variant (Story 19.8)', () => {
    test('renders with data-variant="magazine"', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListMagazine, articles: sampleArticles },
      });
      expect(html).toContain('data-variant="magazine"');
    });

    test('renders first article as an editorial hero with oversized headline', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListMagazine, articles: sampleArticles },
      });
      // AC #19: first article is the editorial hero
      expect(html).toContain('Astro 5 Released');
      // Hero uses oversized headline (text-4xl md:text-6xl per hero treatment)
      expect(html).toContain('text-4xl md:text-6xl');
    });

    test('hero image uses aspect-[16/9] and eager/high priority loading', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListMagazine, articles: sampleArticlesWithImages },
      });
      // Hero image is a dedicated inline hero with 1600x900 dimensions
      expect(html).toContain('aspect-[16/9]');
      expect(html).toContain('width="1600"');
      expect(html).toContain('height="900"');
      expect(html).toContain('loading="eager"');
      expect(html).toContain('fetchpriority="high"');
    });

    test('renders remaining articles in a grid when there are >= 2 articles', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListMagazine, articles: sampleArticles },
      });
      // AC #20: remaining articles in responsive grid after hero
      expect(html).toContain('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
      // Both non-hero articles rendered
      expect(html).toContain('Sanity Visual Editing Tips');
      expect(html).toContain('Why CSS Container Queries Matter');
    });

    test('with exactly 1 article renders only the hero (no remaining-articles grid)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListMagazine, articles: [sampleArticles[0]] },
      });
      // Hero still renders
      expect(html).toContain('Astro 5 Released');
      // AC #21: no remaining-grid marker when there is only 1 article
      expect(html).not.toContain('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
    });

    test('shows empty state when articles is empty', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListMagazine, articles: [] },
      });
      expect(html).toContain('No articles to display');
    });

    test('renders CTA buttons inside SectionActions', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListMagazine, articles: sampleArticles },
      });
      // AC #23: CTA buttons still render on new variants
      expect(html).toContain('Browse all issues');
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

    test('local formatDate helper returns null for unparseable date strings (no "Invalid Date" leak)', async () => {
      // Story 19.8 scope note: the grid/split-featured variants now delegate date
      // formatting to ArticleCard (see Story 19.3), which owns its own date rendering.
      // The `formatDate` helper still lives in ArticleList.astro and is used by the
      // `list` and `brutalist` variants' inline markup. Test that helper's defensive
      // behavior on a variant that still owns it (`list`).
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
        props: { ...articleListVariantList, articles: badDateArticle },
      });
      // The literal "Invalid Date" string must not leak to users
      expect(html).not.toContain('Invalid Date');
      // Article still renders (just without the date — a "—" fallback)
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

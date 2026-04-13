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
  articleListWithNewsletterCta,
  articleListBrutalistWithNewsletterCta,
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

    test('split-featured sidebar thumbnails emit retina srcset with sizes="128px"', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListSplitFeatured, articles: sampleArticlesWithImages },
      });
      // Sidebar thumbs are fixed at w-32 (128px CSS) across breakpoints — srcset
      // widths [128, 256, 384, 512] target DPR variants, not layout widths.
      expect(html).toContain('sizes="128px"');
      // The 512w descriptor is unique to the sidebar srcset (not emitted by
      // ArticleCard's [480, 640, 960, 1280, 1600, 1920] widths), so it proves
      // the sidebar's own srcset was wired up.
      expect(html).toMatch(/\b512w\b/);
    });

    test('split-featured sidebar row uses items-start to prevent thumbnail stretch', async () => {
      // Regression guard: without `items-start` on the <article> flex row, the
      // sidebar's default `align-items: stretch` overrode the thumbnail anchor's
      // aspect-video intrinsic height, stretching the thumbnail vertically to
      // match the text column (which itself was stretched by SectionSplit's
      // grid-default align-items: stretch on the sidebar column). The chain of
      // three stretches made the 128x72 thumbnail render many times taller.
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListSplitFeatured, articles: sampleArticlesWithImages },
      });
      // The `items-start` class must appear on the sidebar article row's flex
      // container so the thumbnail stays at its intrinsic aspect-video size.
      expect(html).toContain('flex items-start gap-4');
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

    test('brutalist cards emit responsive srcset + sizes (mobile perf)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListBrutalist, articles: sampleArticlesWithImages },
      });
      // Brutalist variant uses widths [320, 480, 640, 960, 1280]. The `sizes` hint
      // is calibrated to SectionGrid size="default" auto-fit behavior (2 cols at
      // 640-900px, 3 cols at 900-1180px, 4 cols at 1180-1440px, 5 cols at 1440+px)
      // — patched after the initial 19.8 review caught a 1024/768 hint mismatch.
      expect(html).toContain('srcset=');
      expect(html).toContain(
        'sizes="(min-width: 1440px) 20vw, (min-width: 1180px) 25vw, (min-width: 900px) 33vw, (min-width: 640px) 50vw, 100vw"',
      );
      expect(html).toMatch(/\b320w\b/);
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

    test('hero image emits a responsive srcset + sizes for LCP budget', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListMagazine, articles: sampleArticlesWithImages },
      });
      // LCP fix: hero must ship a responsive srcset so mobile viewports don't
      // download the full 1600x900 asset. widths array: [640, 960, 1280, 1600, 1920].
      expect(html).toContain('srcset=');
      expect(html).toContain('sizes="100vw"');
      expect(html).toMatch(/\bw=640\b/);
      expect(html).toMatch(/\bw=1920\b/);
    });

    test('renders remaining articles in a grid when there are >= 2 articles', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListMagazine, articles: sampleArticles },
      });
      // AC #20: remaining articles in responsive grid after hero. With 3 articles
      // total (2 remaining), the post-review tier logic now uses @md:grid-cols-2
      // without @lg:grid-cols-3 — the 3-col class only activates with ≥3 remaining.
      expect(html).toContain('@md:grid-cols-2');
      // Both non-hero articles rendered
      expect(html).toContain('Sanity Visual Editing Tips');
      expect(html).toContain('Why CSS Container Queries Matter');
    });

    test('with exactly 2 articles renders hero + contained single-card layout for 1 remaining', async () => {
      // Post-review patch: a lone remaining card no longer orphans inside a
      // 3-col grid. It renders in a centered max-w-3xl container instead.
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListMagazine, articles: sampleArticles.slice(0, 2) },
      });
      // Hero (article[0]) renders
      expect(html).toContain('Astro 5 Released');
      // Remaining single article (article[1]) renders in the contained layout
      expect(html).toContain('Sanity Visual Editing Tips');
      expect(html).toContain('max-w-3xl mx-auto');
      // Neither grid tier class is emitted for a single remaining item
      expect(html).not.toContain('@md:grid-cols-2');
      expect(html).not.toContain('@lg:grid-cols-3');
    });

    test('with >=4 articles uses @lg:grid-cols-3 for the remaining-articles grid', async () => {
      // Post-review patch: the 3-col class only activates when ≥3 articles remain
      // (i.e., ≥4 total articles once the hero is extracted).
      const fourArticles = [
        ...sampleArticles,
        {
          _id: 'article-4',
          title: 'Fourth Article for Grid Coverage',
          slug: 'fourth-article',
          excerpt: 'A fourth article to exercise the @lg:grid-cols-3 tier.',
          featuredImage: null,
          author: { name: 'Sam Taylor', slug: 'sam-taylor' },
          publishedAt: '2026-02-15T09:00:00Z',
          category: { _id: 'cat-blog', title: 'Blog', slug: 'blog' },
        },
      ] as typeof sampleArticles;
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListMagazine, articles: fourArticles },
      });
      // 4 total → 3 remaining → full 3-col tier activated
      expect(html).toContain('grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3');
      expect(html).toContain('Fourth Article for Grid Coverage');
    });

    test('with exactly 1 article renders only the hero (no remaining-articles layout)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListMagazine, articles: [sampleArticles[0]] },
      });
      // Hero still renders
      expect(html).toContain('Astro 5 Released');
      // AC #21: no remaining-grid marker when there is only 1 article.
      // Neither the 3-col tier NOR the single-card contained layout renders.
      expect(html).not.toContain('grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3');
      expect(html).not.toContain('max-w-3xl mx-auto');
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

  describe('showNewsletterCta flag (Story 19.7)', () => {
    test('grid variant renders the compact ArticleNewsletterCta when showNewsletterCta is true', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListWithNewsletterCta, articles: sampleArticles },
      });
      // Presence: compact form carries the article-list-block GTM label
      expect(html).toContain('data-gtm-label="article-list-block"');
      // And is an actual <form> with the email input
      expect(html).toContain('type="email"');
    });

    test('grid variant does NOT render the CTA when showNewsletterCta is false (articleListFull default)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListFull, articles: sampleArticles },
      });
      expect(html).not.toContain('data-gtm-label="article-list-block"');
    });

    test('grid variant does NOT render the CTA when showNewsletterCta is explicitly false', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: {
          ...articleListWithNewsletterCta,
          showNewsletterCta: false,
          articles: sampleArticles,
        },
      });
      expect(html).not.toContain('data-gtm-label="article-list-block"');
    });

    test('grid variant does NOT render the CTA when showNewsletterCta is null (articleListMinimal default)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListMinimal, articles: sampleArticles },
      });
      expect(html).not.toContain('data-gtm-label="article-list-block"');
    });

    test('brutalist variant ALSO renders the compact CTA when the flag is true — proves shared template insertion', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListBrutalistWithNewsletterCta, articles: sampleArticles },
      });
      expect(html).toContain('data-gtm-label="article-list-block"');
    });

    test('CTA is rendered even when articles is empty (toggle is independent of content)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListWithNewsletterCta, articles: [] },
      });
      // Empty state still renders
      expect(html).toContain('No articles to display');
      // And so does the CTA — the toggle is editor-controlled, not data-gated
      expect(html).toContain('data-gtm-label="article-list-block"');
    });

    test('CTA appears AFTER the card markup and BEFORE ctaButtons in source order', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(ArticleList, {
        props: { ...articleListWithNewsletterCta, articles: sampleArticles },
      });
      const firstArticleIdx = html.indexOf('Astro 5 Released');
      const ctaIdx = html.indexOf('data-gtm-label="article-list-block"');
      const ctaButtonIdx = html.indexOf('View All Articles');

      expect(firstArticleIdx).toBeGreaterThan(-1);
      expect(ctaIdx).toBeGreaterThan(-1);
      expect(ctaButtonIdx).toBeGreaterThan(-1);

      // Order: cards → compact CTA → ctaButtons
      expect(ctaIdx).toBeGreaterThan(firstArticleIdx);
      expect(ctaButtonIdx).toBeGreaterThan(ctaIdx);
    });
  });
});

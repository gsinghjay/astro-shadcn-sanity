/**
 * Shared article fixture for Storybook stories.
 *
 * Lives alongside components (not under __tests__/) so .stories.ts files can
 * import realistic Article objects without pulling in the Vitest-coupled
 * `as any` fixtures in __tests__/__fixtures__/articles.ts.
 *
 * Asset IDs are REAL references from the `49nk9b0w/production` dataset —
 * .storybook/main.ts stubs `sanity:client` with that projectId, so
 * `urlFor()` / `safeUrlFor()` in lib/image.ts produce working
 * `cdn.sanity.io/images/49nk9b0w/production/...` URLs in the Canvas tab.
 * LQIP strings are real too so the blur-up placeholders display correctly.
 *
 * The fixture intentionally covers every branch exercised by ArticleCard and
 * ArticleList:
 *   - full card (image + author + category)
 *   - no featuredImage
 *   - no author
 *   - author.name set but author.slug null (unlinked byline)
 *   - long title (wraps / truncates)
 *   - long excerpt (exercises line-clamp-3)
 *   - at least two distinct categories (Program News, Tutorials, Engineering)
 *   - two articles with ≥2 tags each
 */
import type { Article } from '@/lib/sanity';

/**
 * Story fixtures extend Article with an optional `tags: string[]` field.
 * The canonical Article type (derived from ALL_ARTICLES_QUERY_RESULT) does
 * NOT project tags — they only live on ARTICLE_BY_SLUG_QUERY_RESULT. Adding
 * tags here via intersection keeps the fixture type-safe for any Article[]
 * consumer while still satisfying AC #1's "tags string array" requirement.
 */
export type StoryArticle = Article & { tags?: string[] };

// Real asset IDs queried from 49nk9b0w/production via
// mcp__plugin_sanity-plugin_Sanity__query_documents on 2026-04-11.
const REAL_ASSET_1 = {
  _id: 'image-365149ec88f5f2c21c9bd2640003c00dd1d49af0-1424x752-jpg',
  url: null,
  metadata: {
    lqip:
      'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAALABQDASIAAhEBAxEB/8QAGAAAAgMAAAAAAAAAAAAAAAAAAAUEBgf/xAAkEAACAQMDAwUAAAAAAAAAAAABAwIABBIFBhETMTIhQVGhsf/EABYBAQEBAAAAAAAAAAAAAAAAAAUBAv/EAB0RAQACAAcAAAAAAAAAAAAAAAEAAgMEERIhMfD/2gAMAwEAAhEDEQA/AMn2zZW/UE0pDGEEYHxpqLPT2CcCgdeMuMR25+Ki2ZNlt62danptmBlIdzSZt0+LuYskDKfqR707qBCBcRX3Ebv1t9g6VvErQInww5+6Krm4XtXqc4wmQMR+UVFJuuWpc3J3P//Z',
    dimensions: {
      _type: 'sanity.imageDimensions' as const,
      width: 1424,
      height: 752,
      aspectRatio: 1.8936170212765957,
    },
  },
};

const REAL_ASSET_2 = {
  _id: 'image-a5f976c09a37200d4925b57711834e072fa71334-1376x768-jpg',
  url: null,
  metadata: {
    lqip:
      'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAALABQDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAABQAGCP/EACEQAAIBBAICAwAAAAAAAAAAAAECAwAEBRETIRJBIjFx/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwH/xAAaEQACAwEBAAAAAAAAAAAAAAAAAQIREjFB/9oADAMBAAIRAxEAPwDn/CYaK4UyXM4ihX712T+Ui1vhlJWLkc+y3VECRksogjEDW+qPjlfk35GkU7I4KNGiODx03zS5Kg+tVUCsjgDTEVUT14xFmuH/2Q==',
    dimensions: {
      _type: 'sanity.imageDimensions' as const,
      width: 1376,
      height: 768,
      aspectRatio: 1.7916666666666667,
    },
  },
};

const CATEGORY_PROGRAM_NEWS = {
  _id: '7ee08c97-701d-437c-a497-0b7fed6b191a',
  title: 'Program News',
  slug: 'program-news',
};

const CATEGORY_TUTORIALS = {
  _id: 'cat-tutorials',
  title: 'Tutorials',
  slug: 'tutorials',
};

const CATEGORY_ENGINEERING = {
  _id: 'cat-engineering',
  title: 'Engineering',
  slug: 'engineering',
};

export const storyArticles: StoryArticle[] = [
  // 0: Full article — real image, real author, tags, Program News category
  {
    _id: 'story-art-1',
    title: 'Building the YWCC Capstone and RWC Web Platform',
    slug: 'building-ywcc-capstone-rwc-platform',
    excerpt:
      'How we built three independent program websites from a single shared codebase using Astro, Sanity, and Cloudflare — at just $15/month combined operating cost.',
    featuredImage: {
      asset: REAL_ASSET_1,
      alt: 'Diagram of a shared web platform powering three independent YWCC program websites',
      hotspot: null,
      crop: null,
    },
    author: { name: 'Jay Singh', slug: 'jay-singh' },
    publishedAt: '2026-04-11T00:00:00Z',
    category: CATEGORY_PROGRAM_NEWS,
    tags: ['platform', 'architecture', 'sanity', 'astro', 'cloudflare'],
  },

  // 1: Long title — ≥80 chars — exercises headline wrap/truncate
  {
    _id: 'story-art-2',
    title:
      'How We Use Cloudflare Workers, D1, KV, Durable Objects, AI Search, and Turnstile to Run Three Independent Websites for $15 per Month',
    slug: 'cloudflare-usage-ywcc-rwc-platform',
    excerpt:
      'A tour of every Cloudflare service powering the YWCC Capstone and RWC platform — Pages, Workers, D1, KV, Durable Objects, AI Search, and Turnstile — and why we chose each one.',
    featuredImage: {
      asset: REAL_ASSET_2,
      alt: 'Diagram of three program websites all running on Cloudflare services for $15 per month',
      hotspot: null,
      crop: null,
    },
    author: { name: 'Jay Singh', slug: 'jay-singh' },
    publishedAt: '2026-04-09T09:30:00Z',
    category: CATEGORY_ENGINEERING,
    tags: ['cloudflare', 'workers', 'd1', 'kv', 'durable-objects'],
  },

  // 2: Long excerpt — ≥250 chars — exercises line-clamp-3
  {
    _id: 'story-art-3',
    title: 'Designing Content Models for Multi-Site Headless CMS Delivery',
    slug: 'content-modeling-multi-site-cms',
    excerpt:
      'A deep dive into the trade-offs of dataset-per-site versus document-field-per-site content modeling in Sanity, with real examples from our YWCC Capstone and RWC platform migration. We cover reference integrity, editor ergonomics, GROQ query shape, caching implications, and the rationale behind our hybrid approach that uses site-aware filtering at the query layer instead of dataset isolation.',
    featuredImage: {
      asset: REAL_ASSET_1,
      alt: 'Schema diagram showing site-aware content modeling',
      hotspot: null,
      crop: null,
    },
    author: { name: 'Jay Singh', slug: 'jay-singh' },
    publishedAt: '2026-03-28T14:00:00Z',
    category: CATEGORY_TUTORIALS,
    // No tags field — exercises the tag-less branch (tags is optional on StoryArticle)
  },

  // 3: No featured image — exercises img-optional branch in ArticleCard
  {
    _id: 'story-art-4',
    title: 'Why We Ditched a Traditional Headless Stack for Astro + Sanity',
    slug: 'why-astro-sanity',
    excerpt:
      'The case for SSG-first architecture in an SSR-default world. Zero JavaScript on public pages, instant LCP, and a $0/month hosting bill.',
    featuredImage: null,
    author: { name: 'Alex Rivera', slug: 'alex-rivera' },
    publishedAt: '2026-03-14T11:15:00Z',
    category: CATEGORY_ENGINEERING,
    tags: ['astro', 'sanity', 'ssg'],
  },

  // 4: No author — exercises byline-hidden branch
  {
    _id: 'story-art-5',
    title: 'Release Notes: Sprint 19 Summary',
    slug: 'release-notes-sprint-19',
    excerpt:
      'New blocks, new variants, bug fixes, and performance improvements shipped in Sprint 19 of the YWCC Capstone platform.',
    featuredImage: {
      asset: REAL_ASSET_2,
      alt: 'Release notes banner',
      hotspot: null,
      crop: null,
    },
    author: null,
    publishedAt: '2026-03-01T08:00:00Z',
    category: CATEGORY_PROGRAM_NEWS,
  },

  // 5: author.name set but author.slug null — unlinked byline branch
  {
    _id: 'story-art-6',
    title: 'Guest Post: Lessons From a Headless CMS Migration',
    slug: 'guest-post-headless-migration',
    excerpt:
      'A guest contributor shares hard-won lessons from migrating a 5,000-page corporate marketing site from Drupal to Sanity — with CDN caching, editorial workflows, and redirect maps all intact.',
    featuredImage: {
      asset: REAL_ASSET_1,
      alt: 'Headless CMS migration diagram',
      hotspot: null,
      crop: null,
    },
    author: { name: 'Anonymous Contributor', slug: null },
    publishedAt: '2026-02-18T16:45:00Z',
    category: CATEGORY_TUTORIALS,
  },
];

/**
 * Named fixture aliases — one per ArticleCard rendering branch.
 *
 * Story files should reference these directly instead of using `.find()`
 * predicates on `storyArticles`, so that:
 *   - TypeScript catches fixture-index drift at compile time,
 *   - story files self-document which branch they demonstrate,
 *   - reordering the `storyArticles` array can't silently break Canvas rendering.
 *
 * The role labels below mirror the fixture coverage matrix in the JSDoc at
 * the top of this file.
 */
export const storyArticleFull = storyArticles[0]; // image + author + tags
export const storyArticleLongTitle = storyArticles[1]; // ≥80 char headline
export const storyArticleLongExcerpt = storyArticles[2]; // ≥250 char excerpt
export const storyArticleNoImage = storyArticles[3]; // featuredImage: null
export const storyArticleNoAuthor = storyArticles[4]; // author: null
export const storyArticleUnlinkedByline = storyArticles[5]; // author.name set, author.slug null

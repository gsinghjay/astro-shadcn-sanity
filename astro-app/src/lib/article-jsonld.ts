import type {
  ARTICLE_BY_SLUG_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
} from '@/sanity.types';
import { safeUrlFor, type SanityImageSource } from '@/lib/image';
import { stegaClean } from '@sanity/client/stega';

type Article = NonNullable<ARTICLE_BY_SLUG_QUERY_RESULT>;
type SiteSettings = NonNullable<SITE_SETTINGS_QUERY_RESULT>;

/**
 * Strict ISO 8601 date/datetime shape. Rejects year 0000 via negative lookahead.
 * Accepts:
 *   YYYY-MM-DD                         (date only)
 *   YYYY-MM-DDTHH:MM                   (minute precision)
 *   YYYY-MM-DDTHH:MM:SS                (second precision)
 *   YYYY-MM-DDTHH:MM:SS.fff            (millisecond precision)
 *   optional Z / ±HH:MM / ±HHMM timezone suffix on any datetime form
 *
 * Rejects loose `Date.parse` matches like `'2026'`, `'April 11 2026'`,
 * `'0000-01-01'` — strings the stdlib accepts but which are not valid
 * schema.org Date / DateTime values.
 */
const ISO_8601_DATE_PATTERN =
  /^(?!0000)\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

/**
 * Strict ISO 8601 date guard. Hardens against (a) corrupted datetime strings
 * that survive stegaClean but fail Date.parse (Story 19.5 N1 precedent), and
 * (b) loose Date.parse matches that are not ISO 8601 (CR P2). Returns true
 * only when the cleaned value matches the ISO 8601 shape AND parses to a real
 * non-NaN timestamp.
 */
function isValidIsoDate(value: string | null | undefined): value is string {
  if (!value) return false;
  const cleaned = stegaClean(value);
  if (!cleaned || !ISO_8601_DATE_PATTERN.test(cleaned)) return false;
  return !Number.isNaN(Date.parse(cleaned));
}

/**
 * Resolve an image to a CDN URL via `safeUrlFor()`. Returns `null` when the
 * asset ref is missing or malformed — `safeUrlFor()` already validates the ref
 * eagerly (see `lib/image.ts`), so callers can OMIT the `image`/`logo` key
 * entirely via conditional spread without needing a second try/catch here.
 */
function resolveImageUrl(
  image: SanityImageSource,
  width: number,
  height: number,
): string | null {
  const builder = safeUrlFor(image);
  return builder ? builder.width(width).height(height).url() : null;
}

/**
 * Parse and validate `canonicalUrl`. Throws a clear `TypeError` when the
 * input is not a valid absolute http(s) URL — contract violations should
 * fail loud rather than silently emit malformed JSON-LD (CR P1).
 *
 * Rejects: relative paths, empty string, unparseable garbage, and non-http(s)
 * schemes (`file://`, `blob:`, `data:`, …) whose `.origin` resolves to the
 * string `"null"`.
 */
function parseCanonicalUrl(canonicalUrl: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(canonicalUrl);
  } catch {
    throw new TypeError(
      `buildArticleJsonLd: canonicalUrl must be an absolute URL, received ${JSON.stringify(canonicalUrl)}`,
    );
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new TypeError(
      `buildArticleJsonLd: canonicalUrl must use http(s) scheme, received protocol ${JSON.stringify(parsed.protocol)}`,
    );
  }
  return parsed;
}

/**
 * Pure builder for Article / NewsArticle JSON-LD structured data.
 *
 * Returns a plain `Record<string, unknown>` suitable for the `<JsonLd>`
 * component's `schema` prop. The `@context` key is NOT added here — the
 * `<JsonLd>` component injects it at render time.
 *
 * Every string flowing in from Sanity is `stegaClean()`'d at its entry point
 * (defense in depth — `<JsonLd>` also cleans the whole schema, but the builder
 * cleans so tests can assert a clean object without rendering through Astro).
 *
 * Every optional key is emitted via conditional spread — NEVER `undefined`
 * values in the output, NEVER `image: null` / `author: null`. Absent data
 * means the key is omitted entirely.
 *
 * Whitespace-only string fields (title, excerpt, siteName, author name) are
 * treated as empty and trigger fallbacks / key omission (CR P3, P4).
 *
 * @param article - non-null article (page already redirects to /404 when null)
 * @param siteSettings - non-null site settings (`getSiteSettings()` throws otherwise)
 * @param canonicalUrl - absolute http(s) URL of the article page (e.g. `Astro.url.href`)
 * @throws {TypeError} if `canonicalUrl` is not a valid absolute http(s) URL
 */
export function buildArticleJsonLd(
  article: Article,
  siteSettings: SiteSettings,
  canonicalUrl: string,
): Record<string, unknown> {
  // P1: validate canonicalUrl up front — throw clearly on malformed input.
  const parsedUrl = parseCanonicalUrl(canonicalUrl);
  const origin = parsedUrl.origin;
  // P6: strip query + fragment — mainEntityOfPage must be canonical.
  const canonicalPageUrl = `${origin}${parsedUrl.pathname}`;

  // headline — required, whitespace collapses to fallback (AC #4 + P3)
  const cleanedTitle = stegaClean(article.title)?.trim() ?? '';
  const headline = cleanedTitle || 'Untitled';

  // description — optional, whitespace collapses to key omission (AC #4 + P3)
  const cleanedExcerpt = article.excerpt
    ? (stegaClean(article.excerpt)?.trim() ?? '')
    : '';
  const description = cleanedExcerpt || null;

  // image — string URL via safeUrlFor, omitted when absent or broken (AC #5)
  const imageUrl = article.featuredImage
    ? resolveImageUrl(article.featuredImage, 1200, 630)
    : null;

  // datetimes — strict ISO 8601 guard on BOTH publishedAt and updatedAt
  // (AC #4 + Story 19.5 N1 + CR P2)
  const cleanPublishedAt = isValidIsoDate(article.publishedAt)
    ? stegaClean(article.publishedAt)
    : null;
  const cleanUpdatedAt = isValidIsoDate(article.updatedAt)
    ? stegaClean(article.updatedAt)
    : null;
  // dateModified falls back to publishedAt (SEO freshness signal, AC #4)
  const dateModified = cleanUpdatedAt ?? cleanPublishedAt;

  // @type — strict equality on stega-cleaned category slug (AC #3).
  // P5: NewsArticle REQUIRES datePublished per Google rich-result rules —
  // downgrade to plain Article when publishedAt is missing/invalid, even when
  // the article's category is news. Prevents shipping an invalid schema.org
  // graph that Google would reject.
  const categorySlug = article.category?.slug
    ? stegaClean(article.category.slug)
    : null;
  const articleType =
    categorySlug === 'news' && cleanPublishedAt ? 'NewsArticle' : 'Article';

  // author — conditional spread, entire key omitted when null (AC #6).
  // P3: trim name before fallback. P4: trim sameAs entries before filter.
  const cleanedAuthorName = article.author
    ? (stegaClean(article.author.name)?.trim() ?? '')
    : '';
  const cleanedAuthorSlug = article.author?.slug
    ? (stegaClean(article.author.slug)?.trim() ?? '')
    : '';
  const cleanedSameAs =
    article.author && Array.isArray(article.author.sameAs)
      ? article.author.sameAs
          .map((s) => stegaClean(s)?.trim())
          .filter((s): s is string => !!s)
      : [];
  const author = article.author
    ? {
        '@type': 'Person',
        name: cleanedAuthorName || 'Unknown',
        ...(cleanedAuthorSlug
          ? { url: `${origin}/authors/${cleanedAuthorSlug}` }
          : {}),
        ...(cleanedSameAs.length > 0 ? { sameAs: cleanedSameAs } : {}),
      }
    : null;

  // publisher — ALWAYS emitted; only logo is conditional (AC #7).
  // P3: trim siteName before fallback.
  const cleanedSiteName = stegaClean(siteSettings.siteName)?.trim() ?? '';
  const logoUrl = siteSettings.logo
    ? resolveImageUrl(siteSettings.logo, 600, 60)
    : null;
  const publisher: Record<string, unknown> = {
    '@type': 'Organization',
    name: cleanedSiteName || 'YWCC Industry Capstone',
    ...(logoUrl
      ? { logo: { '@type': 'ImageObject', url: logoUrl } }
      : {}),
  };

  // Assemble — every optional key via conditional spread (AC #8)
  return {
    '@type': articleType,
    headline,
    ...(description ? { description } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(cleanPublishedAt ? { datePublished: cleanPublishedAt } : {}),
    ...(dateModified ? { dateModified } : {}),
    mainEntityOfPage: canonicalPageUrl,
    ...(author ? { author } : {}),
    publisher,
  };
}

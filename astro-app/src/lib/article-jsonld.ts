import type {
  ARTICLE_BY_SLUG_QUERY_RESULT,
  SITE_SETTINGS_QUERY_RESULT,
} from '@/sanity.types';
import { safeUrlFor, type SanityImageSource } from '@/lib/image';
import { stegaClean } from '@sanity/client/stega';

type Article = NonNullable<ARTICLE_BY_SLUG_QUERY_RESULT>;
type SiteSettings = NonNullable<SITE_SETTINGS_QUERY_RESULT>;

/**
 * Invalid Date guard — hardens datetime strings against corrupted values that
 * survive stegaClean but still produce `Invalid Date` when parsed (Story 19.5 N1
 * precedent). Returns true only when the value is non-empty AND parses cleanly.
 */
function isValidIsoDate(value: string | null | undefined): value is string {
  if (!value) return false;
  const cleaned = stegaClean(value);
  return !!cleaned && !Number.isNaN(Date.parse(cleaned));
}

/**
 * Resolve an image to a CDN URL via `safeUrlFor()`. Returns `null` when the
 * asset ref is missing or the URL builder throws, so callers can OMIT the
 * `image`/`logo` key entirely via conditional spread.
 */
function resolveImageUrl(
  image: SanityImageSource,
  width: number,
  height: number,
): string | null {
  const builder = safeUrlFor(image);
  if (!builder) return null;
  try {
    return builder.width(width).height(height).url();
  } catch {
    return null;
  }
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
 * @param article - non-null article (page already redirects to /404 when null)
 * @param siteSettings - non-null site settings (`getSiteSettings()` throws otherwise)
 * @param canonicalUrl - absolute URL of the article page (e.g. `Astro.url.href`)
 */
export function buildArticleJsonLd(
  article: Article,
  siteSettings: SiteSettings,
  canonicalUrl: string,
): Record<string, unknown> {
  // @type — strict equality on stega-cleaned category slug (AC #3)
  const categorySlug = article.category?.slug
    ? stegaClean(article.category.slug)
    : null;
  const articleType = categorySlug === 'news' ? 'NewsArticle' : 'Article';

  // headline — required, fallback to 'Untitled' (AC #4)
  const headline = stegaClean(article.title) || 'Untitled';

  // description — optional, omitted when empty (AC #4)
  const description = article.excerpt ? stegaClean(article.excerpt) : null;

  // image — string URL via safeUrlFor, omitted when absent or broken (AC #5)
  const imageUrl = article.featuredImage
    ? resolveImageUrl(article.featuredImage, 1200, 630)
    : null;

  // datetimes — Invalid Date guard on BOTH publishedAt and updatedAt (AC #4)
  const cleanPublishedAt = isValidIsoDate(article.publishedAt)
    ? stegaClean(article.publishedAt)
    : null;
  const cleanUpdatedAt = isValidIsoDate(article.updatedAt)
    ? stegaClean(article.updatedAt)
    : null;
  // dateModified falls back to publishedAt (SEO freshness signal, AC #4)
  const dateModified = cleanUpdatedAt ?? cleanPublishedAt;

  // origin derived from canonicalUrl — zero hardcoded URLs (AC #6)
  const origin = new URL(canonicalUrl).origin;

  // author — conditional spread, entire key omitted when null (AC #6)
  const author = article.author
    ? {
        '@type': 'Person',
        name: stegaClean(article.author.name) || 'Unknown',
        ...(article.author.slug
          ? { url: `${origin}/authors/${stegaClean(article.author.slug)}` }
          : {}),
        ...(Array.isArray(article.author.sameAs) &&
        article.author.sameAs.length > 0
          ? {
              sameAs: article.author.sameAs
                .map((s) => stegaClean(s))
                .filter((s): s is string => !!s),
            }
          : {}),
      }
    : null;

  // publisher — ALWAYS emitted; only logo is conditional (AC #7)
  const logoUrl = siteSettings.logo
    ? resolveImageUrl(siteSettings.logo, 600, 60)
    : null;
  const publisher: Record<string, unknown> = {
    '@type': 'Organization',
    name: stegaClean(siteSettings.siteName) || 'YWCC Industry Capstone',
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
    mainEntityOfPage: canonicalUrl,
    ...(author ? { author } : {}),
    publisher,
  };
}

import type { AUTHOR_BY_SLUG_QUERY_RESULT } from '@/sanity.types';
import { safeUrlFor, type SanityImageSource } from '@/lib/image';
import { stegaClean } from '@sanity/client/stega';

type Author = NonNullable<AUTHOR_BY_SLUG_QUERY_RESULT>;

/**
 * Resolve an image to a CDN URL via `safeUrlFor()`. Returns `null` when the
 * asset ref is missing or malformed.
 */
function resolveImageUrl(image: SanityImageSource, width: number, height: number): string | null {
  const builder = safeUrlFor(image);
  return builder ? builder.width(width).height(height).url() : null;
}

/**
 * Pure builder for Person JSON-LD structured data (author pages).
 *
 * Returns a plain `Record<string, unknown>` suitable for the `<JsonLd>`
 * component's `schema` prop. The `@context` key is NOT added here — the
 * `<JsonLd>` component injects it at render time.
 *
 * Every string from Sanity is `stegaClean()`'d at its entry point.
 * Every optional key uses conditional spread — NEVER `undefined`/`null` in output.
 *
 * @param author - non-null author (page redirects to /404 when null)
 * @param canonicalUrl - absolute http(s) URL of the author page (e.g. `Astro.url.href`)
 * @throws {TypeError} if `canonicalUrl` is not a valid absolute http(s) URL
 */
export function buildAuthorJsonLd(author: Author, canonicalUrl: string): Record<string, unknown> {
  // Validate canonicalUrl — fail loud on malformed input
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(canonicalUrl);
  } catch {
    throw new TypeError(
      `buildAuthorJsonLd: canonicalUrl must be an absolute URL, received ${JSON.stringify(canonicalUrl)}`,
    );
  }
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new TypeError(
      `buildAuthorJsonLd: canonicalUrl must use http(s) scheme, received protocol ${JSON.stringify(parsedUrl.protocol)}`,
    );
  }
  // Strip query + fragment — URL must be canonical
  const url = `${parsedUrl.origin}${parsedUrl.pathname}`;

  // name — required, whitespace collapses to fallback
  const cleanedName = stegaClean(author.name)?.trim() ?? '';
  const name = cleanedName || 'Unknown';

  // jobTitle — from role, optional
  const cleanedRole = author.role ? (stegaClean(author.role)?.trim() ?? '') : '';
  const jobTitle = cleanedRole || null;

  // description — from bio, optional
  const cleanedBio = author.bio ? (stegaClean(author.bio)?.trim() ?? '') : '';
  const description = cleanedBio || null;

  // image — resolve via safeUrlFor, 400x400 for Person headshot
  const imageUrl = author.image ? resolveImageUrl(author.image, 400, 400) : null;

  // sameAs — trim entries, filter empty strings
  const cleanedSameAs = Array.isArray(author.sameAs)
    ? author.sameAs
        .map((s) => stegaClean(s)?.trim())
        .filter((s): s is string => !!s)
    : [];

  // Assemble — every optional key via conditional spread
  return {
    '@type': 'Person',
    name,
    url,
    ...(jobTitle ? { jobTitle } : {}),
    ...(description ? { description } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(cleanedSameAs.length > 0 ? { sameAs: cleanedSameAs } : {}),
  };
}

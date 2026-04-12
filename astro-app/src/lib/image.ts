import imageUrlBuilder from "@sanity/image-url";
import { sanityClient } from "sanity:client";

const builder = imageUrlBuilder(sanityClient);

/**
 * Accepts any image source that @sanity/image-url understands:
 * TypeGen-generated image objects, { asset: { _ref } }, plain strings, etc.
 */
export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source).auto("format");
}

/**
 * Structural shape of a Sanity image field. Intentionally permissive —
 * typegen emits many nullable variants, and @sanity/image-url accepts any
 * object with a parseable `asset._id` / `asset._ref`.
 */
export type SanityImageSource =
  | {
      asset?:
        | {
            _id?: string | null;
            _ref?: string | null;
            url?: string | null;
            metadata?: unknown;
          }
        | null;
      alt?: string | null;
      hotspot?: unknown;
      crop?: unknown;
    }
  | null
  | undefined;

/**
 * Returns a sanitised inline CSS style for a Sanity LQIP blur placeholder.
 * Validates that the value is a `data:image/` URI before embedding it in CSS,
 * preventing injection through a corrupted or malicious metadata value.
 */
export function lqipStyle(lqip: string | null | undefined): string | undefined {
  if (!lqip || !lqip.startsWith('data:image/')) return undefined;
  return `background-image: url(${lqip}); background-size: cover;`;
}

export function safeUrlFor(image: SanityImageSource): ReturnType<typeof urlFor> | null {
  if (!image?.asset) return null;
  try {
    const img = urlFor(image as Parameters<typeof urlFor>[0]);
    img.url(); // eagerly validate the asset ref is parseable
    return img;
  } catch {
    return null;
  }
}

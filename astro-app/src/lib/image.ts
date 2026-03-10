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

export interface SanityImageSource {
  asset?: {
    _id?: string;
    _ref?: string;
    url?: string;
    metadata?: { lqip?: string; dimensions?: { width: number; height: number } };
  };
  alt?: string;
  hotspot?: { x: number; y: number; width: number; height: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

export function safeUrlFor(image: SanityImageSource | null | undefined): ReturnType<typeof urlFor> | null {
  if (!image?.asset) return null;
  try {
    const img = urlFor(image);
    img.url(); // eagerly validate the asset ref is parseable
    return img;
  } catch {
    return null;
  }
}

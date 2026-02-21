import imageUrlBuilder from "@sanity/image-url";
import type { Image } from "@sanity/types";
import { sanityClient } from "sanity:client";

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: Image) {
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
    return urlFor(image as unknown as Image);
  } catch {
    return null;
  }
}

import { sanityClient } from "sanity:client";
import groq from "groq";

export { sanityClient, groq };

/**
 * GROQ query: fetch all page slugs for static path generation.
 */
export const allPageSlugsQuery = groq`*[_type == "page" && defined(slug.current)]{ "slug": slug.current }`;

/**
 * GROQ query: fetch a single page by slug with template and blocks.
 * Block-specific projections will be added in Story 2.2.
 */
export const pageBySlugQuery = groq`*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  template,
  "description": seo.metaDescription,
  blocks[]{ ... }
}`;

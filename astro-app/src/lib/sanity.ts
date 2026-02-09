import { sanityClient } from "sanity:client";
import type { QueryParams } from "sanity";
import groq from "groq";
import type { Page, SiteSettings } from "./types";

export { sanityClient, groq };

const visualEditingEnabled =
  import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true";
const token = import.meta.env.SANITY_API_READ_TOKEN;

/**
 * Fetch wrapper that enables stega encoding + draft perspective
 * when visual editing is active (Presentation tool).
 */
export async function loadQuery<T>({
  query,
  params,
}: {
  query: string;
  params?: QueryParams;
}): Promise<T> {
  if (visualEditingEnabled && !token) {
    throw new Error(
      "The `SANITY_API_READ_TOKEN` environment variable is required during Visual Editing.",
    );
  }

  const perspective = visualEditingEnabled ? "previewDrafts" : "published";

  const { result } = await sanityClient.fetch<T>(query, params ?? {}, {
    filterResponse: false,
    perspective,
    resultSourceMap: visualEditingEnabled ? "withKeyArraySelector" : false,
    stega: visualEditingEnabled,
    ...(visualEditingEnabled ? { token } : {}),
  });

  return result;
}

/**
 * GROQ query: fetch the singleton site settings document.
 */
export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  siteName,
  siteDescription,
  logo{ asset->{ _id, url }, alt },
  logoLight{ asset->{ _id, url }, alt },
  navigationItems[]{ _key, label, href, children[]{ _key, label, href } },
  ctaButton{ text, url },
  footerContent{ text, copyrightText },
  socialLinks[]{ _key, platform, url },
  contactInfo{ address, email, phone },
  footerLinks[]{ _key, label, href },
  resourceLinks[]{ _key, label, href, external },
  programLinks[]{ _key, label, href },
  currentSemester
}`;

/**
 * Fetch site settings from Sanity.
 * Result is cached for the duration of the build (module-level memoization)
 * to avoid redundant API calls from Layout, Header, and Footer.
 */
let _siteSettingsCache: SiteSettings | null = null;

export async function getSiteSettings(): Promise<SiteSettings> {
  if (_siteSettingsCache) return _siteSettingsCache;

  const result = await loadQuery<SiteSettings | null>({
    query: siteSettingsQuery,
  });

  if (!result) {
    throw new Error(
      'getSiteSettings(): No siteSettings document found in Sanity. ' +
        'Create one in Sanity Studio at the "Site Settings" singleton.',
    );
  }

  _siteSettingsCache = result;
  return result;
}

/**
 * GROQ query: fetch all page slugs for static path generation.
 */
export const allPageSlugsQuery = groq`*[_type == "page" && defined(slug.current)]{ "slug": slug.current }`;

/**
 * GROQ query: fetch a single page by slug with template and blocks.
 * Includes type-conditional projections for all homepage block types.
 */
export const pageBySlugQuery = groq`*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  template,
  "description": seo.metaDescription,
  blocks[]{
    _type,
    _key,
    backgroundVariant,
    spacing,
    maxWidth,
    _type == "heroBanner" => {
      heading,
      subheading,
      backgroundImages[]{ _key, asset->{ _id, url }, alt },
      ctaButtons[]{ _key, text, url, variant },
      alignment
    },
    _type == "featureGrid" => {
      heading,
      items[]{ _key, icon, title, description, image{ asset->{ _id, url }, alt } },
      columns
    },
    _type == "ctaBanner" => {
      heading,
      description,
      ctaButtons[]{ _key, text, url, variant }
    },
    _type == "statsRow" => {
      heading,
      stats[]{ _key, value, label, description }
    },
    _type == "textWithImage" => {
      heading,
      content[]{...},
      image{ asset->{ _id, url }, alt },
      imagePosition
    },
    _type == "logoCloud" => {
      heading,
      autoPopulate,
      "sponsors": select(
        autoPopulate => *[_type == "sponsor"]{
          _id, name, "slug": slug.current,
          logo{ asset->{ _id, url }, alt }, website
        },
        sponsors[]->{ _id, name, "slug": slug.current,
          logo{ asset->{ _id, url }, alt }, website
        }
      )
    },
    _type == "sponsorSteps" => {
      heading,
      subheading,
      items[]{ _key, title, description, list },
      ctaButtons[]{ _key, text, url, variant }
    }
  }
}`;

/**
 * Fetch a page by slug from Sanity.
 */
export async function getPage(slug: string): Promise<Page | null> {
  return loadQuery<Page | null>({
    query: pageBySlugQuery,
    params: { slug },
  });
}

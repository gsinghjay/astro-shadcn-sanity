import { sanityClient } from "sanity:client";
import type { QueryParams } from "sanity";
import groq, { defineQuery } from "groq";
import { stegaClean } from "@sanity/client/stega";
import type {
  SITE_SETTINGS_QUERY_RESULT,
  PAGE_BY_SLUG_QUERY_RESULT,
  ALL_SPONSORS_QUERY_RESULT,
  SPONSOR_BY_SLUG_QUERY_RESULT,
  ALL_PROJECTS_QUERY_RESULT,
  PROJECT_BY_SLUG_QUERY_RESULT,
  ALL_TESTIMONIALS_QUERY_RESULT,
} from "@/sanity.types";

export { sanityClient, groq };

const visualEditingEnabled =
  import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true";
const token = import.meta.env.SANITY_API_READ_TOKEN;

/**
 * Sponsor type — derived from the generated ALL_SPONSORS_QUERY_RESULT.
 * Array element type extracted for use in component props and helper functions.
 */
export type Sponsor = ALL_SPONSORS_QUERY_RESULT[number];

/**
 * Project type — derived from the generated ALL_PROJECTS_QUERY_RESULT.
 * Array element type extracted for use in component props and helper functions.
 */
export type Project = ALL_PROJECTS_QUERY_RESULT[number];

/**
 * Testimonial type — derived from the generated ALL_TESTIMONIALS_QUERY_RESULT.
 * Array element type extracted for use in component props and helper functions.
 */
export type Testimonial = ALL_TESTIMONIALS_QUERY_RESULT[number];

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

  const perspective = visualEditingEnabled ? "drafts" : "published";

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
export const SITE_SETTINGS_QUERY = defineQuery(groq`*[_type == "siteSettings"][0]{
  siteName,
  siteDescription,
  logo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt },
  logoLight{ asset->{ _id, url, metadata { lqip, dimensions } }, alt },
  navigationItems[]{ _key, label, href, children[]{ _key, label, href } },
  ctaButton{ text, url },
  footerContent{ text, copyrightText },
  socialLinks[]{ _key, platform, url },
  contactInfo{ address, email, phone },
  footerLinks[]{ _key, label, href },
  resourceLinks[]{ _key, label, href, external },
  programLinks[]{ _key, label, href },
  currentSemester
}`);

/**
 * Fetch site settings from Sanity.
 * Result is cached for the duration of the build (module-level memoization)
 * to avoid redundant API calls from Layout, Header, and Footer.
 */
let _siteSettingsCache: NonNullable<SITE_SETTINGS_QUERY_RESULT> | null = null;

export async function getSiteSettings(): Promise<NonNullable<SITE_SETTINGS_QUERY_RESULT>> {
  if (!visualEditingEnabled && _siteSettingsCache) return _siteSettingsCache;

  const result = await loadQuery<SITE_SETTINGS_QUERY_RESULT>({
    query: SITE_SETTINGS_QUERY,
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
export const ALL_PAGE_SLUGS_QUERY = defineQuery(groq`*[_type == "page" && defined(slug.current)]{ "slug": slug.current }`);

/**
 * GROQ query: fetch all sponsors for build-time caching.
 * Fetched once per build and shared across all blocks that need sponsor data.
 */
export const ALL_SPONSORS_QUERY = defineQuery(groq`*[_type == "sponsor"] | order(name asc){
  _id, name, "slug": slug.current,
  logo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt, hotspot, crop },
  tier, description, website, featured
}`);

/**
 * Fetch all sponsors from Sanity.
 * Result is cached for the duration of the build (module-level memoization)
 * to avoid redundant API calls from logoCloud and sponsorCards blocks.
 */
let _sponsorsCache: ALL_SPONSORS_QUERY_RESULT | null = null;

export async function getAllSponsors(): Promise<ALL_SPONSORS_QUERY_RESULT> {
  if (!visualEditingEnabled && _sponsorsCache) return _sponsorsCache;
  const result = await loadQuery<ALL_SPONSORS_QUERY_RESULT>({ query: ALL_SPONSORS_QUERY });
  _sponsorsCache = result ?? [];
  return _sponsorsCache;
}

/**
 * GROQ query: fetch all sponsor slugs for static path generation.
 */
export const ALL_SPONSOR_SLUGS_QUERY = defineQuery(groq`*[_type == "sponsor" && defined(slug.current)]{ "slug": slug.current }`);

/**
 * GROQ query: fetch a single sponsor by slug with all fields and associated projects.
 * The projects sub-query returns an empty array until Epic 4 creates the project schema.
 */
export const SPONSOR_BY_SLUG_QUERY = defineQuery(groq`*[_type == "sponsor" && slug.current == $slug][0]{
  _id, name, "slug": slug.current,
  logo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt, hotspot, crop },
  tier, description, website, featured, industry,
  "projects": *[_type == "project" && references(^._id)]{ _id, title, "slug": slug.current }
}`);

/**
 * Fetch a single sponsor by slug from Sanity.
 */
export async function getSponsorBySlug(slug: string): Promise<SPONSOR_BY_SLUG_QUERY_RESULT> {
  return loadQuery<SPONSOR_BY_SLUG_QUERY_RESULT>({
    query: SPONSOR_BY_SLUG_QUERY,
    params: { slug },
  });
}

/**
 * Resolve sponsors for a logoCloud or sponsorCards block from the pre-fetched cache.
 * Filters based on autoPopulate (logoCloud) or displayMode (sponsorCards) config.
 */
export function resolveBlockSponsors(
  block: { _type: string; autoPopulate?: boolean | null; displayMode?: string | null; sponsors?: Array<{ _id: string }> | null },
  allSponsors: Sponsor[],
): Sponsor[] {
  if (block._type === 'logoCloud') {
    // autoPopulate → all sponsors, else manual refs
    if (block.autoPopulate) return allSponsors;
    const manualIds = new Set(block.sponsors?.map(s => s._id) ?? []);
    return allSponsors.filter(s => manualIds.has(s._id));
  }
  // sponsorCards: displayMode drives filtering
  const mode = stegaClean(block.displayMode) ?? 'all';
  if (mode === 'all') return allSponsors;
  if (mode === 'featured') return allSponsors.filter(s => s.featured);
  // manual
  const manualIds = new Set(block.sponsors?.map(s => s._id) ?? []);
  return allSponsors.filter(s => manualIds.has(s._id));
}

/**
 * GROQ query: fetch all projects with resolved sponsor references.
 */
export const ALL_PROJECTS_QUERY = defineQuery(groq`*[_type == "project"] | order(title asc){
  _id, title, "slug": slug.current,
  content,
  sponsor->{ _id, name, "slug": slug.current, logo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt, hotspot, crop }, industry },
  technologyTags,
  semester,
  status,
  outcome
}`);

/**
 * Fetch all projects from Sanity.
 * Result is cached for the duration of the build (module-level memoization).
 */
let _projectsCache: ALL_PROJECTS_QUERY_RESULT | null = null;

export async function getAllProjects(): Promise<ALL_PROJECTS_QUERY_RESULT> {
  if (!visualEditingEnabled && _projectsCache) return _projectsCache;
  const result = await loadQuery<ALL_PROJECTS_QUERY_RESULT>({ query: ALL_PROJECTS_QUERY });
  _projectsCache = result ?? [];
  return _projectsCache;
}

/**
 * GROQ query: fetch all project slugs for static path generation.
 */
export const ALL_PROJECT_SLUGS_QUERY = defineQuery(groq`*[_type == "project" && defined(slug.current)]{ "slug": slug.current }`);

/**
 * GROQ query: fetch a single project by slug with full data and linked testimonials.
 * The testimonials sub-query returns [] until Story 2.11 creates the testimonial schema.
 */
export const PROJECT_BY_SLUG_QUERY = defineQuery(groq`*[_type == "project" && slug.current == $slug][0]{
  _id, title, "slug": slug.current,
  content,
  sponsor->{ _id, name, "slug": slug.current, logo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt, hotspot, crop }, tier, industry, description, website },
  technologyTags,
  semester,
  status,
  team[]{ _key, name, role },
  mentor,
  outcome,
  "testimonials": *[_type == "testimonial" && project._ref == ^._id]{ _id, name, quote, role, organization, type, photo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt, hotspot, crop } }
}`);

/**
 * Fetch a single project by slug from Sanity.
 */
export async function getProjectBySlug(slug: string): Promise<PROJECT_BY_SLUG_QUERY_RESULT> {
  return loadQuery<PROJECT_BY_SLUG_QUERY_RESULT>({
    query: PROJECT_BY_SLUG_QUERY,
    params: { slug },
  });
}

/**
 * GROQ query: fetch all testimonials for build-time caching.
 * Fetched once per build and shared across all blocks that need testimonial data.
 */
export const ALL_TESTIMONIALS_QUERY = defineQuery(groq`*[_type == "testimonial"] | order(name asc){
  _id, name, quote, role, organization, type,
  photo{ asset->{ _id, url, metadata { lqip, dimensions } }, alt, hotspot, crop },
  project->{ _id, title, "slug": slug.current }
}`);

/**
 * Fetch all testimonials from Sanity.
 * Result is cached for the duration of the build (module-level memoization)
 * to avoid redundant API calls from testimonials blocks.
 */
let _testimonialsCache: ALL_TESTIMONIALS_QUERY_RESULT | null = null;

export async function getAllTestimonials(): Promise<ALL_TESTIMONIALS_QUERY_RESULT> {
  if (!visualEditingEnabled && _testimonialsCache) return _testimonialsCache;
  const result = await loadQuery<ALL_TESTIMONIALS_QUERY_RESULT>({ query: ALL_TESTIMONIALS_QUERY });
  _testimonialsCache = result ?? [];
  return _testimonialsCache;
}

/**
 * Resolve testimonials for a testimonials block from the pre-fetched cache.
 * Filters based on displayMode config (all/industry/student/byProject/manual).
 */
export function resolveBlockTestimonials(
  block: { _type: string; displayMode?: string | null; testimonials?: Array<{ _id: string }> | null },
  allTestimonials: Testimonial[],
): Testimonial[] {
  const mode = stegaClean(block.displayMode) ?? 'all';
  if (mode === 'all') return allTestimonials;
  if (mode === 'industry') return allTestimonials.filter(t => t.type === 'industry');
  if (mode === 'student') return allTestimonials.filter(t => t.type === 'student');
  if (mode === 'byProject') return allTestimonials.filter(t => t.project != null);
  // manual
  const manualIds = new Set(block.testimonials?.map(t => t._id) ?? []);
  return allTestimonials.filter(t => manualIds.has(t._id));
}

/**
 * GROQ query: fetch a single page by slug with template and blocks.
 * Includes type-conditional projections for all block types.
 * Sponsor data is NOT inlined — it's fetched once via ALL_SPONSORS_QUERY
 * and resolved per-block via resolveBlockSponsors().
 */
export const PAGE_BY_SLUG_QUERY = defineQuery(groq`*[_type == "page" && slug.current == $slug][0]{
  _id,
  title,
  "slug": slug.current,
  template,
  seo {
    metaTitle,
    metaDescription,
    ogImage { asset->{ _id, url, metadata { lqip, dimensions } }, alt }
  },
  blocks[]{
    _type,
    _key,
    backgroundVariant,
    spacing,
    maxWidth,
    _type == "heroBanner" => {
      heading,
      subheading,
      backgroundImages[]{ _key, asset->{ _id, url, metadata { lqip, dimensions } }, alt },
      ctaButtons[]{ _key, text, url, variant },
      alignment
    },
    _type == "featureGrid" => {
      heading,
      items[]{ _key, icon, title, description, image{ asset->{ _id, url, metadata { lqip, dimensions } }, alt } },
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
      image{ asset->{ _id, url, metadata { lqip, dimensions } }, alt },
      imagePosition
    },
    _type == "logoCloud" => {
      heading,
      autoPopulate,
      sponsors[]->{ _id }
    },
    _type == "sponsorSteps" => {
      heading,
      subheading,
      items[]{ _key, title, description, list },
      ctaButtons[]{ _key, text, url, variant }
    },
    _type == "richText" => {
      content[]{...}
    },
    _type == "faqSection" => {
      heading,
      items[]{ _key, question, answer }
    },
    _type == "contactForm" => {
      heading,
      description,
      successMessage
    },
    _type == "sponsorCards" => {
      heading,
      displayMode,
      sponsors[]->{ _id }
    },
    _type == "testimonials" => {
      heading,
      displayMode,
      testimonials[]->{ _id }
    }
  }
}`);

/**
 * Page cache for build-time deduplication.
 * Populated by prefetchPages() during getStaticPaths, read by getPage().
 * Bypassed when Visual Editing is enabled (fresh draft data required).
 */
const _pageCache = new Map<string, PAGE_BY_SLUG_QUERY_RESULT>();

/**
 * Pre-fetch all pages in parallel batches during getStaticPaths.
 * Populates the page cache so individual getPage() calls are instant.
 */
export async function prefetchPages(slugs: string[], concurrency = 6): Promise<void> {
  if (visualEditingEnabled) return;
  const chunks: string[][] = [];
  for (let i = 0; i < slugs.length; i += concurrency) {
    chunks.push(slugs.slice(i, i + concurrency));
  }
  for (const chunk of chunks) {
    const results = await Promise.all(
      chunk.map(slug =>
        loadQuery<PAGE_BY_SLUG_QUERY_RESULT>({
          query: PAGE_BY_SLUG_QUERY,
          params: { slug },
        }),
      ),
    );
    chunk.forEach((slug, i) => _pageCache.set(slug, results[i]));
  }
}

/**
 * Fetch a page by slug from Sanity.
 * Returns cached result if available (populated by prefetchPages).
 */
export async function getPage(slug: string): Promise<PAGE_BY_SLUG_QUERY_RESULT> {
  if (!visualEditingEnabled && _pageCache.has(slug)) return _pageCache.get(slug)!;
  return loadQuery<PAGE_BY_SLUG_QUERY_RESULT>({
    query: PAGE_BY_SLUG_QUERY,
    params: { slug },
  });
}

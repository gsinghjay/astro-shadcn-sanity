import { sanityClient } from "sanity:client";
import type { QueryParams } from "sanity";
import groq, { defineQuery } from "groq";
import { stegaClean } from "@sanity/client/stega";
import { SANITY_API_READ_TOKEN } from "astro:env/server";
import { PUBLIC_SANITY_VISUAL_EDITING_ENABLED, PUBLIC_SANITY_DATASET, PUBLIC_SITE_ID } from "astro:env/client";
import type {
  SITE_SETTINGS_QUERY_RESULT,
  PAGE_BY_SLUG_QUERY_RESULT,
  ALL_SPONSORS_QUERY_RESULT,
  SPONSOR_BY_SLUG_QUERY_RESULT,
  ALL_PROJECTS_QUERY_RESULT,
  PROJECT_BY_SLUG_QUERY_RESULT,
  ALL_TESTIMONIALS_QUERY_RESULT,
  ALL_EVENTS_QUERY_RESULT,
  EVENT_BY_SLUG_QUERY_RESULT,
  SPONSOR_PROJECTS_QUERY_RESULT,
  ALL_ARTICLES_QUERY_RESULT,
  ARTICLE_BY_SLUG_QUERY_RESULT,
  ALL_ARTICLE_CATEGORIES_QUERY_RESULT,
  ARTICLE_CATEGORY_BY_SLUG_QUERY_RESULT,
  ARTICLES_BY_CATEGORY_QUERY_RESULT,
  ALL_AUTHORS_QUERY_RESULT,
  AUTHOR_BY_SLUG_QUERY_RESULT,
  LISTING_PAGE_QUERY_RESULT,
} from "@/sanity.types";

export { sanityClient, groq };

const IMAGE_PROJECTION = `asset->{ _id, url, metadata { lqip, dimensions } }`;

const PORTABLE_TEXT_PROJECTION = `{
  ...,
  _type == "image" => { ${IMAGE_PROJECTION}, alt, caption },
  markDefs[]{
    ...,
    _type == "internalLink" => { ..., reference->{ _type, "slug": slug.current } }
  }
}`;

/**
 * Shared per-type block field projections.
 * Used by both PAGE_BY_SLUG_QUERY and LISTING_PAGE_QUERY to ensure
 * consistent data resolution (images, portable text, references).
 *
 * Split into INNER (all blocks except columnsBlock) and full (adds columnsBlock
 * which references INNER for its sub-arrays). This avoids circular const init.
 */
const INNER_BLOCK_FIELDS_PROJECTION = `
    _type,
    _key,
    backgroundVariant,
    spacing,
    maxWidth,
    variant,
    _type == "heroBanner" => {
      heading,
      subheading,
      backgroundImages[]{ _key, ${IMAGE_PROJECTION}, alt },
      ctaButtons[]{ _key, text, url, variant },
      alignment
    },
    _type == "featureGrid" => {
      heading,
      items[]{ _key, icon, title, description, image{ ${IMAGE_PROJECTION}, alt } },
      columns
    },
    _type == "ctaBanner" => {
      heading,
      description,
      backgroundImages[]{ _key, ${IMAGE_PROJECTION}, alt },
      ctaButtons[]{ _key, text, url, variant }
    },
    _type == "statsRow" => {
      heading,
      stats[]{ _key, value, label, description }
    },
    _type == "textWithImage" => {
      heading,
      content[]${PORTABLE_TEXT_PROJECTION},
      image{ ${IMAGE_PROJECTION}, alt },
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
      content[]${PORTABLE_TEXT_PROJECTION}
    },
    _type == "faqSection" => {
      heading,
      items[]{ _key, question, answer[]${PORTABLE_TEXT_PROJECTION} }
    },
    _type == "contactForm" => {
      heading,
      description,
      successMessage,
      form->{ _id, title, fields[]{ _key, name, label, type, required, choices[]{ _key, label, value }, options { placeholder, defaultValue } }, submitButton { text } },
      backgroundImages[]{ _key, ${IMAGE_PROJECTION}, alt }
    },
    _type == "sponsorCards" => {
      heading,
      displayMode,
      sponsors[]->{ _id }
    },
    _type == "projectCards" => {
      heading,
      displayMode,
      projects[]->{ _id }
    },
    _type == "testimonials" => {
      heading,
      testimonialSource,
      testimonials[]->{ _id }
    },
    _type == "eventList" => {
      heading,
      eventStatus,
      limit
    },
    _type == "teamGrid" => {
      heading,
      description,
      items[]{ _key, name, role, image{ ${IMAGE_PROJECTION}, alt, hotspot, crop }, links[]{ _key, label, href } }
    },
    _type == "imageGallery" => {
      heading,
      description,
      images[]{ _key, image{ ${IMAGE_PROJECTION}, alt, hotspot, crop }, caption, featured, year, category }
    },
    _type == "articleList" => {
      heading,
      description,
      contentType,
      categories[]->{ _id },
      limit,
      ctaButtons[]{ _key, text, url, variant },
      showNewsletterCta
    },
    _type == "comparisonTable" => {
      heading,
      description,
      options[]{ _key, title, highlighted },
      criteria[]{ _key, feature, values, isHeader },
      links[]{ _key, text, url, variant }
    },
    _type == "timeline" => {
      heading,
      description,
      items[]{ _key, date, title, description, image{ ${IMAGE_PROJECTION}, alt, hotspot, crop } },
      links[]{ _key, text, url, variant }
    },
    _type == "pullquote" => {
      quote,
      attribution,
      role,
      image{ ${IMAGE_PROJECTION}, alt, hotspot, crop }
    },
    _type == "divider" => {
      label
    },
    _type == "announcementBar" => {
      icon,
      text,
      link{ label, href },
      dismissible
    },
    _type == "sponsorshipTiers" => {
      heading,
      description,
      tiers[]{ _key, name, price, benefits[], highlighted, ctaButton{ text, url, variant } }
    },
    _type == "videoEmbed" => {
      heading,
      description,
      youtubeUrl,
      posterImage{ ${IMAGE_PROJECTION}, alt }
    },
    _type == "pricingTable" => {
      heading,
      description,
      tiers[]{ _key, name, price, interval, description, features, highlighted, ctaText, ctaUrl }
    },
    _type == "serviceCards" => {
      heading,
      description,
      services[]{ _key, title, description, icon, image{ ${IMAGE_PROJECTION}, alt, hotspot, crop }, link{ label, href } }
    },
    _type == "productShowcase" => {
      heading,
      description,
      products[]{ _key, title, description, image{ ${IMAGE_PROJECTION}, alt, hotspot, crop }, price, badge, link{ label, href } }
    },
    _type == "linkCards" => {
      heading,
      description,
      links[]{ _key, title, description, icon, url }
    },
    _type == "newsletter" => {
      heading,
      description,
      inputPlaceholder,
      submitButtonLabel,
      privacyDisclaimerText
    },
    _type == "accordion" => {
      heading,
      description,
      items[]{ _key, title, content }
    },
    _type == "tabsBlock" => {
      heading,
      tabs[]{ _key, label, content }
    },
    _type == "embedBlock" => {
      heading,
      embedUrl,
      caption
    },
    _type == "mapBlock" => {
      heading,
      address,
      coordinates{ lat, lng },
      caption,
      contactInfo{ phone, email, hours }
    },
    _type == "countdownTimer" => {
      heading,
      description,
      targetDate,
      completedMessage
    },
    _type == "metricsDashboard" => {
      heading,
      description,
      metrics[]{ _key, label, value, change, trend, icon }
    },
    _type == "cardGrid" => {
      heading,
      description,
      cards[]{ _key, title, description, image{ ${IMAGE_PROJECTION}, alt, hotspot, crop }, link{ label, href }, badge }
    },
    _type == "beforeAfter" => {
      heading,
      beforeImage{ ${IMAGE_PROJECTION}, alt, hotspot, crop },
      afterImage{ ${IMAGE_PROJECTION}, alt, hotspot, crop },
      beforeLabel,
      afterLabel,
      caption
    }`;

const BLOCK_FIELDS_PROJECTION = `${INNER_BLOCK_FIELDS_PROJECTION},
    _type == "columnsBlock" => {
      variant,
      leftBlocks[]{${INNER_BLOCK_FIELDS_PROJECTION}},
      rightBlocks[]{${INNER_BLOCK_FIELDS_PROJECTION}},
      reverseOnMobile,
      verticalAlign
    }`;

const visualEditingEnabled = PUBLIC_SANITY_VISUAL_EDITING_ENABLED;
const token = SANITY_API_READ_TOKEN;

/**
 * Multi-site context constants — resolved at build time via astro:env schema.
 * Each CF Pages build is isolated (one site = one set of env vars).
 */
const DATASET = PUBLIC_SANITY_DATASET;
const SITE_ID = PUBLIC_SITE_ID;
const isMultiSite = DATASET === 'rwc';

/**
 * Returns GROQ query params for site-aware queries.
 * Always includes `site` key for the always-present filter pattern:
 * - rwc dataset: `{ site: "rwc-us" }` (or "rwc-intl")
 * - production dataset: `{ site: "" }` (empty string short-circuits the filter)
 */
export function getSiteParams(): Record<string, string> {
  return isMultiSite ? { site: SITE_ID } : { site: '' };
}

/**
 * Returns the siteSettings document ID for the current site.
 * - rwc dataset: `siteSettings-rwc-us` or `siteSettings-rwc-intl`
 * - production dataset: `siteSettings`
 */
function getSiteSettingsId(): string {
  return isMultiSite ? `siteSettings-${SITE_ID}` : 'siteSettings';
}

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
 * SanityEvent type — derived from the generated ALL_EVENTS_QUERY_RESULT.
 * Named "SanityEvent" to avoid collision with the global DOM Event type.
 */
export type SanityEvent = ALL_EVENTS_QUERY_RESULT[number];

/**
 * Article type — derived from the generated ALL_ARTICLES_QUERY_RESULT.
 * Array element type extracted for use in component props and helper functions.
 */
export type Article = ALL_ARTICLES_QUERY_RESULT[number];

/**
 * Author type — derived from the generated ALL_AUTHORS_QUERY_RESULT.
 * Array element type extracted for use in component props and helper functions.
 */
export type Author = ALL_AUTHORS_QUERY_RESULT[number];

/**
 * RelatedArticle type — narrower projection from the detail query's relatedArticles[]->.
 * Lacks author and category fields. Used by ArticleCard to accept both shapes.
 */
export type RelatedArticle = NonNullable<NonNullable<ARTICLE_BY_SLUG_QUERY_RESULT>['relatedArticles']>[number];

/**
 * Module-level sync tag collector.
 * Accumulates sync tags from all loadQuery() calls during a page render.
 * Use getSyncTags() to retrieve and resetSyncTags() to clear between pages.
 */
const _syncTagsCollector: Set<string> = new Set();

/** Returns all sync tags collected since last reset. */
export function getSyncTags(): string[] {
  return [..._syncTagsCollector];
}

/** Clears collected sync tags. Call at the start of each page render. */
export function resetSyncTags(): void {
  _syncTagsCollector.clear();
}

/**
 * Fetch wrapper that enables stega encoding + draft perspective
 * when visual editing is active (Presentation tool).
 * Returns { result, syncTags } — sync tags are also accumulated in the
 * module-level collector for serialization into the HTML response.
 */
export async function loadQuery<T>({
  query,
  params,
}: {
  query: string;
  params?: QueryParams;
}): Promise<{ result: T; syncTags: string[] }> {
  if (visualEditingEnabled && !token) {
    throw new Error(
      "The `SANITY_API_READ_TOKEN` environment variable is required during Visual Editing.",
    );
  }

  const perspective = visualEditingEnabled ? "drafts" : "published";

  const response = await sanityClient.fetch<T>(query, params ?? {}, {
    filterResponse: false,
    perspective,
    resultSourceMap: visualEditingEnabled ? "withKeyArraySelector" : false,
    stega: visualEditingEnabled,
    ...(visualEditingEnabled ? { token } : {}),
  });

  const syncTags: string[] = (response as any).syncTags ?? [];
  syncTags.forEach(tag => _syncTagsCollector.add(tag));

  return { result: (response as any).result, syncTags };
}

/**
 * GROQ query: fetch the singleton site settings document.
 */
export const SITE_SETTINGS_QUERY = defineQuery(groq`*[_type == "siteSettings" && _id == $siteSettingsId][0]{
  siteName,
  siteDescription,
  logo{ ${IMAGE_PROJECTION}, alt },
  logoLight{ ${IMAGE_PROJECTION}, alt },
  navigationItems[]{ _key, label, href, children[]{ _key, label, href } },
  ctaButton{ text, url },
  footerContent{ text, copyrightText },
  socialLinks[]{ _key, platform, url },
  contactInfo{ address, email, phone },
  footerLinks[]{ _key, label, href },
  resourceLinks[]{ _key, label, href, external },
  programLinks[]{ _key, label, href },
  currentSemester,
  aiSearch{ enabled, apiUrl, placeholder, theme, hideBranding, openByDefault }
}`);

/**
 * Fetch site settings from Sanity.
 * Result is cached for the duration of the build (module-level memoization)
 * to avoid redundant API calls from Layout, Header, and Footer.
 */
let _siteSettingsCache: NonNullable<SITE_SETTINGS_QUERY_RESULT> | null = null;

export async function getSiteSettings(): Promise<NonNullable<SITE_SETTINGS_QUERY_RESULT>> {
  if (!visualEditingEnabled && _siteSettingsCache) return _siteSettingsCache;

  const { result } = await loadQuery<SITE_SETTINGS_QUERY_RESULT>({
    query: SITE_SETTINGS_QUERY,
    params: { siteSettingsId: getSiteSettingsId() },
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
export const ALL_PAGE_SLUGS_QUERY = defineQuery(groq`*[_type == "page" && defined(slug.current) && ($site == "" || site == $site)]{ "slug": slug.current }`);

/**
 * GROQ query: fetch all sponsors for build-time caching.
 * Fetched once per build and shared across all blocks that need sponsor data.
 */
export const ALL_SPONSORS_QUERY = defineQuery(groq`*[_type == "sponsor" && hidden != true && ($site == "" || site == $site)] | order(name asc){
  _id, name, "slug": slug.current,
  logo{ ${IMAGE_PROJECTION}, alt, hotspot, crop },
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
  const { result } = await loadQuery<ALL_SPONSORS_QUERY_RESULT>({ query: ALL_SPONSORS_QUERY, params: getSiteParams() });
  _sponsorsCache = result ?? [];
  return _sponsorsCache;
}

/**
 * GROQ query: fetch all sponsor slugs for static path generation.
 */
export const ALL_SPONSOR_SLUGS_QUERY = defineQuery(groq`*[_type == "sponsor" && hidden != true && defined(slug.current) && ($site == "" || site == $site)]{ "slug": slug.current }`);

/**
 * GROQ query: fetch a single sponsor by slug with all fields and associated projects.
 * The projects sub-query returns an empty array until Epic 4 creates the project schema.
 *
 * Does NOT filter `hidden != true` — hidden sponsors are excluded from static path
 * generation via ALL_SPONSOR_SLUGS_QUERY, so no detail page is built for them.
 * If the site switches to SSR/hybrid output, add `hidden != true` here.
 */
export const SPONSOR_BY_SLUG_QUERY = defineQuery(groq`*[_type == "sponsor" && slug.current == $slug && ($site == "" || site == $site)][0]{
  _id, name, "slug": slug.current,
  logo{ ${IMAGE_PROJECTION}, alt, hotspot, crop },
  tier, description, website, featured, industry,
  seo { metaTitle, metaDescription, noIndex, ogImage { ${IMAGE_PROJECTION}, alt } },
  "projects": *[_type == "project" && references(^._id) && ($site == "" || site == $site)]{ _id, title, "slug": slug.current }
}`);

/**
 * Fetch a single sponsor by slug from Sanity.
 */
export async function getSponsorBySlug(slug: string): Promise<SPONSOR_BY_SLUG_QUERY_RESULT> {
  const { result } = await loadQuery<SPONSOR_BY_SLUG_QUERY_RESULT>({
    query: SPONSOR_BY_SLUG_QUERY,
    params: { slug, ...getSiteParams() },
  });
  return result;
}

/**
 * Resolve sponsors for a logoCloud or sponsorCards block from the pre-fetched cache.
 * Filters based on autoPopulate (logoCloud) or displayMode (sponsorCards) config.
 *
 * Note: `allSponsors` is pre-filtered by ALL_SPONSORS_QUERY (`hidden != true`),
 * so manual selections of hidden sponsors are also excluded. This is intentional —
 * hidden sponsors should not appear on any public page regardless of selection mode.
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
 * Resolve projects for a projectCards block from the pre-fetched cache.
 * Filters based on displayMode config (all/featured/manual).
 */
export function resolveBlockProjects(
  block: { _type: string; displayMode?: string | null; projects?: Array<{ _id: string }> | null },
  allProjects: Project[],
): Project[] {
  const mode = stegaClean(block.displayMode) ?? 'all';
  if (mode === 'all') return allProjects;
  if (mode === 'featured') return allProjects.filter(p => p.featured);
  // manual
  const manualIds = new Set(block.projects?.map(p => p._id) ?? []);
  return allProjects.filter(p => manualIds.has(p._id));
}

/**
 * GROQ query: fetch all projects with resolved sponsor references.
 */
export const ALL_PROJECTS_QUERY = defineQuery(groq`*[_type == "project" && ($site == "" || site == $site)] | order(title asc){
  _id, title, "slug": slug.current,
  content,
  sponsor->{ _id, name, "slug": slug.current, logo{ ${IMAGE_PROJECTION}, alt, hotspot, crop }, industry, hidden },
  technologyTags,
  semester,
  status,
  outcome,
  featured
}`);

/**
 * Fetch all projects from Sanity.
 * Result is cached for the duration of the build (module-level memoization).
 */
let _projectsCache: ALL_PROJECTS_QUERY_RESULT | null = null;

export async function getAllProjects(): Promise<ALL_PROJECTS_QUERY_RESULT> {
  if (!visualEditingEnabled && _projectsCache) return _projectsCache;
  const { result } = await loadQuery<ALL_PROJECTS_QUERY_RESULT>({ query: ALL_PROJECTS_QUERY, params: getSiteParams() });
  _projectsCache = result ?? [];
  return _projectsCache;
}

/**
 * GROQ query: fetch all project slugs for static path generation.
 */
export const ALL_PROJECT_SLUGS_QUERY = defineQuery(groq`*[_type == "project" && defined(slug.current) && ($site == "" || site == $site)]{ "slug": slug.current }`);

/**
 * GROQ query: fetch a single project by slug with full data and linked testimonials.
 * The testimonials sub-query returns [] until Story 2.11 creates the testimonial schema.
 */
export const PROJECT_BY_SLUG_QUERY = defineQuery(groq`*[_type == "project" && slug.current == $slug && ($site == "" || site == $site)][0]{
  _id, title, "slug": slug.current,
  content[]${PORTABLE_TEXT_PROJECTION},
  sponsor->{ _id, name, "slug": slug.current, logo{ ${IMAGE_PROJECTION}, alt, hotspot, crop }, tier, industry, description, website, hidden },
  technologyTags,
  semester,
  status,
  team[]{ _key, name, role },
  mentor{ name, title, department },
  outcome,
  seo { metaTitle, metaDescription, noIndex, ogImage { ${IMAGE_PROJECTION}, alt } },
  "testimonials": *[_type == "testimonial" && project._ref == ^._id && ($site == "" || site == $site)]{ _id, name, quote, role, organization, type, videoUrl, photo{ ${IMAGE_PROJECTION}, alt, hotspot, crop } }
}`);

/**
 * Fetch a single project by slug from Sanity.
 */
export async function getProjectBySlug(slug: string): Promise<PROJECT_BY_SLUG_QUERY_RESULT> {
  const { result } = await loadQuery<PROJECT_BY_SLUG_QUERY_RESULT>({
    query: PROJECT_BY_SLUG_QUERY,
    params: { slug, ...getSiteParams() },
  });
  return result;
}

/**
 * GROQ query: fetch all testimonials for build-time caching.
 * Fetched once per build and shared across all blocks that need testimonial data.
 */
export const ALL_TESTIMONIALS_QUERY = defineQuery(groq`*[_type == "testimonial" && ($site == "" || site == $site)] | order(name asc){
  _id, name, quote, role, organization, type, videoUrl,
  photo{ ${IMAGE_PROJECTION}, alt, hotspot, crop },
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
  const { result } = await loadQuery<ALL_TESTIMONIALS_QUERY_RESULT>({ query: ALL_TESTIMONIALS_QUERY, params: getSiteParams() });
  _testimonialsCache = result ?? [];
  return _testimonialsCache;
}

/**
 * Resolve testimonials for a testimonials block from the pre-fetched cache.
 * Filters based on testimonialSource config (all/industry/student/byProject/manual).
 */
export function resolveBlockTestimonials(
  block: { _type: string; testimonialSource?: string | null; testimonials?: Array<{ _id: string }> | null },
  allTestimonials: Testimonial[],
): Testimonial[] {
  const mode = stegaClean(block.testimonialSource) ?? 'all';
  if (mode === 'all') return allTestimonials;
  if (mode === 'industry') return allTestimonials.filter(t => stegaClean(t.type) === 'industry');
  if (mode === 'student') return allTestimonials.filter(t => stegaClean(t.type) === 'student');
  if (mode === 'byProject') return allTestimonials.filter(t => t.project != null);
  // manual
  const manualIds = new Set(block.testimonials?.map(t => t._id) ?? []);
  return allTestimonials.filter(t => manualIds.has(t._id));
}

/**
 * GROQ query: fetch all events for build-time caching.
 * Fetched once per build and shared across all blocks that need event data.
 */
export const ALL_EVENTS_QUERY = defineQuery(groq`*[_type == "event" && ($site == "" || site == $site)] | order(date asc){
  _id, title, "slug": slug.current, date, endDate, location,
  description, eventType, status, isAllDay, category
}`);

/**
 * Fetch all events from Sanity.
 * Result is cached for the duration of the build (module-level memoization)
 * to avoid redundant API calls from eventList blocks.
 */
let _eventsCache: ALL_EVENTS_QUERY_RESULT | null = null;

export async function getAllEvents(): Promise<ALL_EVENTS_QUERY_RESULT> {
  if (!visualEditingEnabled && _eventsCache) return _eventsCache;
  const { result } = await loadQuery<ALL_EVENTS_QUERY_RESULT>({ query: ALL_EVENTS_QUERY, params: getSiteParams() });
  _eventsCache = result ?? [];
  return _eventsCache;
}

/**
 * Resolve events for an eventList block from the pre-fetched cache.
 * Filters based on eventStatus config (all/upcoming/past) and applies limit.
 * Status field takes priority; date comparison is fallback when status is unset.
 */
export function resolveBlockEvents(
  block: { _type: string; eventStatus?: string | null; limit?: number | null },
  allEvents: SanityEvent[],
): SanityEvent[] {
  const filter = stegaClean(block.eventStatus) ?? 'upcoming';
  const limit = block.limit ?? 10;
  const now = new Date().toISOString();

  let filtered: SanityEvent[];
  if (filter === 'upcoming') {
    filtered = allEvents
      .filter(e => stegaClean(e.status) === 'upcoming' || (!e.status && e.date && e.date >= now))
      .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  } else if (filter === 'past') {
    filtered = allEvents
      .filter(e => stegaClean(e.status) === 'past' || (!e.status && e.date && e.date < now))
      .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  } else {
    // all
    filtered = [...allEvents].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''));
  }

  return filtered.slice(0, limit);
}

/**
 * GROQ query: fetch events within a date range for calendar month navigation.
 * For future use when event volume grows — current implementation uses pre-fetched getAllEvents().
 */
export const EVENTS_BY_MONTH_QUERY = defineQuery(groq`*[_type == "event"
  && dateTime(date) >= dateTime($monthStart)
  && dateTime(date) <= dateTime($monthEnd)
  && ($site == "" || site == $site)
] | order(date asc) {
  _id, title, "slug": slug.current, date, endDate,
  location, eventType, status, description, isAllDay, category
}`);

/**
 * GROQ query: fetch all event slugs for static path generation.
 */
export const ALL_EVENT_SLUGS_QUERY = defineQuery(groq`*[_type == "event" && defined(slug.current) && ($site == "" || site == $site)]{ "slug": slug.current }`);

/**
 * GROQ query: fetch a single event by slug with all fields.
 */
export const EVENT_BY_SLUG_QUERY = defineQuery(groq`*[_type == "event" && slug.current == $slug && ($site == "" || site == $site)][0]{
  _id, title, "slug": slug.current,
  date, endDate, location, description, eventType, status, isAllDay, category,
  seo { metaTitle, metaDescription, noIndex, ogImage { ${IMAGE_PROJECTION}, alt } }
}`);

/**
 * Fetch a single event by slug from Sanity.
 */
export async function getEventBySlug(slug: string): Promise<EVENT_BY_SLUG_QUERY_RESULT> {
  const { result } = await loadQuery<EVENT_BY_SLUG_QUERY_RESULT>({
    query: EVENT_BY_SLUG_QUERY,
    params: { slug, ...getSiteParams() },
  });
  return result;
}

// ---------------------------------------------------------------------------
// Article queries (Story 19.3)
// ---------------------------------------------------------------------------

/**
 * GROQ query: fetch all articles for build-time caching.
 * Ordered by publishedAt descending (newest first).
 */
export const ALL_ARTICLES_QUERY = defineQuery(groq`*[_type == "article" && defined(slug.current) && ($site == "" || site == $site)] | order(publishedAt desc){
  _id, title, "slug": slug.current,
  excerpt,
  featuredImage{ ${IMAGE_PROJECTION}, alt, hotspot, crop },
  author->{ name, "slug": slug.current },
  publishedAt,
  category->{ _id, title, "slug": slug.current }
}`);

/**
 * GROQ query: fetch all article slugs for static path generation.
 */
export const ALL_ARTICLE_SLUGS_QUERY = defineQuery(groq`*[_type == "article" && defined(slug.current) && ($site == "" || site == $site)]{ "slug": slug.current }`);

/**
 * GROQ query: fetch a single article by slug with full fields.
 * Includes body with portable text, expanded author, category, related articles, tags, and SEO.
 */
export const ARTICLE_BY_SLUG_QUERY = defineQuery(groq`*[_type == "article" && slug.current == $slug && ($site == "" || site == $site)][0]{
  _id, title, "slug": slug.current,
  excerpt,
  featuredImage{ ${IMAGE_PROJECTION}, alt },
  body[]${PORTABLE_TEXT_PROJECTION},
  author->{ name, "slug": slug.current, role, image{ ${IMAGE_PROJECTION}, alt }, sameAs },
  publishedAt,
  updatedAt,
  category->{ title, "slug": slug.current },
  tags,
  relatedArticles[]->{ _id, title, "slug": slug.current, excerpt, featuredImage{ ${IMAGE_PROJECTION}, alt }, publishedAt },
  seo { metaTitle, metaDescription, noIndex, ogImage { ${IMAGE_PROJECTION}, alt } }
}`);

/**
 * Fetch all articles from Sanity.
 * Result is cached for the duration of the build (module-level memoization).
 */
let _articlesCache: ALL_ARTICLES_QUERY_RESULT | null = null;

export async function getAllArticles(): Promise<ALL_ARTICLES_QUERY_RESULT> {
  if (!visualEditingEnabled && _articlesCache) return _articlesCache;
  const { result } = await loadQuery<ALL_ARTICLES_QUERY_RESULT>({ query: ALL_ARTICLES_QUERY, params: getSiteParams() });
  _articlesCache = result ?? [];
  return _articlesCache;
}

/**
 * Resolve articles for an articleList block from the pre-fetched cache.
 * Filters based on contentType config (all/by-category) and applies limit.
 * Articles arrive pre-sorted by publishedAt desc from the GROQ query,
 * so no re-sorting is needed here.
 */
export function resolveBlockArticles(
  block: {
    _type: string;
    contentType?: string | null;
    categories?: Array<{ _id: string } | null> | null;
    limit?: number | null;
  },
  allArticles: Article[],
): Article[] {
  const mode = stegaClean(block.contentType) ?? 'all';
  const limit = block.limit ?? 6;

  let filtered: Article[];
  if (mode === 'by-category' && block.categories && block.categories.length > 0) {
    const categoryIds = new Set(
      block.categories
        .filter((c): c is { _id: string } => !!c && !!c._id)
        .map((c) => c._id),
    );
    filtered =
      categoryIds.size > 0
        ? allArticles.filter((a) => a.category?._id && categoryIds.has(a.category._id))
        : allArticles;
  } else {
    // 'all' or no categories selected — show everything
    filtered = allArticles;
  }

  return filtered.slice(0, limit);
}

/**
 * Fetch a single article by slug from Sanity.
 */
export async function getArticleBySlug(slug: string): Promise<ARTICLE_BY_SLUG_QUERY_RESULT> {
  const { result } = await loadQuery<ARTICLE_BY_SLUG_QUERY_RESULT>({
    query: ARTICLE_BY_SLUG_QUERY,
    params: { slug, ...getSiteParams() },
  });
  return result;
}

// ---------------------------------------------------------------------------
// Article category queries (Story 19.10)
// ---------------------------------------------------------------------------

/**
 * Shared category-detail projection. The chip-row query intentionally
 * narrows this with its own field list (description is unused there).
 */
const ARTICLE_CATEGORY_PROJECTION = `_id, title, "slug": slug.current, description`;

/**
 * GROQ query: fetch all article categories (for chip row + build-time caching).
 * Ordered alphabetically by title. `description` is intentionally NOT projected
 * here — the chip row never reads it. The full projection lives on
 * ARTICLE_CATEGORY_BY_SLUG_QUERY.
 */
export const ALL_ARTICLE_CATEGORIES_QUERY = defineQuery(groq`*[_type == "articleCategory" && defined(slug.current) && ($site == "" || site == $site)] | order(title asc){
  _id, title, "slug": slug.current
}`);

/**
 * GROQ query: fetch all article category slugs for static path generation.
 */
export const ALL_ARTICLE_CATEGORY_SLUGS_QUERY = defineQuery(groq`*[_type == "articleCategory" && defined(slug.current) && ($site == "" || site == $site)]{ "slug": slug.current }`);

/**
 * GROQ query: fetch a single article category by slug.
 */
export const ARTICLE_CATEGORY_BY_SLUG_QUERY = defineQuery(groq`*[_type == "articleCategory" && slug.current == $slug && ($site == "" || site == $site)][0]{
  ${ARTICLE_CATEGORY_PROJECTION}
}`);

/**
 * GROQ query: fetch all articles for a given category id.
 * Projection MATCHES ALL_ARTICLES_QUERY field-for-field so the result type
 * is structurally assignable to Article[] and <ArticleCard> can reuse it
 * without `as any` casts.
 */
export const ARTICLES_BY_CATEGORY_QUERY = defineQuery(groq`*[_type == "article" && defined(slug.current) && category._ref == $categoryId && ($site == "" || site == $site)] | order(publishedAt desc){
  _id, title, "slug": slug.current,
  excerpt,
  featuredImage{ ${IMAGE_PROJECTION}, alt, hotspot, crop },
  author->{ name, "slug": slug.current },
  publishedAt,
  category->{ _id, title, "slug": slug.current }
}`);

/**
 * Fetch all article categories from Sanity.
 * Result is cached for the duration of the build (module-level memoization),
 * mirroring getAllArticles(). Cache is bypassed when visual editing is active.
 */
let _articleCategoriesCache: ALL_ARTICLE_CATEGORIES_QUERY_RESULT | null = null;

export async function getAllArticleCategories(): Promise<ALL_ARTICLE_CATEGORIES_QUERY_RESULT> {
  if (!visualEditingEnabled && _articleCategoriesCache) return _articleCategoriesCache;
  const { result } = await loadQuery<ALL_ARTICLE_CATEGORIES_QUERY_RESULT>({
    query: ALL_ARTICLE_CATEGORIES_QUERY,
    params: getSiteParams(),
  });
  _articleCategoriesCache = result ?? [];
  return _articleCategoriesCache;
}

/**
 * Fetch a single article category by slug (uncached — per-request).
 */
export async function getArticleCategoryBySlug(
  slug: string,
): Promise<ARTICLE_CATEGORY_BY_SLUG_QUERY_RESULT> {
  const { result } = await loadQuery<ARTICLE_CATEGORY_BY_SLUG_QUERY_RESULT>({
    query: ARTICLE_CATEGORY_BY_SLUG_QUERY,
    params: { slug, ...getSiteParams() },
  });
  return result;
}

/**
 * Fetch all articles for a given category id (uncached — per-request).
 * Returns [] when no articles match so callers can render the empty state.
 */
export async function getArticlesByCategory(
  categoryId: string,
): Promise<ARTICLES_BY_CATEGORY_QUERY_RESULT> {
  const { result } = await loadQuery<ARTICLES_BY_CATEGORY_QUERY_RESULT>({
    query: ARTICLES_BY_CATEGORY_QUERY,
    params: { categoryId, ...getSiteParams() },
  });
  return result ?? [];
}

// ---------------------------------------------------------------------------
// Author queries (Story 20.2)
// ---------------------------------------------------------------------------

/**
 * GROQ query: fetch all authors for build-time caching.
 * Ordered by name ascending (alphabetical).
 */
export const ALL_AUTHORS_QUERY = defineQuery(groq`*[_type == "author" && defined(slug.current) && ($site == "" || site == $site)] | order(name asc){
  _id, name, "slug": slug.current,
  role, bio,
  image{ ${IMAGE_PROJECTION}, alt }
}`);

/**
 * GROQ query: fetch all author slugs for static path generation.
 */
export const ALL_AUTHOR_SLUGS_QUERY = defineQuery(groq`*[_type == "author" && defined(slug.current) && ($site == "" || site == $site)]{ "slug": slug.current }`);

/**
 * GROQ query: fetch a single author by slug with full fields.
 * Includes reverse reference query for articles by this author.
 * Articles projection matches ALL_ARTICLES_QUERY field-for-field so ArticleCard
 * can render them without type casting.
 */
export const AUTHOR_BY_SLUG_QUERY = defineQuery(groq`*[_type == "author" && slug.current == $slug && ($site == "" || site == $site)][0]{
  _id, name, "slug": slug.current,
  role, bio, credentials,
  image{ ${IMAGE_PROJECTION}, alt },
  sameAs,
  socialLinks[]{ _key, platform, url },
  "articles": *[_type == "article" && author._ref == ^._id && defined(slug.current) && ($site == "" || site == $site)] | order(publishedAt desc){
    _id, title, "slug": slug.current,
    excerpt,
    featuredImage{ ${IMAGE_PROJECTION}, alt, hotspot, crop },
    author->{ name, "slug": slug.current },
    publishedAt,
    category->{ _id, title, "slug": slug.current }
  }
}`);

/**
 * Fetch all authors from Sanity.
 * Result is cached for the duration of the build (module-level memoization).
 */
let _authorsCache: ALL_AUTHORS_QUERY_RESULT | null = null;

export async function getAllAuthors(): Promise<ALL_AUTHORS_QUERY_RESULT> {
  if (!visualEditingEnabled && _authorsCache) return _authorsCache;
  const { result } = await loadQuery<ALL_AUTHORS_QUERY_RESULT>({ query: ALL_AUTHORS_QUERY, params: getSiteParams() });
  _authorsCache = result ?? [];
  return _authorsCache;
}

/**
 * Fetch a single author by slug from Sanity.
 */
export async function getAuthorBySlug(slug: string): Promise<AUTHOR_BY_SLUG_QUERY_RESULT> {
  const { result } = await loadQuery<AUTHOR_BY_SLUG_QUERY_RESULT>({
    query: AUTHOR_BY_SLUG_QUERY,
    params: { slug, ...getSiteParams() },
  });
  return result;
}

// ---------------------------------------------------------------------------
// Listing Page queries (Story 21.0)
// ---------------------------------------------------------------------------

/**
 * GROQ query: fetch a singleton listing page document by its fixed ID.
 * Projects all fields including block expansions for header/footer composition.
 */
export const LISTING_PAGE_QUERY = defineQuery(groq`*[_type == "listingPage" && _id == $id][0]{
  _id, route, title, description,
  seo{ metaTitle, metaDescription, noIndex, ogImage{ ${IMAGE_PROJECTION}, alt } },
  headerBlocks[]{${BLOCK_FIELDS_PROJECTION}},
  footerBlocks[]{${BLOCK_FIELDS_PROJECTION}}
}`);

/**
 * Returns the listing page document ID for a given route.
 * Multi-site aware: appends site ID for RWC workspaces.
 */
function getListingPageId(route: string): string {
  return isMultiSite ? `listingPage-${route}-${SITE_ID}` : `listingPage-${route}`;
}

/**
 * Fetch a listing page singleton from Sanity.
 * Returns null when document doesn't exist — pages MUST work without singletons.
 * Uses a Map cache (keyed by route) since there are 5 distinct documents.
 */
const _listingPageCache = new Map<string, LISTING_PAGE_QUERY_RESULT | null>();

export async function getListingPage(route: string): Promise<LISTING_PAGE_QUERY_RESULT | null> {
  if (!visualEditingEnabled && _listingPageCache.has(route)) {
    return _listingPageCache.get(route)!;
  }
  const id = getListingPageId(route);
  const { result } = await loadQuery<LISTING_PAGE_QUERY_RESULT>({
    query: LISTING_PAGE_QUERY,
    params: { id },
  });
  const value = result ?? null;
  _listingPageCache.set(route, value);
  return value;
}

/**
 * Reset all module-level caches. Useful for testing and SSR scenarios
 * where stale data could persist across requests.
 */
export function resetAllCaches(): void {
  _siteSettingsCache = null;
  _sponsorsCache = null;
  _projectsCache = null;
  _testimonialsCache = null;
  _eventsCache = null;
  _articlesCache = null;
  _articleCategoriesCache = null;
  _authorsCache = null;
  _listingPageCache.clear();
}

// ---------------------------------------------------------------------------
// Portal queries (Story 9.2)
// ---------------------------------------------------------------------------

/**
 * GROQ query: find a sponsor by email (contactEmail or allowedEmails match).
 * Used by the portal landing page to redirect sponsors to their project view.
 */
export const SPONSOR_BY_EMAIL_QUERY = defineQuery(groq`*[_type == "sponsor" && (contactEmail == $email || $email in allowedEmails) && ($site == "" || site == $site)][0]{
  _id, name, "slug": slug.current
}`);

/**
 * GROQ query: fetch a sponsor by slug with authorization fields and associated projects.
 * Used by the sponsor portal page for profile rendering and project list.
 */
export const SPONSOR_PORTAL_QUERY = defineQuery(groq`*[_type == "sponsor" && slug.current == $slug && ($site == "" || site == $site)][0]{
  _id, name, "slug": slug.current,
  logo{ ${IMAGE_PROJECTION}, alt, hotspot, crop },
  tier, description, website, industry, featured,
  contactEmail, allowedEmails,
  "projects": *[_type == "project" && sponsor._ref == ^._id && ($site == "" || site == $site)] | order(title asc) {
    _id, title, "slug": slug.current,
    status, semester, technologyTags,
    team[]{ _key, name, role },
    content
  }
}`);

/**
 * GROQ query: fetch projects for a specific sponsor by sponsor ID.
 * Used by the portal API endpoint for JSON responses.
 */
export const SPONSOR_PROJECTS_API_QUERY = defineQuery(groq`*[_type == "project" && sponsor._ref == $sponsorId && ($site == "" || site == $site)] | order(title asc) {
  _id, title, "slug": slug.current,
  status, semester, technologyTags,
  team[]{ _key, name, role },
  content
}`);

/**
 * GROQ query: fetch projects associated with a sponsor by email.
 * Finds sponsors matching by contactEmail or allowedEmails, then returns their projects.
 * Used by the portal progress page for repo linking.
 */
export const SPONSOR_PROJECTS_QUERY = defineQuery(groq`*[_type == "project" && sponsor._ref in
  *[_type == "sponsor" && (contactEmail == $email || $email in allowedEmails) && ($site == "" || site == $site)]._id
  && ($site == "" || site == $site)
] | order(title asc) {
  _id, title, "slug": slug.current, status
}`);

/**
 * Fetch projects for a sponsor by email.
 */
export async function getSponsorProjects(email: string) {
  const { result } = await loadQuery<SPONSOR_PROJECTS_QUERY_RESULT>({
    query: SPONSOR_PROJECTS_QUERY,
    params: { email, ...getSiteParams() },
  });
  return result ?? [];
}

/**
 * GROQ query: fetch a single page by slug with blocks.
 * Includes type-conditional projections for all block types.
 * Sponsor data is NOT inlined — it's fetched once via ALL_SPONSORS_QUERY
 * and resolved per-block via resolveBlockSponsors().
 */
export const PAGE_BY_SLUG_QUERY = defineQuery(groq`*[_type == "page" && slug.current == $slug && ($site == "" || site == $site)][0]{
  _id,
  title,
  "slug": slug.current,
  seo {
    metaTitle,
    metaDescription,
    noIndex,
    ogImage { ${IMAGE_PROJECTION}, alt }
  },
  blocks[]{${BLOCK_FIELDS_PROJECTION}}
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
    const responses = await Promise.all(
      chunk.map(slug =>
        loadQuery<PAGE_BY_SLUG_QUERY_RESULT>({
          query: PAGE_BY_SLUG_QUERY,
          params: { slug, ...getSiteParams() },
        }),
      ),
    );
    chunk.forEach((slug, i) => _pageCache.set(slug, responses[i].result));
  }
}

/**
 * Fetch a page by slug from Sanity.
 * Returns cached result if available (populated by prefetchPages).
 */
export async function getPage(slug: string): Promise<PAGE_BY_SLUG_QUERY_RESULT> {
  if (!visualEditingEnabled && _pageCache.has(slug)) return _pageCache.get(slug)!;
  const { result } = await loadQuery<PAGE_BY_SLUG_QUERY_RESULT>({
    query: PAGE_BY_SLUG_QUERY,
    params: { slug, ...getSiteParams() },
  });
  return result;
}


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
  ALL_EVENTS_QUERY_RESULT,
  EVENT_BY_SLUG_QUERY_RESULT,
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

const visualEditingEnabled =
  import.meta.env.PUBLIC_SANITY_VISUAL_EDITING_ENABLED === "true";
const token = import.meta.env.SANITY_API_READ_TOKEN;

/**
 * Multi-site context constants — resolved at build time via Vite's
 * static replacement of `import.meta.env` values.
 * Each CF Pages build is isolated (one site = one set of env vars).
 */
const DATASET = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
const SITE_ID = import.meta.env.PUBLIC_SITE_ID || 'capstone';
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
export const ALL_SPONSORS_QUERY = defineQuery(groq`*[_type == "sponsor" && ($site == "" || site == $site)] | order(name asc){
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
export const ALL_SPONSOR_SLUGS_QUERY = defineQuery(groq`*[_type == "sponsor" && defined(slug.current) && ($site == "" || site == $site)]{ "slug": slug.current }`);

/**
 * GROQ query: fetch a single sponsor by slug with all fields and associated projects.
 * The projects sub-query returns an empty array until Epic 4 creates the project schema.
 */
export const SPONSOR_BY_SLUG_QUERY = defineQuery(groq`*[_type == "sponsor" && slug.current == $slug && ($site == "" || site == $site)][0]{
  _id, name, "slug": slug.current,
  logo{ ${IMAGE_PROJECTION}, alt, hotspot, crop },
  tier, description, website, featured, industry,
  seo { metaTitle, metaDescription, ogImage { ${IMAGE_PROJECTION}, alt } },
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
export const ALL_PROJECTS_QUERY = defineQuery(groq`*[_type == "project" && ($site == "" || site == $site)] | order(title asc){
  _id, title, "slug": slug.current,
  content,
  sponsor->{ _id, name, "slug": slug.current, logo{ ${IMAGE_PROJECTION}, alt, hotspot, crop }, industry },
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
  sponsor->{ _id, name, "slug": slug.current, logo{ ${IMAGE_PROJECTION}, alt, hotspot, crop }, tier, industry, description, website },
  technologyTags,
  semester,
  status,
  team[]{ _key, name, role },
  mentor,
  outcome,
  seo { metaTitle, metaDescription, ogImage { ${IMAGE_PROJECTION}, alt } },
  "testimonials": *[_type == "testimonial" && project._ref == ^._id && ($site == "" || site == $site)]{ _id, name, quote, role, organization, type, photo{ ${IMAGE_PROJECTION}, alt, hotspot, crop } }
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
  _id, name, quote, role, organization, type,
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
 * Filters based on displayMode config (all/industry/student/byProject/manual).
 */
export function resolveBlockTestimonials(
  block: { _type: string; displayMode?: string | null; testimonials?: Array<{ _id: string }> | null },
  allTestimonials: Testimonial[],
): Testimonial[] {
  const mode = stegaClean(block.displayMode) ?? 'all';
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
  description, eventType, status
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
 * Filters based on filterBy config (all/upcoming/past) and applies limit.
 * Status field takes priority; date comparison is fallback when status is unset.
 */
export function resolveBlockEvents(
  block: { _type: string; filterBy?: string | null; limit?: number | null },
  allEvents: SanityEvent[],
): SanityEvent[] {
  const filter = stegaClean(block.filterBy) ?? 'upcoming';
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
  location, eventType, status
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
  date, endDate, location, description, eventType, status,
  seo { metaTitle, metaDescription, ogImage { ${IMAGE_PROJECTION}, alt } }
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
 * GROQ query: fetch a single page by slug with template and blocks.
 * Includes type-conditional projections for all block types.
 * Sponsor data is NOT inlined — it's fetched once via ALL_SPONSORS_QUERY
 * and resolved per-block via resolveBlockSponsors().
 */
export const PAGE_BY_SLUG_QUERY = defineQuery(groq`*[_type == "page" && slug.current == $slug && ($site == "" || site == $site)][0]{
  _id,
  title,
  "slug": slug.current,
  template,
  seo {
    metaTitle,
    metaDescription,
    ogImage { ${IMAGE_PROJECTION}, alt }
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
      form->{ _id, title, fields[]{ _key, name, label, type, required, choices[]{ _key, label, value }, options { placeholder, defaultValue } }, submitButton { text } }
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
    },
    _type == "eventList" => {
      heading,
      filterBy,
      limit
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

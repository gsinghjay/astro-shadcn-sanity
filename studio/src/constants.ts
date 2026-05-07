/** Singleton document types for the Capstone workspace */
export const CAPSTONE_SINGLETON_TYPES = new Set([
  'siteSettings',
  'listingPage',
  'portalPage',
  'sponsorAgreement',
])

/** Document types that have the site field (from Story 15.1) */
export const SITE_AWARE_TYPES = [
  'page',
  'sponsor',
  'project',
  'testimonial',
  'event',
  'article',
  'articleCategory',
  'author',
  'form',
  'submission',
]

/**
 * Single source of truth for listing-page singleton routes (Story 21.0).
 * Consumed by:
 *   - Capstone listing-page templates (`sanity.config.ts`)
 *   - RWC listing-page templates (`sanity.config.ts` → `createRwcWorkspace`)
 *   - Capstone desk structure (`structure/capstone-desk-structure.ts`)
 *   - RWC desk structure   (`structure/rwc-desk-structure.ts`)
 */
export const LISTING_PAGE_ROUTES = [
  'articles',
  'authors',
  'events',
  'gallery',
  'projects',
  'sponsors',
] as const

export type ListingPageRoute = (typeof LISTING_PAGE_ROUTES)[number]

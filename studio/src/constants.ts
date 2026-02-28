/** Singleton document types for the Capstone workspace */
export const CAPSTONE_SINGLETON_TYPES = new Set(['siteSettings'])

/** Document types that have the site field (from Story 15.1) */
export const SITE_AWARE_TYPES = ['page', 'sponsor', 'project', 'testimonial', 'event']

/** RWC site configurations */
export const RWC_SITES = [
  {id: 'rwc-us', title: 'RWC US'},
  {id: 'rwc-intl', title: 'RWC International'},
] as const

/** Fixed document IDs for RWC siteSettings singletons */
export const RWC_SINGLETON_IDS = RWC_SITES.map((s) => `siteSettings-${s.id}`)

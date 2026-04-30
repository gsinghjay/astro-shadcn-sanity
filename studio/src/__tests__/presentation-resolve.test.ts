/**
 * Story 15.9: Site-aware Presentation resolve factory.
 *
 * Asserts that:
 *  - In Capstone (siteId = undefined) `mainDocuments` filters carry NO site scope.
 *  - In RWC workspaces every `mainDocuments` filter is appended with
 *    `site == "<siteId>"` so Presentation never matches the wrong RWC site.
 *
 *  - LISTING_PAGE_ROUTES is the single source of truth (length 6, includes
 *    'authors' so the Capstone Authors-last drift can never recur).
 */
import {describe, test, expect, vi} from 'vitest'

vi.mock('sanity/presentation', () => ({
  defineDocuments: <T,>(docs: T) => docs,
  defineLocations: <T,>(loc: T) => loc,
}))

vi.mock('rxjs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('rxjs')>()
  return {
    ...actual,
    map: () => (source: unknown) => source,
  }
})

import {createResolve} from '../presentation/resolve'
import {LISTING_PAGE_ROUTES} from '../constants'

const ROUTES = ['/', '/sponsors/:slug', '/projects/:slug', '/events/:slug', '/:slug']

describe('createResolve()', () => {
  test('Capstone (siteId undefined): no `site ==` clause appears on any route filter', () => {
    const resolve = createResolve(undefined)
    const mainDocuments = resolve.mainDocuments as Array<{route: string; filter: string}>

    expect(mainDocuments).toHaveLength(ROUTES.length)
    for (const doc of mainDocuments) {
      expect(doc.filter).not.toMatch(/site\s*==/)
    }
    // Sanity-check: home filter still queries the page document.
    expect(mainDocuments[0].route).toBe('/')
    expect(mainDocuments[0].filter).toContain('_type == "page"')
    expect(mainDocuments[0].filter).toContain('slug.current == "home"')
  })

  test('RWC US (siteId "rwc-us"): every route filter is appended with `site == "rwc-us"`', () => {
    const resolve = createResolve('rwc-us')
    const mainDocuments = resolve.mainDocuments as Array<{route: string; filter: string}>

    expect(mainDocuments).toHaveLength(ROUTES.length)
    for (const doc of mainDocuments) {
      expect(doc.filter).toContain('site == "rwc-us"')
    }
    expect(mainDocuments[0].filter).toBe(
      '_type == "page" && slug.current == "home" && site == "rwc-us"',
    )
  })

  test('RWC International (siteId "rwc-intl"): every route filter is appended with `site == "rwc-intl"` (and never "rwc-us")', () => {
    const resolve = createResolve('rwc-intl')
    const mainDocuments = resolve.mainDocuments as Array<{route: string; filter: string}>

    for (const doc of mainDocuments) {
      expect(doc.filter).toContain('site == "rwc-intl"')
      expect(doc.filter).not.toContain('site == "rwc-us"')
    }
  })

  test('All five expected routes are present in stable order (catch-all `/:slug` last)', () => {
    const resolve = createResolve('rwc-us')
    const mainDocuments = resolve.mainDocuments as Array<{route: string; filter: string}>
    expect(mainDocuments.map((d) => d.route)).toEqual(ROUTES)
  })

  test('Returned shape matches PresentationPluginOptions["resolve"]', () => {
    const resolve = createResolve(undefined)
    expect(resolve).toHaveProperty('mainDocuments')
    expect(resolve).toHaveProperty('locations')
    expect(typeof resolve.locations).toBe('function')
  })
})

describe('LISTING_PAGE_ROUTES (single source of truth)', () => {
  test('contains all six routes, including authors', () => {
    expect(LISTING_PAGE_ROUTES).toHaveLength(6)
    expect(LISTING_PAGE_ROUTES).toContain('authors')
    expect([...LISTING_PAGE_ROUTES]).toEqual([
      'articles',
      'authors',
      'events',
      'gallery',
      'projects',
      'sponsors',
    ])
  })

  test('is readonly at the type level (immutable)', () => {
    // `as const` produces a readonly tuple — runtime length stable.
    const arr: ReadonlyArray<string> = LISTING_PAGE_ROUTES
    expect(arr.length).toBe(6)
  })
})

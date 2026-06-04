import {
  defineDocuments,
  defineLocations,
  type DocumentLocationResolver,
} from 'sanity/presentation'
import {map} from 'rxjs'

/**
 * Build a Presentation `resolve` config scoped to a single workspace.
 *
 * - Capstone (single-site `production` dataset) calls `createResolve(undefined)` —
 *   filters stay un-scoped because no `site` field exists.
 * - RWC US / RWC Intl share the `rwc` dataset and discriminate via the `site`
 *   field; pass the active workspace's `siteId` so Presentation only matches
 *   documents belonging to that site.
 *
 * Without the site scope, `_type == "page" && slug.current == "home"` returns
 * BOTH RWC home documents and Presentation arbitrarily picks one — typically
 * surfacing as "clicking Home in RWC US opens the RWC International page".
 *
 * Story 26.12 (hybrid restore): capstone Presentation targets the separate
 * content-only preview Worker `ywcc-capstone-preview` (always-SSR drafts + stega),
 * which serves the SAME canonical routes as the public site. So Presentation
 * navigates capstone docs to canonical paths — no `/preview` prefix, identical to
 * RWC. (The 26.12 spike's `/preview/[...path]` dedicated route is removed.)
 */
export function createResolve(siteId?: string) {
  const siteFilter = siteId ? ` && site == "${siteId}"` : ''

  // Hybrid restore: every workspace uses canonical routes; the preview Worker
  // serves them SSR'd. (Was '/preview' for capstone under the 26.12 spike.)
  const previewPrefix = ''
  const pv = (path: string) => `${previewPrefix}${path}`

  const mainDocuments = defineDocuments([
    {
      route: pv('/'),
      filter: `_type == "page" && slug.current == "home"${siteFilter}`,
    },
    {
      route: pv('/sponsors/:slug'),
      filter: `_type == "sponsor" && slug.current == $slug${siteFilter}`,
    },
    {
      route: pv('/projects/:slug'),
      filter: `_type == "project" && slug.current == $slug${siteFilter}`,
    },
    {
      route: pv('/events/:slug'),
      filter: `_type == "event" && slug.current == $slug${siteFilter}`,
    },
    // Catch-all pages — must be last (first match wins)
    {
      route: pv('/:slug'),
      filter: `_type == "page" && slug.current == $slug${siteFilter}`,
    },
  ])

  /**
   * Advanced location resolver for siteSettings: lists every page in the
   * active workspace's site so editors can browse from the Presentation panel.
   */
  const siteSettingsLocations: DocumentLocationResolver = (params, context) => {
    if (params.type !== 'siteSettings') return null

    const query = siteId
      ? `*[_type == "page" && defined(slug.current) && site == $site] | order(title asc) { title, "slug": slug.current }`
      : `*[_type == "page" && defined(slug.current)] | order(title asc) { title, "slug": slug.current }`

    const queryParams: Record<string, string> = siteId ? {site: siteId} : {}

    const doc$ = context.documentStore.listenQuery(
      query,
      queryParams,
      {perspective: 'drafts'},
    )

    return doc$.pipe(
      map((pages: Array<{title?: string; slug?: string}> | null) => {
        if (!pages) {
          return {
            message: 'This document is used on all pages',
            tone: 'caution' as const,
          }
        }

        return {
          message: 'This document is used on all pages',
          tone: 'caution' as const,
          locations: pages.map((page) => ({
            title: page.title || 'Untitled',
            href: page.slug === 'home' ? pv('/') : pv(`/${page.slug}`),
          })),
        }
      }),
    )
  }

  /**
   * Guard that filters out documents whose `site` ≠ active workspace siteId.
   * In Capstone (siteId undefined) we don't select `site` at all and pass
   * through. In RWC workspaces, returning `null` from `resolve` hides the
   * "Used on these pages" panel for cross-site documents.
   */
  const page = siteId
    ? defineLocations({
        select: {title: 'title', slug: 'slug.current', site: 'site'},
        resolve: (doc) => {
          if (doc?.site !== siteId) return null
          return {
            locations: [
              {
                title: doc?.title || 'Untitled',
                href: doc?.slug === 'home' ? pv('/') : pv(`/${doc?.slug}`),
              },
            ],
          }
        },
      })
    : defineLocations({
        select: {title: 'title', slug: 'slug.current'},
        resolve: (doc) => ({
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: doc?.slug === 'home' ? pv('/') : pv(`/${doc?.slug}`),
            },
          ],
        }),
      })

  const sponsor = siteId
    ? defineLocations({
        select: {title: 'name', slug: 'slug.current', site: 'site'},
        resolve: (doc) => {
          if (doc?.site !== siteId) return null
          return {
            locations: [
              {title: doc?.title || 'Untitled', href: pv(`/sponsors/${doc?.slug}`)},
              {title: 'All Sponsors', href: pv('/sponsors')},
            ],
          }
        },
      })
    : defineLocations({
        select: {title: 'name', slug: 'slug.current'},
        resolve: (doc) => ({
          locations: [
            {title: doc?.title || 'Untitled', href: pv(`/sponsors/${doc?.slug}`)},
            {title: 'All Sponsors', href: pv('/sponsors')},
          ],
        }),
      })

  const project = siteId
    ? defineLocations({
        select: {title: 'title', slug: 'slug.current', site: 'site'},
        resolve: (doc) => {
          if (doc?.site !== siteId) return null
          return {
            locations: [
              {title: doc?.title || 'Untitled', href: pv(`/projects/${doc?.slug}`)},
              {title: 'All Projects', href: pv('/projects')},
            ],
          }
        },
      })
    : defineLocations({
        select: {title: 'title', slug: 'slug.current'},
        resolve: (doc) => ({
          locations: [
            {title: doc?.title || 'Untitled', href: pv(`/projects/${doc?.slug}`)},
            {title: 'All Projects', href: pv('/projects')},
          ],
        }),
      })

  const event = siteId
    ? defineLocations({
        select: {title: 'title', slug: 'slug.current', site: 'site'},
        resolve: (doc) => {
          if (doc?.site !== siteId) return null
          return {
            locations: [
              {title: doc?.title || 'Untitled', href: pv(`/events/${doc?.slug}`)},
              {title: 'All Events', href: pv('/events')},
            ],
          }
        },
      })
    : defineLocations({
        select: {title: 'title', slug: 'slug.current'},
        resolve: (doc) => ({
          locations: [
            {title: doc?.title || 'Untitled', href: pv(`/events/${doc?.slug}`)},
            {title: 'All Events', href: pv('/events')},
          ],
        }),
      })

  const locations: DocumentLocationResolver = (params, context) => {
    if (params.type === 'siteSettings') {
      return siteSettingsLocations(params, context)
    }

    const staticLocations: Record<string, ReturnType<typeof defineLocations>> = {
      page,
      sponsor,
      project,
      event,
    }

    return staticLocations[params.type] ?? null
  }

  return {mainDocuments, locations}
}

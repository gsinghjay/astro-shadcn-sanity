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
 */
export function createResolve(siteId?: string) {
  const siteFilter = siteId ? ` && site == "${siteId}"` : ''

  const mainDocuments = defineDocuments([
    {
      route: '/',
      filter: `_type == "page" && slug.current == "home"${siteFilter}`,
    },
    {
      route: '/sponsors/:slug',
      filter: `_type == "sponsor" && slug.current == $slug${siteFilter}`,
    },
    {
      route: '/projects/:slug',
      filter: `_type == "project" && slug.current == $slug${siteFilter}`,
    },
    {
      route: '/events/:slug',
      filter: `_type == "event" && slug.current == $slug${siteFilter}`,
    },
    // Catch-all pages — must be last (first match wins)
    {
      route: '/:slug',
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
            href: page.slug === 'home' ? '/' : `/${page.slug}`,
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
                href: doc?.slug === 'home' ? '/' : `/${doc?.slug}`,
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
              href: doc?.slug === 'home' ? '/' : `/${doc?.slug}`,
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
              {title: doc?.title || 'Untitled', href: `/sponsors/${doc?.slug}`},
              {title: 'All Sponsors', href: '/sponsors'},
            ],
          }
        },
      })
    : defineLocations({
        select: {title: 'name', slug: 'slug.current'},
        resolve: (doc) => ({
          locations: [
            {title: doc?.title || 'Untitled', href: `/sponsors/${doc?.slug}`},
            {title: 'All Sponsors', href: '/sponsors'},
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
              {title: doc?.title || 'Untitled', href: `/projects/${doc?.slug}`},
              {title: 'All Projects', href: '/projects'},
            ],
          }
        },
      })
    : defineLocations({
        select: {title: 'title', slug: 'slug.current'},
        resolve: (doc) => ({
          locations: [
            {title: doc?.title || 'Untitled', href: `/projects/${doc?.slug}`},
            {title: 'All Projects', href: '/projects'},
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
              {title: doc?.title || 'Untitled', href: `/events/${doc?.slug}`},
              {title: 'All Events', href: '/events'},
            ],
          }
        },
      })
    : defineLocations({
        select: {title: 'title', slug: 'slug.current'},
        resolve: (doc) => ({
          locations: [
            {title: doc?.title || 'Untitled', href: `/events/${doc?.slug}`},
            {title: 'All Events', href: '/events'},
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

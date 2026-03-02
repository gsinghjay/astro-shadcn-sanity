import {
  defineDocuments,
  defineLocations,
  type DocumentLocationResolver,
  type PresentationPluginOptions,
} from 'sanity/presentation'
import {map} from 'rxjs'

// Main document resolvers — tell Presentation which document to open
// when navigating to a given route in the preview iframe.
export const mainDocuments = defineDocuments([
  {
    route: '/',
    filter: `_type == "page" && slug.current == "home"`,
  },
  {
    route: '/sponsors/:slug',
    filter: `_type == "sponsor" && slug.current == $slug`,
  },
  {
    route: '/projects/:slug',
    filter: `_type == "project" && slug.current == $slug`,
  },
  {
    route: '/events/:slug',
    filter: `_type == "event" && slug.current == $slug`,
  },
  // Catch-all pages — must be last (first match wins)
  {
    route: '/:slug',
    filter: `_type == "page" && slug.current == $slug`,
  },
])

/**
 * Advanced location resolver for siteSettings.
 * Queries all pages in real-time and lists them as clickable navigation links
 * so editors can browse between pages from the Presentation tool.
 */
const siteSettingsLocations: DocumentLocationResolver = (params, context) => {
  if (params.type !== 'siteSettings') return null

  const doc$ = context.documentStore.listenQuery(
    `*[_type == "page" && defined(slug.current)] | order(title asc) { title, "slug": slug.current }`,
    {},
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

// Location resolvers — "Used on X pages" banner + quick-navigate links.
export const locations: DocumentLocationResolver = (params, context) => {
  // siteSettings: dynamic list of all pages
  if (params.type === 'siteSettings') {
    return siteSettingsLocations(params, context)
  }

  // All other types use defineLocations
  const staticLocations: Record<string, ReturnType<typeof defineLocations>> = {
    page: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || 'Untitled',
            href: doc?.slug === 'home' ? '/' : `/${doc?.slug}`,
          },
        ],
      }),
    }),
    sponsor: defineLocations({
      select: {title: 'name', slug: 'slug.current'},
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || 'Untitled',
            href: `/sponsors/${doc?.slug}`,
          },
          {
            title: 'All Sponsors',
            href: '/sponsors',
          },
        ],
      }),
    }),
    project: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || 'Untitled',
            href: `/projects/${doc?.slug}`,
          },
          {
            title: 'All Projects',
            href: '/projects',
          },
        ],
      }),
    }),
    event: defineLocations({
      select: {title: 'title', slug: 'slug.current'},
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || 'Untitled',
            href: `/events/${doc?.slug}`,
          },
        ],
      }),
    }),
  }

  return staticLocations[params.type] ?? null
}

export const resolve: PresentationPluginOptions['resolve'] = {
  mainDocuments,
  locations,
}

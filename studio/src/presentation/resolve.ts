import {defineLocations, type PresentationPluginOptions} from 'sanity/presentation'

export const resolve: PresentationPluginOptions['resolve'] = {
  locations: {
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
    siteSettings: defineLocations({
      message: 'This document is used on all pages',
      tone: 'caution',
    }),
  },
}

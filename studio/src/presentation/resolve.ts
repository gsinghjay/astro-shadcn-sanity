import {map} from 'rxjs/operators'
import {
  type DocumentLocationResolver,
  type PresentationPluginOptions,
} from 'sanity/presentation'

const locateDocument: DocumentLocationResolver = (params, context) => {
  if (params.type === 'page') {
    return context.documentStore
      .listenQuery(`*[_id == $id][0]{ title, "slug": slug.current }`, {id: params.id})
      .pipe(
        map((doc: Record<string, string> | null) =>
          doc
            ? {
                locations: [
                  {
                    title: doc.title || 'Untitled',
                    href: doc.slug === 'home' ? '/' : `/${doc.slug}`,
                  },
                ],
              }
            : null,
        ),
      )
  }

  if (params.type === 'project') {
    return context.documentStore
      .listenQuery(`*[_id == $id][0]{ title, "slug": slug.current }`, {id: params.id})
      .pipe(
        map((doc: Record<string, string> | null) =>
          doc
            ? {
                locations: [
                  {
                    title: doc.title || 'Untitled',
                    href: `/projects/${doc.slug}`,
                  },
                  {
                    title: 'All Projects',
                    href: '/projects',
                  },
                ],
              }
            : null,
        ),
      )
  }

  if (params.type === 'event') {
    return context.documentStore
      .listenQuery(`*[_id == $id][0]{ title, "slug": slug.current }`, {id: params.id})
      .pipe(
        map((doc: Record<string, string> | null) =>
          doc
            ? {
                locations: [
                  {
                    title: doc.title || 'Untitled',
                    href: `/events/${doc.slug}`,
                  },
                ],
              }
            : null,
        ),
      )
  }

  if (params.type === 'siteSettings') {
    // Query ALL page documents so the editor can preview nav/footer on any page
    return context.documentStore
      .listenQuery(
        `*[_type == "page" && defined(slug.current)] | order(title asc) { title, "slug": slug.current }`,
      )
      .pipe(
        map((pages: Array<Record<string, string>>) => ({
          message: 'Navigation and footer appear on all pages',
          tone: 'caution' as const,
          locations: (pages || []).map((page) => ({
            title: page.title || 'Untitled',
            href: page.slug === 'home' ? '/' : `/${page.slug}`,
          })),
        })),
      )
  }

  return null
}

export const resolve: PresentationPluginOptions['resolve'] = {
  locations: locateDocument,
}

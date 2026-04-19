import {
  CogIcon,
  DashboardIcon,
  DocumentIcon,
  DocumentsIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ProjectsIcon,
  CommentIcon,
  CalendarIcon,
} from '@sanity/icons'
import type {ComponentType} from 'react'
import type {StructureBuilder} from 'sanity/structure'
import {SITE_AWARE_TYPES} from '../constants'

const TYPE_META: Record<string, {title: string; icon: ComponentType}> = {
  page: {title: 'Pages', icon: DocumentIcon},
  sponsor: {title: 'Sponsors', icon: CreditCardIcon},
  project: {title: 'Projects', icon: ProjectsIcon},
  testimonial: {title: 'Testimonials', icon: CommentIcon},
  event: {title: 'Events', icon: CalendarIcon},
}

/**
 * Creates a desk structure scoped to a single RWC site.
 * Each RWC workspace gets its own desk showing only that site's content.
 */
export function createRwcDeskStructure(siteId: string, siteTitle: string) {
  return (S: StructureBuilder) =>
    S.list()
      .title(`${siteTitle} Content`)
      .items([
        S.listItem()
          .title('Site Settings')
          .icon(CogIcon)
          .child(
            S.document()
              .schemaType('siteSettings')
              .documentId(`siteSettings-${siteId}`),
          ),
        // Singleton group: Listing Pages (Story 21.0)
        S.listItem()
          .title('Listing Pages')
          .icon(DocumentsIcon)
          .child(
            S.list()
              .title('Listing Pages')
              .items(
                ['articles', 'authors', 'events', 'projects', 'sponsors'].map((route) =>
                  S.listItem()
                    .title(route.charAt(0).toUpperCase() + route.slice(1))
                    .child(
                      S.document()
                        .schemaType('listingPage')
                        .documentId(`listingPage-${route}-${siteId}`)
                        .initialValueTemplate(`listingPage-${route}-${siteId}`),
                    ),
                ),
              ),
          ),
        // Singleton group: Portal Pages (Story 22.9)
        S.listItem()
          .title('Portal Pages')
          .icon(DashboardIcon)
          .child(
            S.list()
              .title('Portal Pages')
              .items(
                ['dashboard', 'events', 'progress', 'agreement', 'form', 'login', 'denied'].map(
                  (route) =>
                    S.listItem()
                      .title(route.charAt(0).toUpperCase() + route.slice(1))
                      .child(
                        S.document()
                          .schemaType('portalPage')
                          .documentId(`portalPage-${route}-${siteId}`)
                          .initialValueTemplate(`portalPage-${route}-${siteId}`),
                      ),
                ),
              ),
          ),
        // Singleton: Sponsor Agreement (site-scoped)
        S.listItem()
          .title('Sponsor Agreement')
          .icon(DocumentTextIcon)
          .id(`sponsorAgreement-${siteId}`)
          .child(
            S.document()
              .schemaType('sponsorAgreement')
              .documentId(`sponsorAgreement-${siteId}`)
              .initialValueTemplate(`sponsorAgreement-${siteId}`),
          ),
        S.divider(),
        ...SITE_AWARE_TYPES.map((type) => {
          const meta = TYPE_META[type] || {
            title: type.charAt(0).toUpperCase() + type.slice(1) + 's',
            icon: DocumentIcon,
          }
          return S.listItem()
            .title(meta.title)
            .icon(meta.icon)
            .child(
              S.documentList()
                .schemaType(type)
                .title(`${siteTitle} ${meta.title}`)
                .filter('_type == $type && site == $site')
                .params({type, site: siteId})
                .initialValueTemplates([
                  S.initialValueTemplateItem(`${type}-${siteId}`),
                ]),
            )
        }),
      ])
}

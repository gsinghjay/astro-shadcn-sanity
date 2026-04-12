import {
  CogIcon,
  DocumentIcon,
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

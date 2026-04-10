import {CogIcon} from '@sanity/icons'
import type {StructureBuilder} from 'sanity/structure'
import {SITE_AWARE_TYPES} from '../constants'

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
        ...SITE_AWARE_TYPES.map((type) =>
          S.listItem()
            .title(type.charAt(0).toUpperCase() + type.slice(1) + 's')
            .child(
              S.documentList()
                .schemaType(type)
                .title(`${siteTitle} ${type}s`)
                .filter('_type == $type && site == $site')
                .params({type, site: siteId})
                .initialValueTemplates([
                  S.initialValueTemplateItem(`${type}-${siteId}`),
                ]),
            ),
        ),
      ])
}

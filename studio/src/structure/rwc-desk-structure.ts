import type {ComponentType} from 'react'
import {CogIcon, EarthAmericasIcon, EarthGlobeIcon} from '@sanity/icons'
import type {StructureBuilder} from 'sanity/structure'
import {SITE_AWARE_TYPES} from '../constants'

function siteGroup(
  S: StructureBuilder,
  siteId: string,
  title: string,
  icon: ComponentType,
) {
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(
      S.list()
        .title(title)
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
                  .title(`${title} ${type}s`)
                  .filter('_type == $type && site == $site')
                  .params({type, site: siteId})
                  .initialValueTemplates([
                    S.initialValueTemplateItem(`${type}-${siteId}`),
                  ]),
              ),
          ),
        ]),
    )
}

export const rwcDeskStructure = (S: StructureBuilder) =>
  S.list()
    .title('RWC Content')
    .items([
      siteGroup(S, 'rwc-us', 'RWC US', EarthAmericasIcon),
      siteGroup(S, 'rwc-intl', 'RWC International', EarthGlobeIcon),
    ])

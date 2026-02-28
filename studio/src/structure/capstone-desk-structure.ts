import {CogIcon, EnvelopeIcon} from '@sanity/icons'
import type {StructureBuilder} from 'sanity/structure'

/** Singleton document types — only one instance allowed */
const singletonTypes = new Set(['siteSettings'])

export const capstoneDeskStructure = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // Singleton: Site Settings (fixed document ID)
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .id('siteSettings')
        .child(
          S.document().schemaType('siteSettings').documentId('siteSettings'),
        ),
      S.listItem()
        .title('Submissions')
        .icon(EnvelopeIcon)
        .child(
          S.documentTypeList('submission')
            .title('Submissions')
            .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
        ),
      S.divider(),
      // All other document types (excluding singletons and custom nav items)
      ...S.documentTypeListItems().filter(
        (listItem) =>
          !singletonTypes.has(listItem.getId()!) &&
          listItem.getId() !== 'submission',
      ),
    ])

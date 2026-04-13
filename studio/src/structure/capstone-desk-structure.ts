import {CogIcon, DocumentsIcon, EnvelopeIcon} from '@sanity/icons'
import type {StructureBuilder} from 'sanity/structure'
import {CAPSTONE_SINGLETON_TYPES} from '../constants'

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
      // Singleton group: Listing Pages (Story 21.0)
      S.listItem()
        .title('Listing Pages')
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title('Listing Pages')
            .items([
              S.listItem()
                .title('Articles')
                .child(
                  S.document()
                    .schemaType('listingPage')
                    .documentId('listingPage-articles')
                    .initialValueTemplate('listingPage-articles'),
                ),
              S.listItem()
                .title('Events')
                .child(
                  S.document()
                    .schemaType('listingPage')
                    .documentId('listingPage-events')
                    .initialValueTemplate('listingPage-events'),
                ),
              S.listItem()
                .title('Gallery')
                .child(
                  S.document()
                    .schemaType('listingPage')
                    .documentId('listingPage-gallery')
                    .initialValueTemplate('listingPage-gallery'),
                ),
              S.listItem()
                .title('Projects')
                .child(
                  S.document()
                    .schemaType('listingPage')
                    .documentId('listingPage-projects')
                    .initialValueTemplate('listingPage-projects'),
                ),
              S.listItem()
                .title('Sponsors')
                .child(
                  S.document()
                    .schemaType('listingPage')
                    .documentId('listingPage-sponsors')
                    .initialValueTemplate('listingPage-sponsors'),
                ),
              S.listItem()
                .title('Authors')
                .child(
                  S.document()
                    .schemaType('listingPage')
                    .documentId('listingPage-authors')
                    .initialValueTemplate('listingPage-authors'),
                ),
            ]),
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
          !CAPSTONE_SINGLETON_TYPES.has(listItem.getId()!) &&
          listItem.getId() !== 'submission',
      ),
    ])

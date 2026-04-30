import {CogIcon, DashboardIcon, DocumentsIcon, DocumentTextIcon, EnvelopeIcon} from '@sanity/icons'
import type {StructureBuilder} from 'sanity/structure'
import {CAPSTONE_SINGLETON_TYPES, LISTING_PAGE_ROUTES} from '../constants'

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
            .items(
              LISTING_PAGE_ROUTES.map((route) =>
                S.listItem()
                  .title(route.charAt(0).toUpperCase() + route.slice(1))
                  .child(
                    S.document()
                      .schemaType('listingPage')
                      .documentId(`listingPage-${route}`)
                      .initialValueTemplate(`listingPage-${route}`),
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
            .items([
              S.listItem()
                .title('Dashboard')
                .child(
                  S.document()
                    .schemaType('portalPage')
                    .documentId('portalPage-dashboard')
                    .initialValueTemplate('portalPage-dashboard'),
                ),
              S.listItem()
                .title('Events')
                .child(
                  S.document()
                    .schemaType('portalPage')
                    .documentId('portalPage-events')
                    .initialValueTemplate('portalPage-events'),
                ),
              S.listItem()
                .title('Progress')
                .child(
                  S.document()
                    .schemaType('portalPage')
                    .documentId('portalPage-progress')
                    .initialValueTemplate('portalPage-progress'),
                ),
              S.listItem()
                .title('Agreement')
                .child(
                  S.document()
                    .schemaType('portalPage')
                    .documentId('portalPage-agreement')
                    .initialValueTemplate('portalPage-agreement'),
                ),
              S.listItem()
                .title('Form')
                .child(
                  S.document()
                    .schemaType('portalPage')
                    .documentId('portalPage-form')
                    .initialValueTemplate('portalPage-form'),
                ),
              S.listItem()
                .title('Login')
                .child(
                  S.document()
                    .schemaType('portalPage')
                    .documentId('portalPage-login')
                    .initialValueTemplate('portalPage-login'),
                ),
              S.listItem()
                .title('Access Denied')
                .child(
                  S.document()
                    .schemaType('portalPage')
                    .documentId('portalPage-denied')
                    .initialValueTemplate('portalPage-denied'),
                ),
            ]),
        ),
      // Singleton: Sponsor Agreement (one PDF + copy per workspace)
      S.listItem()
        .title('Sponsor Agreement')
        .icon(DocumentTextIcon)
        .id('sponsorAgreement')
        .child(
          S.document()
            .schemaType('sponsorAgreement')
            .documentId('sponsorAgreement')
            .initialValueTemplate('sponsorAgreement'),
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

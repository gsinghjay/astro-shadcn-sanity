import {CogIcon, DocumentsIcon, EnvelopeIcon} from '@sanity/icons'
import type {StructureBuilder} from 'sanity/structure'
import {SITE_AWARE_TYPES} from '../constants'

/**
 * Singletons and top-level-special doc types that must be excluded from the
 * auto-discovered catch-all list (they are already rendered as explicit items
 * above, or intentionally omitted from RWC entirely).
 *
 * - portalPage + sponsorAgreement: capstone-only; RWC sites ship a marketing
 *   surface, not the sponsor portal.
 */
const EXCLUDED_FROM_CATCHALL = new Set<string>([
  'siteSettings',
  'listingPage',
  'portalPage',
  'sponsorAgreement',
  'submission',
])

const SITE_AWARE = new Set<string>(SITE_AWARE_TYPES)

/**
 * Creates a desk structure scoped to a single RWC site. Mirrors the Capstone
 * layout (Site Settings → Listing Pages → Submissions → catch-all) with two
 * differences:
 *   1. Portal Pages and Sponsor Agreement are intentionally not exposed.
 *   2. Every site-aware doc list is wrapped with a `site == $site` filter and
 *      uses a site-scoped initial value template.
 */
export function createRwcDeskStructure(siteId: string, siteTitle: string) {
  return (S: StructureBuilder) =>
    S.list()
      .title(`${siteTitle} Content`)
      .items([
        // Singleton: site-scoped Site Settings
        S.listItem()
          .title('Site Settings')
          .icon(CogIcon)
          .child(
            S.document()
              .schemaType('siteSettings')
              .documentId(`siteSettings-${siteId}`),
          ),
        // Singleton group: Listing Pages
        S.listItem()
          .title('Listing Pages')
          .icon(DocumentsIcon)
          .child(
            S.list()
              .title('Listing Pages')
              .items(
                ['articles', 'authors', 'events', 'gallery', 'projects', 'sponsors'].map(
                  (route) =>
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
        // Submissions — dedicated, site-filtered, ordered newest-first
        S.listItem()
          .title('Submissions')
          .icon(EnvelopeIcon)
          .child(
            S.documentList()
              .id('submission')
              .schemaType('submission')
              .title(`${siteTitle} Submissions`)
              .filter('_type == "submission" && site == $site')
              .params({site: siteId})
              .defaultOrdering([{field: 'submittedAt', direction: 'desc'}]),
          ),
        S.divider(),
        // Catch-all — auto-discovered doc types, with site filter on site-aware
        // ones. Non-site-aware types (media.tag, etc.) pass through unchanged.
        ...S.documentTypeListItems()
          .filter((li) => !EXCLUDED_FROM_CATCHALL.has(li.getId()!))
          .map((li) => {
            const typeName = li.getId()!
            if (!SITE_AWARE.has(typeName)) return li
            return li.child(
              S.documentList()
                .id(typeName)
                .schemaType(typeName)
                .title(`${siteTitle} ${li.getTitle() ?? typeName}`)
                .filter('_type == $type && site == $site')
                .params({type: typeName, site: siteId})
                .initialValueTemplates([
                  S.initialValueTemplateItem(`${typeName}-${siteId}`),
                ]),
            )
          }),
      ])
}

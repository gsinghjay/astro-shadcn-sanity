/**
 * Story 21.0: Singleton Listing Page Documents — GROQ & Fetch Tests
 *
 * Tests the LISTING_PAGE_QUERY definition, getListingPage() export,
 * and resetAllCaches() integration.
 *
 * @story 21-0
 * @phase GREEN
 */
import {describe, test, expect} from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'

const sanityTsPath = path.resolve(__dirname, '../../../astro-app/src/lib/sanity.ts')
const sanityTsContent = fs.readFileSync(sanityTsPath, 'utf-8')

describe('Story 21.0: GROQ & Fetch Function', () => {
  test('LISTING_PAGE_QUERY is defined with defineQuery', () => {
    expect(sanityTsContent).toMatch(/export const LISTING_PAGE_QUERY = defineQuery\(/)
  })

  test('LISTING_PAGE_QUERY fetches by _id parameter', () => {
    expect(sanityTsContent).toMatch(/_type == "listingPage" && _id == \$id/)
  })

  test('LISTING_PAGE_QUERY projects route, title, description, seo, headerBlocks, footerBlocks', () => {
    expect(sanityTsContent).toMatch(/route, title, description/)
    expect(sanityTsContent).toMatch(/seo\{/)
    expect(sanityTsContent).toMatch(/headerBlocks\[\]/)
    expect(sanityTsContent).toMatch(/footerBlocks\[\]/)
  })

  test('getListingPage function is exported', () => {
    expect(sanityTsContent).toMatch(/export async function getListingPage\(/)
  })

  test('getListingPage returns null pattern (not throw)', () => {
    expect(sanityTsContent).toMatch(/result \?\? null/)
  })

  test('_listingPageCache uses Map (keyed by route)', () => {
    expect(sanityTsContent).toMatch(/const _listingPageCache = new Map</)
  })

  test('resetAllCaches includes _listingPageCache.clear()', () => {
    expect(sanityTsContent).toMatch(/_listingPageCache\.clear\(\)/)
  })

  test('LISTING_PAGE_QUERY_RESULT is imported from sanity.types', () => {
    expect(sanityTsContent).toMatch(/LISTING_PAGE_QUERY_RESULT/)
  })

  test('getListingPageId helper is multi-site aware', () => {
    // Should contain the isMultiSite conditional
    expect(sanityTsContent).toMatch(/function getListingPageId\(route: string\)/)
    expect(sanityTsContent).toMatch(/isMultiSite \? `listingPage-\$\{route\}-\$\{SITE_ID\}`/)
  })
})

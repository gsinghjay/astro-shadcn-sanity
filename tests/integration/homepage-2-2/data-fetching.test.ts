/**
 * Story 2-2: Homepage GROQ Queries & Data Fetching (ATDD)
 *
 * Tests that astro-app/src/lib/sanity.ts exports a typed GROQ query function
 * for the homepage, that the query projects all 6 block types with correct
 * field names, and that types match Sanity schema field names.
 *
 * Uses file-based assertions since sanity.ts imports from the Astro virtual
 * module `sanity:client` which is not available in the Playwright test runner.
 *
 * @story 2-2
 * @phase GREEN (feature implemented)
 */
import { describe, test, expect, beforeAll } from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const sanityTsPath = path.resolve(__dirname, '../../../astro-app/src/lib/sanity.ts')
const sanityTsContent = fs.readFileSync(sanityTsPath, 'utf-8')

describe('Story 2-2: Homepage GROQ Queries & Data Fetching (ATDD)', () => {
  // ---------------------------------------------------------------------------
  // AC1: sanity.ts exports a getPage function
  // ---------------------------------------------------------------------------
  describe('AC1: GROQ query function export', () => {
    test('[P0] 2.2-INT-001 — sanity.ts exports a getPage or getPageBySlug function', () => {
      // sanity.ts must export a function that fetches a page by slug
      const hasGetPage = /export\s+(async\s+)?function\s+getPage\b/.test(sanityTsContent)
      const hasGetPageBySlug = /export\s+(async\s+)?function\s+getPageBySlug\b/.test(sanityTsContent)

      expect(
        hasGetPage || hasGetPageBySlug,
        'sanity.ts must export getPage or getPageBySlug as a function',
      ).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // AC2: GROQ query includes projections for all 6 block types
  // ---------------------------------------------------------------------------
  describe('AC2: Block type projections in GROQ query', () => {
    test('[P0] 2.2-INT-002 — GROQ query includes type-conditional projections for all 6 homepage block types', () => {
      // The PAGE_BY_SLUG_QUERY must contain type-conditional projections
      // for each of the 6 homepage block types
      expect(sanityTsContent).toContain('PAGE_BY_SLUG_QUERY')

      const blockTypes = [
        'heroBanner',
        'featureGrid',
        'ctaBanner',
        'statsRow',
        'textWithImage',
        'logoCloud',
      ]

      for (const blockType of blockTypes) {
        expect(
          sanityTsContent,
          `GROQ query must include type-conditional projection for ${blockType}`,
        ).toContain(`_type == "${blockType}"`)
      }
    })
  })

  // ---------------------------------------------------------------------------
  // AC2: GROQ query projects base block fields
  // ---------------------------------------------------------------------------
  describe('AC2: Base block field projections', () => {
    test('[P0] 2.2-INT-003 — GROQ query projects base block fields (backgroundVariant, spacing, maxWidth)', () => {
      // Base fields from defineBlock must appear in the query projection
      const baseFields = ['backgroundVariant', 'spacing', 'maxWidth']

      for (const field of baseFields) {
        expect(
          sanityTsContent,
          `GROQ query must project base block field: ${field}`,
        ).toContain(field)
      }
    })
  })

  // ---------------------------------------------------------------------------
  // AC4: Types use Sanity field names — HeroBanner
  // ---------------------------------------------------------------------------
  describe('AC4: HeroBanner GROQ projection uses Sanity field names', () => {
    test('[P0] 2.2-INT-004 — GROQ heroBanner projection includes correct Sanity field names', () => {
      // Types are now generated via TypeGen (Extract<PageBlock, ...>), so field
      // correctness is verified via the GROQ query projections and typegen.
      // Check the GROQ query projects the right fields for heroBanner.
      expect(sanityTsContent, 'GROQ must project heading for heroBanner').toContain('heading')
      expect(sanityTsContent, 'GROQ must project subheading for heroBanner').toContain('subheading')
      expect(sanityTsContent, 'GROQ must project alignment for heroBanner').toContain('alignment')
      expect(sanityTsContent, 'GROQ must project ctaButtons for heroBanner').toContain('ctaButtons')
      expect(sanityTsContent, 'GROQ must project backgroundImages for heroBanner').toContain('backgroundImages')

      // Must NOT use old placeholder field names
      expect(sanityTsContent, 'Must NOT use old headline field').not.toMatch(/\bheadline\b/)
      expect(sanityTsContent, 'Must NOT use old subheadline field').not.toMatch(/\bsubheadline\b/)
    })
  })

  // ---------------------------------------------------------------------------
  // AC4: Types use Sanity field names — remaining block types
  // ---------------------------------------------------------------------------
  describe('AC4: Remaining block types use Sanity field names', () => {
    test('[P0] 2.2-INT-005 — GROQ projections for FeatureGrid, CtaBanner, TextWithImage, LogoCloud use Sanity field names', () => {
      // Types are now generated via TypeGen, so field correctness is verified
      // through GROQ query projections. Validate the GROQ query contains
      // the expected field names for each block type.

      // Types file must export all block type aliases
      const typesPath = path.resolve(__dirname, '../../../astro-app/src/lib/types.ts')
      const typesContent = fs.readFileSync(typesPath, 'utf-8')

      expect(typesContent, 'FeatureGridBlock type must exist').toContain('FeatureGridBlock')
      expect(typesContent, 'CtaBannerBlock type must exist').toContain('CtaBannerBlock')
      expect(typesContent, 'TextWithImageBlock type must exist').toContain('TextWithImageBlock')
      expect(typesContent, 'LogoCloudBlock type must exist').toContain('LogoCloudBlock')

      // GROQ query must project correct field names
      expect(sanityTsContent, 'GROQ must project items for featureGrid').toContain('items')
      expect(sanityTsContent, 'GROQ must project sponsors for logoCloud').toContain('sponsors')
    })
  })

  // ---------------------------------------------------------------------------
  // AC8: No inline GROQ queries in page files
  // ---------------------------------------------------------------------------
  describe('AC8: No inline GROQ queries in pages', () => {
    test('[P1] 2.2-INT-006 — index.astro imports from lib/sanity and has no inline GROQ queries', () => {
      const indexPath = path.resolve(__dirname, '../../../astro-app/src/pages/index.astro')
      const indexContent = fs.readFileSync(indexPath, 'utf-8')

      // Extract the frontmatter section (between --- delimiters)
      const frontmatterMatch = indexContent.match(/^---\n([\s\S]*?)\n---/)
      expect(frontmatterMatch, 'index.astro must have frontmatter').toBeTruthy()
      const frontmatter = frontmatterMatch![1]

      // Must import from sanity lib (not use inline data)
      expect(
        frontmatter,
        'index.astro must import from lib/sanity or ../lib/sanity',
      ).toMatch(/from\s+['"](?:@\/lib\/sanity|\.\.\/lib\/sanity|\.\.\/lib\/sanity\.ts)['"]/)

      // Must NOT contain inline GROQ queries
      expect(
        frontmatter,
        'index.astro must NOT contain groq`` template literals',
      ).not.toMatch(/groq\s*`/)

      // Must NOT still import from placeholder data
      expect(
        frontmatter,
        'index.astro must NOT import from lib/data (placeholder data)',
      ).not.toMatch(/from\s+['"](?:@\/lib\/data|\.\.\/lib\/data)['"]/)

      // Must NOT import homePage placeholder
      expect(
        frontmatter,
        'index.astro must NOT import homePage placeholder',
      ).not.toMatch(/\bhomePage\b/)
    })
  })
})

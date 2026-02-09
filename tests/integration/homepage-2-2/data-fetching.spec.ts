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
import { test, expect } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const sanityTsPath = path.resolve(__dirname, '../../../astro-app/src/lib/sanity.ts')
const sanityTsContent = fs.readFileSync(sanityTsPath, 'utf-8')

test.describe('Story 2-2: Homepage GROQ Queries & Data Fetching (ATDD)', () => {
  // ---------------------------------------------------------------------------
  // AC1: sanity.ts exports a getPage function
  // ---------------------------------------------------------------------------
  test.describe('AC1: GROQ query function export', () => {
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
  test.describe('AC2: Block type projections in GROQ query', () => {
    test('[P0] 2.2-INT-002 — GROQ query includes type-conditional projections for all 6 homepage block types', () => {
      // The pageBySlugQuery must contain type-conditional projections
      // for each of the 6 homepage block types
      expect(sanityTsContent).toContain('pageBySlugQuery')

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
  test.describe('AC2: Base block field projections', () => {
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
  test.describe('AC4: HeroBanner type uses Sanity field names', () => {
    test('[P0] 2.2-INT-004 — HeroBannerBlock type uses Sanity field names (heading, subheading, alignment, ctaButtons)', () => {
      // Verify at the type level by checking the types file content directly.
      // TypeScript interfaces are erased at runtime, so we read the source.
      const typesPath = path.resolve(__dirname, '../../../astro-app/src/lib/types.ts')
      const typesContent = fs.readFileSync(typesPath, 'utf-8')

      // Extract the HeroBannerBlock interface content
      const heroBannerMatch = typesContent.match(
        /export\s+(?:interface|type)\s+HeroBannerBlock[\s\S]*?\{([\s\S]*?\n\})/,
      )
      expect(heroBannerMatch, 'HeroBannerBlock interface must exist').toBeTruthy()
      const heroBannerBody = heroBannerMatch![1]

      // Must use Sanity field names
      expect(heroBannerBody, 'HeroBannerBlock must have heading field').toContain('heading')
      expect(heroBannerBody, 'HeroBannerBlock must have subheading field').toContain('subheading')
      expect(heroBannerBody, 'HeroBannerBlock must have alignment field').toContain('alignment')
      expect(heroBannerBody, 'HeroBannerBlock must have ctaButtons field').toContain('ctaButtons')

      // Must NOT use old placeholder field names
      expect(heroBannerBody, 'HeroBannerBlock must NOT have headline field').not.toMatch(
        /\bheadline\b/,
      )
      expect(heroBannerBody, 'HeroBannerBlock must NOT have subheadline field').not.toMatch(
        /\bsubheadline\b/,
      )
      expect(heroBannerBody, 'HeroBannerBlock must NOT have layout field').not.toMatch(
        /\blayout\b/,
      )
      expect(heroBannerBody, 'HeroBannerBlock must NOT have ctaText field').not.toMatch(
        /\bctaText\b/,
      )
      expect(heroBannerBody, 'HeroBannerBlock must NOT have ctaUrl field').not.toMatch(
        /\bctaUrl\b/,
      )
      expect(heroBannerBody, 'HeroBannerBlock must have backgroundImages field').toContain(
        'backgroundImages',
      )
    })
  })

  // ---------------------------------------------------------------------------
  // AC4: Types use Sanity field names — remaining block types
  // ---------------------------------------------------------------------------
  test.describe('AC4: Remaining block types use Sanity field names', () => {
    test('[P0] 2.2-INT-005 — FeatureGrid, CtaBanner, TextWithImage, LogoCloud types use Sanity field names', () => {
      const typesPath = path.resolve(__dirname, '../../../astro-app/src/lib/types.ts')
      const typesContent = fs.readFileSync(typesPath, 'utf-8')

      // --- FeatureGridBlock ---
      const featureGridMatch = typesContent.match(
        /export\s+(?:interface|type)\s+FeatureGridBlock[\s\S]*?\{([\s\S]*?\n\})/,
      )
      expect(featureGridMatch, 'FeatureGridBlock interface must exist').toBeTruthy()
      const featureGridBody = featureGridMatch![1]

      expect(featureGridBody, 'FeatureGridBlock must have heading').toContain('heading')
      expect(featureGridBody, 'FeatureGridBlock must have items').toContain('items')
      expect(featureGridBody, 'FeatureGridBlock must NOT have headline').not.toMatch(
        /\bheadline\b/,
      )
      expect(featureGridBody, 'FeatureGridBlock must NOT have features').not.toMatch(
        /\bfeatures\b/,
      )

      // --- CtaBannerBlock ---
      const ctaBannerMatch = typesContent.match(
        /export\s+(?:interface|type)\s+CtaBannerBlock[\s\S]*?\{([\s\S]*?\n\})/,
      )
      expect(ctaBannerMatch, 'CtaBannerBlock interface must exist').toBeTruthy()
      const ctaBannerBody = ctaBannerMatch![1]

      expect(ctaBannerBody, 'CtaBannerBlock must have heading').toContain('heading')
      expect(ctaBannerBody, 'CtaBannerBlock must have description').toContain('description')
      expect(ctaBannerBody, 'CtaBannerBlock must have ctaButtons').toContain('ctaButtons')
      expect(ctaBannerBody, 'CtaBannerBlock must NOT have headline').not.toMatch(/\bheadline\b/)
      expect(ctaBannerBody, 'CtaBannerBlock must NOT have body field').not.toMatch(
        /\bbody\s*[?:]/,
      )
      expect(ctaBannerBody, 'CtaBannerBlock must NOT have ctaText').not.toMatch(/\bctaText\b/)
      expect(ctaBannerBody, 'CtaBannerBlock must NOT have ctaUrl').not.toMatch(/\bctaUrl\b/)

      // --- TextWithImageBlock ---
      const textWithImageMatch = typesContent.match(
        /export\s+(?:interface|type)\s+TextWithImageBlock[\s\S]*?\{([\s\S]*?\n\})/,
      )
      expect(textWithImageMatch, 'TextWithImageBlock interface must exist').toBeTruthy()
      const textWithImageBody = textWithImageMatch![1]

      expect(textWithImageBody, 'TextWithImageBlock must have heading').toContain('heading')
      expect(textWithImageBody, 'TextWithImageBlock must have content').toContain('content')
      expect(textWithImageBody, 'TextWithImageBlock must have image').toContain('image')
      expect(textWithImageBody, 'TextWithImageBlock must NOT have headline').not.toMatch(
        /\bheadline\b/,
      )
      expect(textWithImageBody, 'TextWithImageBlock must NOT have body field').not.toMatch(
        /\bbody\s*[?:]/,
      )
      expect(textWithImageBody, 'TextWithImageBlock must NOT have imageUrl').not.toMatch(
        /\bimageUrl\b/,
      )

      // --- LogoCloudBlock ---
      const logoCloudMatch = typesContent.match(
        /export\s+(?:interface|type)\s+LogoCloudBlock[\s\S]*?\{([\s\S]*?\n\})/,
      )
      expect(logoCloudMatch, 'LogoCloudBlock interface must exist').toBeTruthy()
      const logoCloudBody = logoCloudMatch![1]

      expect(logoCloudBody, 'LogoCloudBlock must have heading').toContain('heading')
      expect(logoCloudBody, 'LogoCloudBlock must have sponsors').toContain('sponsors')
      expect(logoCloudBody, 'LogoCloudBlock must NOT have logos').not.toMatch(/\blogos\b/)
    })
  })

  // ---------------------------------------------------------------------------
  // AC8: No inline GROQ queries in page files
  // ---------------------------------------------------------------------------
  test.describe('AC8: No inline GROQ queries in pages', () => {
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

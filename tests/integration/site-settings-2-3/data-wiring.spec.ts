/**
 * Story 2-3: Wire Site Settings to Sanity (ATDD)
 *
 * Tests that the siteSettings schema includes all required fields,
 * that astro-app/src/lib/sanity.ts exports a getSiteSettings function,
 * that the GROQ query projects all site settings fields, that the
 * SiteSettings type matches the expanded schema, and that layout/header/
 * footer components import from lib/sanity instead of lib/data.
 *
 * Uses file-based assertions for Astro files (sanity.ts, types.ts,
 * Layout.astro, Header.astro, Footer.astro) since they import from
 * Astro virtual modules not available in the Playwright test runner.
 *
 * Uses static imports for the Sanity schema module.
 *
 * @story 2-3
 * @phase RED (TDD — tests written before implementation)
 */
import { test, expect } from '@playwright/test'
import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

// ESM __dirname polyfill
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Static import of Sanity schema — Playwright transforms this
import { siteSettings as siteSettingsSchema } from '../../../studio/src/schemaTypes/documents/site-settings'

// File paths for file-based assertions
const sanityTsPath = path.resolve(__dirname, '../../../astro-app/src/lib/sanity.ts')
const typesTsPath = path.resolve(__dirname, '../../../astro-app/src/lib/types.ts')
const layoutPath = path.resolve(__dirname, '../../../astro-app/src/layouts/Layout.astro')
const headerPath = path.resolve(__dirname, '../../../astro-app/src/components/Header.astro')
const footerPath = path.resolve(__dirname, '../../../astro-app/src/components/Footer.astro')

// Read file contents once for all tests
const sanityTsContent = fs.readFileSync(sanityTsPath, 'utf-8')
const typesTsContent = fs.readFileSync(typesTsPath, 'utf-8')
const layoutContent = fs.readFileSync(layoutPath, 'utf-8')
const headerContent = fs.readFileSync(headerPath, 'utf-8')
const footerContent = fs.readFileSync(footerPath, 'utf-8')

test.describe('Story 2-3: Wire Site Settings to Sanity (ATDD)', () => {
  // ---------------------------------------------------------------------------
  // AC1: siteSettings schema exports all required fields
  // ---------------------------------------------------------------------------
  test.describe('AC1: siteSettings schema completeness', () => {
    test('[P0] 2.3-INT-001 — Schema exports siteSettings with all required fields', () => {
      // The siteSettings schema must be a document type named 'siteSettings'
      expect(siteSettingsSchema.name).toBe('siteSettings')
      expect(siteSettingsSchema.type).toBe('document')

      const fields = (siteSettingsSchema as any).fields
      const fieldNames: string[] = fields.map((f: any) => f.name)

      // Existing fields that must still be present
      expect(fieldNames, 'Must have siteName field').toContain('siteName')
      expect(fieldNames, 'Must have logo field').toContain('logo')
      expect(fieldNames, 'Must have navigationItems field').toContain('navigationItems')
      expect(fieldNames, 'Must have footerContent field').toContain('footerContent')
      expect(fieldNames, 'Must have socialLinks field').toContain('socialLinks')
      expect(fieldNames, 'Must have currentSemester field').toContain('currentSemester')

      // New fields that must be added
      expect(fieldNames, 'Must have siteDescription field').toContain('siteDescription')
      expect(fieldNames, 'Must have ctaButton field').toContain('ctaButton')
      expect(fieldNames, 'Must have contactInfo field').toContain('contactInfo')
      expect(fieldNames, 'Must have footerLinks field').toContain('footerLinks')
      expect(fieldNames, 'Must have resourceLinks field').toContain('resourceLinks')
      expect(fieldNames, 'Must have programLinks field').toContain('programLinks')
    })

    test('[P0] 2.3-INT-002 — Schema has new fields (siteDescription, ctaButton, contactInfo, footerLinks, resourceLinks, programLinks)', () => {
      const fields = (siteSettingsSchema as any).fields
      const fieldNames: string[] = fields.map((f: any) => f.name)

      // siteDescription — string or text field for meta description / tagline
      expect(fieldNames, 'Must have siteDescription').toContain('siteDescription')
      const siteDescField = fields.find((f: any) => f.name === 'siteDescription')
      expect(siteDescField, 'siteDescription field must exist').toBeDefined()
      expect(
        ['string', 'text'].includes(siteDescField.type),
        'siteDescription must be string or text type',
      ).toBe(true)

      // ctaButton — object with text and url for the header CTA
      expect(fieldNames, 'Must have ctaButton').toContain('ctaButton')
      const ctaField = fields.find((f: any) => f.name === 'ctaButton')
      expect(ctaField, 'ctaButton field must exist').toBeDefined()
      expect(ctaField.type).toBe('object')
      const ctaSubFieldNames = ctaField.fields.map((f: any) => f.name)
      expect(ctaSubFieldNames, 'ctaButton must have text subfield').toContain('text')
      expect(ctaSubFieldNames, 'ctaButton must have url subfield').toContain('url')

      // contactInfo — object with address, email, phone
      expect(fieldNames, 'Must have contactInfo').toContain('contactInfo')
      const contactField = fields.find((f: any) => f.name === 'contactInfo')
      expect(contactField, 'contactInfo field must exist').toBeDefined()
      expect(contactField.type).toBe('object')
      const contactSubFieldNames = contactField.fields.map((f: any) => f.name)
      expect(contactSubFieldNames, 'contactInfo must have email').toContain('email')

      // footerLinks — array of link objects for footer navigation
      expect(fieldNames, 'Must have footerLinks').toContain('footerLinks')
      const footerLinksField = fields.find((f: any) => f.name === 'footerLinks')
      expect(footerLinksField, 'footerLinks field must exist').toBeDefined()
      expect(footerLinksField.type).toBe('array')

      // resourceLinks — array of link objects for resource links section
      expect(fieldNames, 'Must have resourceLinks').toContain('resourceLinks')
      const resourceLinksField = fields.find((f: any) => f.name === 'resourceLinks')
      expect(resourceLinksField, 'resourceLinks field must exist').toBeDefined()
      expect(resourceLinksField.type).toBe('array')

      // programLinks — array of link objects for program links section
      expect(fieldNames, 'Must have programLinks').toContain('programLinks')
      const programLinksField = fields.find((f: any) => f.name === 'programLinks')
      expect(programLinksField, 'programLinks field must exist').toBeDefined()
      expect(programLinksField.type).toBe('array')
    })
  })

  // ---------------------------------------------------------------------------
  // AC2: sanity.ts exports getSiteSettings function
  // ---------------------------------------------------------------------------
  test.describe('AC2: getSiteSettings GROQ query function', () => {
    test('[P0] 2.3-INT-003 — sanity.ts exports getSiteSettings function', () => {
      // sanity.ts must export a function named getSiteSettings
      const hasGetSiteSettings = /export\s+(async\s+)?function\s+getSiteSettings\b/.test(
        sanityTsContent,
      )

      expect(
        hasGetSiteSettings,
        'sanity.ts must export getSiteSettings as a named function',
      ).toBe(true)

      // The function should return SiteSettings type
      expect(
        sanityTsContent,
        'getSiteSettings should reference SiteSettings type',
      ).toMatch(/getSiteSettings[\s\S]*?SiteSettings/)
    })

    test('[P0] 2.3-INT-004 — GROQ query projects all site settings fields', () => {
      // sanity.ts must contain a SITE_SETTINGS_QUERY GROQ query
      expect(
        sanityTsContent,
        'sanity.ts must define a SITE_SETTINGS_QUERY',
      ).toMatch(/SITE_SETTINGS_QUERY/)

      // The query must target siteSettings document type
      expect(
        sanityTsContent,
        'GROQ query must filter by _type == "siteSettings"',
      ).toMatch(/_type\s*==\s*["']siteSettings["']/)

      // The query should project key fields from the expanded schema
      const expectedProjections = [
        'siteName',
        'siteDescription',
        'logo',
        'navigationItems',
        'ctaButton',
        'footerContent',
        'socialLinks',
        'contactInfo',
        'footerLinks',
        'resourceLinks',
        'programLinks',
        'currentSemester',
      ]

      for (const field of expectedProjections) {
        expect(
          sanityTsContent,
          `GROQ query must project field: ${field}`,
        ).toContain(field)
      }
    })
  })

  // ---------------------------------------------------------------------------
  // AC3: SiteSettings type matches expanded schema
  // ---------------------------------------------------------------------------
  test.describe('AC3: SiteSettings TypeScript type', () => {
    test('[P0] 2.3-INT-005 — SiteSettings type matches expanded schema', () => {
      // Extract the SiteSettings interface/type from types.ts
      const siteSettingsMatch = typesTsContent.match(
        /export\s+(?:interface|type)\s+SiteSettings[\s\S]*?\{([\s\S]*?\n\})/,
      )
      expect(siteSettingsMatch, 'SiteSettings interface must exist in types.ts').toBeTruthy()
      const siteSettingsBody = siteSettingsMatch![1]

      // Must have all expanded fields matching the Sanity schema
      expect(siteSettingsBody, 'SiteSettings must have siteName field').toContain('siteName')
      expect(siteSettingsBody, 'SiteSettings must have siteDescription field').toContain(
        'siteDescription',
      )
      expect(siteSettingsBody, 'SiteSettings must have logo field').toContain('logo')
      expect(siteSettingsBody, 'SiteSettings must have navigationItems field').toContain(
        'navigationItems',
      )
      expect(siteSettingsBody, 'SiteSettings must have ctaButton field').toContain('ctaButton')
      expect(siteSettingsBody, 'SiteSettings must have footerContent field').toContain(
        'footerContent',
      )
      expect(siteSettingsBody, 'SiteSettings must have socialLinks field').toContain('socialLinks')
      expect(siteSettingsBody, 'SiteSettings must have contactInfo field').toContain('contactInfo')
      expect(siteSettingsBody, 'SiteSettings must have footerLinks field').toContain('footerLinks')
      expect(siteSettingsBody, 'SiteSettings must have resourceLinks field').toContain(
        'resourceLinks',
      )
      expect(siteSettingsBody, 'SiteSettings must have programLinks field').toContain(
        'programLinks',
      )
      expect(siteSettingsBody, 'SiteSettings must have currentSemester field').toContain(
        'currentSemester',
      )
    })

    test('[P0] 2.3-INT-006 — SiteSettings type does NOT use old field names', () => {
      // Extract the SiteSettings interface/type from types.ts
      const siteSettingsMatch = typesTsContent.match(
        /export\s+(?:interface|type)\s+SiteSettings[\s\S]*?\{([\s\S]*?\n\})/,
      )
      expect(siteSettingsMatch, 'SiteSettings interface must exist in types.ts').toBeTruthy()
      const siteSettingsBody = siteSettingsMatch![1]

      // The old minimal SiteSettings had: title, description, navigation, footerText
      // The new expanded version should use Sanity field names instead:
      //   title -> siteName
      //   description -> siteDescription
      //   navigation -> navigationItems
      //   footerText -> footerContent (object)
      expect(siteSettingsBody, 'Must NOT use old "title" field (should be siteName)').not.toMatch(
        /\btitle\s*[?:]:\s*string/,
      )
      expect(
        siteSettingsBody,
        'Must NOT use old "description" field (should be siteDescription)',
      ).not.toMatch(/\bdescription\s*[?:]\s*string/)
      expect(
        siteSettingsBody,
        'Must NOT use old "navigation" field (should be navigationItems)',
      ).not.toMatch(/\bnavigation\s*[?:]\s*/)
      expect(
        siteSettingsBody,
        'Must NOT use old "footerText" field (should be footerContent)',
      ).not.toMatch(/\bfooterText\s*[?:]\s*string/)
    })
  })

  // ---------------------------------------------------------------------------
  // AC6: Layout.astro imports from lib/sanity, not hardcoded
  // ---------------------------------------------------------------------------
  test.describe('AC6: Layout uses Sanity data', () => {
    test('[P1] 2.3-INT-007 — Layout.astro imports from lib/sanity, not hardcoded', () => {
      // Extract the frontmatter section (between --- delimiters)
      const frontmatterMatch = layoutContent.match(/^---\n([\s\S]*?)\n---/)
      expect(frontmatterMatch, 'Layout.astro must have frontmatter').toBeTruthy()
      const frontmatter = frontmatterMatch![1]

      // Layout must import from lib/sanity (getSiteSettings or similar)
      expect(
        frontmatter,
        'Layout.astro must import from lib/sanity or ../lib/sanity',
      ).toMatch(/from\s+['"](?:@\/lib\/sanity|\.\.\/lib\/sanity|\.\.\/lib\/sanity\.ts)['"]/)

      // Layout must NOT have hardcoded default title
      expect(
        layoutContent,
        'Layout.astro must NOT have hardcoded "YWCC Industry Capstone Program" as default title',
      ).not.toMatch(/title\s*=\s*["']YWCC Industry Capstone Program["']/)

      // Layout must NOT have hardcoded Lorem ipsum description
      expect(
        layoutContent,
        'Layout.astro must NOT have hardcoded Lorem ipsum description',
      ).not.toMatch(/Lorem ipsum/)

      // Layout should call getSiteSettings or use site settings data
      expect(
        frontmatter,
        'Layout.astro must reference getSiteSettings or siteSettings',
      ).toMatch(/getSiteSettings|siteSettings/)
    })
  })

  // ---------------------------------------------------------------------------
  // AC8: Header/Footer/Layout do NOT import from lib/data
  // ---------------------------------------------------------------------------
  test.describe('AC8: No imports from lib/data', () => {
    test('[P1] 2.3-INT-008 — Header/Footer/Layout do NOT import from lib/data', () => {
      // Extract frontmatter from Header.astro
      const headerFrontmatterMatch = headerContent.match(/^---\n([\s\S]*?)\n---/)
      expect(headerFrontmatterMatch, 'Header.astro must have frontmatter').toBeTruthy()
      const headerFrontmatter = headerFrontmatterMatch![1]

      // Header must NOT import from lib/data
      expect(
        headerFrontmatter,
        'Header.astro must NOT import from lib/data',
      ).not.toMatch(/from\s+['"](?:@\/lib\/data|\.\.\/lib\/data|\.\.\/lib\/data\.ts)['"]/)

      // Header should import from lib/sanity instead
      expect(
        headerFrontmatter,
        'Header.astro must import from lib/sanity',
      ).toMatch(/from\s+['"](?:@\/lib\/sanity|\.\.\/lib\/sanity|\.\.\/lib\/sanity\.ts)['"]/)

      // Extract frontmatter from Footer.astro
      const footerFrontmatterMatch = footerContent.match(/^---\n([\s\S]*?)\n---/)
      expect(footerFrontmatterMatch, 'Footer.astro must have frontmatter').toBeTruthy()
      const footerFrontmatter = footerFrontmatterMatch![1]

      // Footer must NOT import from lib/data
      expect(
        footerFrontmatter,
        'Footer.astro must NOT import from lib/data',
      ).not.toMatch(/from\s+['"](?:@\/lib\/data|\.\.\/lib\/data|\.\.\/lib\/data\.ts)['"]/)

      // Footer should import from lib/sanity instead
      expect(
        footerFrontmatter,
        'Footer.astro must import from lib/sanity',
      ).toMatch(/from\s+['"](?:@\/lib\/sanity|\.\.\/lib\/sanity|\.\.\/lib\/sanity\.ts)['"]/)

      // Layout must NOT import from lib/data
      const layoutFrontmatterMatch = layoutContent.match(/^---\n([\s\S]*?)\n---/)
      expect(layoutFrontmatterMatch, 'Layout.astro must have frontmatter').toBeTruthy()
      const layoutFrontmatter = layoutFrontmatterMatch![1]

      expect(
        layoutFrontmatter,
        'Layout.astro must NOT import from lib/data',
      ).not.toMatch(/from\s+['"](?:@\/lib\/data|\.\.\/lib\/data|\.\.\/lib\/data\.ts)['"]/)
    })
  })
})

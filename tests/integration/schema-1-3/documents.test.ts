/**
 * Story 1-3: Schema Infrastructure — Document Schemas (AC6-7)
 *
 * Tests page and siteSettings document schemas.
 * Uses static imports so Playwright's TS transformer can resolve them.
 *
 * @story 1-3
 * @phase GREEN
 */
import { describe, test, expect, beforeAll } from 'vitest'

// Schema imports — static so Playwright transforms them
import { page as pageSchema } from '../../../studio/src/schemaTypes/documents/page'
import { siteSettings } from '../../../studio/src/schemaTypes/documents/site-settings'

describe('Story 1-3: Schema Infrastructure (ATDD)', () => {
  // ---------------------------------------------------------------------------
  // AC6: Page document schema
  // ---------------------------------------------------------------------------
  describe('AC6: Page Document Schema', () => {
    test('[P0] 1.3-INT-020 — page schema has title, slug, seo, blocks fields', () => {
      expect(pageSchema.name).toBe('page')
      expect(pageSchema.type).toBe('document')

      const fieldNames = (pageSchema as any).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('title')
      expect(fieldNames).toContain('slug')
      expect(fieldNames).toContain('seo')
      expect(fieldNames).toContain('blocks')
    })

    test('[P0] 1.3-INT-021 — page blocks array accepts all registered block types', () => {
      const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
      expect(blocksField).toBeDefined()
      expect(blocksField.type).toBe('array')

      const blockTypeNames = blocksField.of.map((b: any) => b.type)
      const expectedTypes = [
        'heroBanner', 'featureGrid', 'sponsorCards', 'richText',
        'ctaBanner', 'faqSection', 'contactForm',
        'logoCloud', 'statsRow', 'textWithImage',
        'sponsorSteps', 'testimonials', 'eventList',
      ]

      for (const type of expectedTypes) {
        expect(blockTypeNames, `Missing block type: ${type}`).toContain(type)
      }
      expect(blockTypeNames).toHaveLength(13)
    })

    test('[P0] 1.3-INT-022 — page title is required string', () => {
      const titleField = (pageSchema as any).fields.find((f: any) => f.name === 'title')
      expect(titleField).toBeDefined()
      expect(titleField.type).toBe('string')
      expect(titleField.validation).toBeDefined()
    })

    test('[P0] 1.3-INT-023 — page slug is required and sourced from title', () => {
      const slugField = (pageSchema as any).fields.find((f: any) => f.name === 'slug')
      expect(slugField).toBeDefined()
      expect(slugField.type).toBe('slug')
      expect(slugField.options?.source).toBe('title')
      expect(slugField.validation).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  // AC7: Site Settings document schema
  // ---------------------------------------------------------------------------
  describe('AC7: Site Settings Document Schema', () => {
    test('[P0] 1.3-INT-024 — siteSettings schema has all required fields', () => {
      expect(siteSettings.name).toBe('siteSettings')
      expect(siteSettings.type).toBe('document')

      const fieldNames = (siteSettings as any).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('siteName')
      expect(fieldNames).toContain('logo')
      expect(fieldNames).toContain('navigationItems')
      expect(fieldNames).toContain('footerContent')
      expect(fieldNames).toContain('socialLinks')
      expect(fieldNames).toContain('currentSemester')
    })

    test('[P0] 1.3-INT-025 — siteSettings siteName is required', () => {
      const siteNameField = (siteSettings as any).fields.find((f: any) => f.name === 'siteName')
      expect(siteNameField).toBeDefined()
      expect(siteNameField.type).toBe('string')
      expect(siteNameField.validation).toBeDefined()
    })

    test('[P0] 1.3-INT-026 — siteSettings logo has alt text field', () => {
      const logoField = (siteSettings as any).fields.find((f: any) => f.name === 'logo')
      expect(logoField).toBeDefined()
      expect(logoField.type).toBe('image')

      const altField = logoField.fields?.find((f: any) => f.name === 'alt')
      expect(altField).toBeDefined()
    })

    test('[P1] 1.3-INT-027 — siteSettings navigationItems supports one level of nesting', () => {
      const navField = (siteSettings as any).fields.find((f: any) => f.name === 'navigationItems')
      expect(navField).toBeDefined()
      expect(navField.type).toBe('array')

      // Each nav item should have label, href, and optional children
      const navItemFields = navField.of?.[0]?.fields
      expect(navItemFields).toBeDefined()

      const navItemFieldNames = navItemFields.map((f: any) => f.name)
      expect(navItemFieldNames).toContain('label')
      expect(navItemFieldNames).toContain('href')
      expect(navItemFieldNames).toContain('children')
    })

    test('[P1] 1.3-INT-028 — siteSettings socialLinks has platform options', () => {
      const socialField = (siteSettings as any).fields.find((f: any) => f.name === 'socialLinks')
      expect(socialField).toBeDefined()
      expect(socialField.type).toBe('array')

      // Each social link should have platform and url
      const socialItemFields = socialField.of?.[0]?.fields
      expect(socialItemFields).toBeDefined()

      const platformField = socialItemFields.find((f: any) => f.name === 'platform')
      expect(platformField).toBeDefined()

      const platformOptions = platformField.options?.list
      expect(platformOptions).toEqual(
        expect.arrayContaining(['github', 'linkedin', 'twitter', 'instagram', 'youtube']),
      )
    })

    test('[P1] 1.3-INT-029 — siteSettings currentSemester is a string field', () => {
      const semesterField = (siteSettings as any).fields.find(
        (f: any) => f.name === 'currentSemester',
      )
      expect(semesterField).toBeDefined()
      expect(semesterField.type).toBe('string')
    })
  })
})

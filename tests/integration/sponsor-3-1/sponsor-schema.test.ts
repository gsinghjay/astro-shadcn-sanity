/**
 * Story 3-1: Sponsor Document Schema & Studio Management (ATDD)
 *
 * Tests the sponsor document schema fields, types, validation, and registration.
 * Uses static imports so Playwright's TS transformer can resolve them.
 *
 * @story 3-1
 * @phase RED — all tests use test.skip() until sponsor schema is implemented
 */
import { describe, test, expect, beforeAll } from 'vitest'

// Schema imports — static so Playwright transforms them
// These will FAIL until sponsor.ts is created (RED phase)
import { sponsor } from '../../../studio/src/schemaTypes/documents/sponsor'
import { schemaTypes } from '../../../studio/src/schemaTypes/index'

describe('Story 3-1: Sponsor Document Schema (ATDD)', () => {
  // ---------------------------------------------------------------------------
  // AC1 + AC2: Schema structure and validation
  // ---------------------------------------------------------------------------
  describe('AC1: Sponsor Schema Structure', () => {
    test('[P0] 3.1-INT-001 — sponsor schema has correct name and type document', () => {
      expect(sponsor.name).toBe('sponsor')
      expect(sponsor.type).toBe('document')
    })

    test('[P0] 3.1-INT-002 — sponsor schema has all required fields', () => {
      const fieldNames = (sponsor as any).fields.map((f: any) => f.name)
      expect(fieldNames).toHaveLength(9)
      expect(fieldNames).toContain('name')
      expect(fieldNames).toContain('slug')
      expect(fieldNames).toContain('logo')
      expect(fieldNames).toContain('description')
      expect(fieldNames).toContain('website')
      expect(fieldNames).toContain('industry')
      expect(fieldNames).toContain('tier')
      expect(fieldNames).toContain('featured')
      expect(fieldNames).toContain('seo')
    })

    test('[P0] 3.1-INT-003 — name field is required string', () => {
      const nameField = (sponsor as any).fields.find((f: any) => f.name === 'name')
      expect(nameField).toBeDefined()
      expect(nameField.type).toBe('string')
      expect(nameField.validation).toBeDefined()
    })

    test('[P0] 3.1-INT-004 — slug field is required, type slug, sourced from name', () => {
      const slugField = (sponsor as any).fields.find((f: any) => f.name === 'slug')
      expect(slugField).toBeDefined()
      expect(slugField.type).toBe('slug')
      expect(slugField.options?.source).toBe('name')
      expect(slugField.validation).toBeDefined()
    })

    test('[P0] 3.1-INT-005 — logo field is image with hotspot and required alt text', () => {
      const logoField = (sponsor as any).fields.find((f: any) => f.name === 'logo')
      expect(logoField).toBeDefined()
      expect(logoField.type).toBe('image')
      expect(logoField.options?.hotspot).toBe(true)
      expect(logoField.validation).toBeDefined()

      // NFR16: alt text field required on images
      const altField = logoField.fields?.find((f: any) => f.name === 'alt')
      expect(altField).toBeDefined()
      expect(altField.type).toBe('string')
      expect(altField.validation).toBeDefined()
    })

    test('[P1] 3.1-INT-006 — description field is text type', () => {
      const descField = (sponsor as any).fields.find((f: any) => f.name === 'description')
      expect(descField).toBeDefined()
      expect(descField.type).toBe('text')
    })

    test('[P1] 3.1-INT-007 — website field is url type', () => {
      const websiteField = (sponsor as any).fields.find((f: any) => f.name === 'website')
      expect(websiteField).toBeDefined()
      expect(websiteField.type).toBe('url')
    })

    test('[P1] 3.1-INT-008 — industry field is string type', () => {
      const industryField = (sponsor as any).fields.find((f: any) => f.name === 'industry')
      expect(industryField).toBeDefined()
      expect(industryField.type).toBe('string')
    })

    test('[P0] 3.1-INT-009 — tier field is string with 4 options', () => {
      const tierField = (sponsor as any).fields.find((f: any) => f.name === 'tier')
      expect(tierField).toBeDefined()
      expect(tierField.type).toBe('string')

      const options = tierField.options?.list
      expect(options).toBeDefined()
      const values = options.map((o: any) => typeof o === 'object' ? o.value : o)
      expect(values).toEqual(
        expect.arrayContaining(['platinum', 'gold', 'silver', 'bronze']),
      )
      expect(values).toHaveLength(4)
    })

    test('[P0] 3.1-INT-010 — featured field is boolean with initialValue false', () => {
      const featuredField = (sponsor as any).fields.find((f: any) => f.name === 'featured')
      expect(featuredField).toBeDefined()
      expect(featuredField.type).toBe('boolean')
      expect(featuredField.initialValue).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // AC3: Schema registration
  // ---------------------------------------------------------------------------
  describe('AC3: Schema Registration', () => {
    test('[P0] 3.1-INT-011 — sponsor schema is registered in schemaTypes array', () => {
      const sponsorType = schemaTypes.find((s: any) => s.name === 'sponsor')
      expect(sponsorType).toBeDefined()
      expect(sponsorType!.type).toBe('document')
    })
  })
})

/**
 * Story 7-7: Extract link Object & siteSettings Consolidation
 *
 * Tests the new link type, linkFields export, buttonFields export,
 * and siteSettings consolidation using shared field patterns.
 *
 * @story 7-7
 * @phase RED → GREEN
 */
import {describe, test, expect} from 'vitest'

// Task 1: link type + linkFields
import {link, linkFields} from '../../../studio/src/schemaTypes/objects/link'

// Task 3: buttonFields
import {button, buttonFields} from '../../../studio/src/schemaTypes/objects/button'

// Task 2 + 3: siteSettings consolidation
import {siteSettings} from '../../../studio/src/schemaTypes/documents/site-settings'

// Task 4: registration
import {schemaTypes} from '../../../studio/src/schemaTypes/index'

describe('Story 7-7: Extract link Object & siteSettings Consolidation', () => {
  // ---------------------------------------------------------------------------
  // AC1: Create reusable link type and shared linkFields
  // ---------------------------------------------------------------------------
  describe('AC1: link type and linkFields', () => {
    test('7.7-001 — link type is named "link" with type "object"', () => {
      expect(link.name).toBe('link')
      expect(link.type).toBe('object')
    })

    test('7.7-002 — link type has an icon (not LinkIcon)', () => {
      expect((link as any).icon).toBeDefined()
    })

    test('7.7-003 — link type has label, href, external fields', () => {
      const fieldNames = (link as any).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('label')
      expect(fieldNames).toContain('href')
      expect(fieldNames).toContain('external')
    })

    test('7.7-004 — label field is required string', () => {
      const labelField = (link as any).fields.find((f: any) => f.name === 'label')
      expect(labelField.type).toBe('string')
      expect(labelField.validation).toBeDefined()
    })

    test('7.7-005 — href field is required string with custom validation', () => {
      const hrefField = (link as any).fields.find((f: any) => f.name === 'href')
      expect(hrefField.type).toBe('string')
      expect(hrefField.validation).toBeDefined()
    })

    test('7.7-006 — external field is boolean with initialValue false', () => {
      const externalField = (link as any).fields.find((f: any) => f.name === 'external')
      expect(externalField.type).toBe('boolean')
      expect(externalField.initialValue).toBe(false)
    })

    test('7.7-007 — linkFields exports same fields as link type', () => {
      expect(Array.isArray(linkFields)).toBe(true)
      expect(linkFields).toHaveLength((link as any).fields.length)

      const linkFieldNames = linkFields.map((f: any) => f.name)
      const typeFieldNames = (link as any).fields.map((f: any) => f.name)
      expect(linkFieldNames).toEqual(typeFieldNames)
    })
  })

  // ---------------------------------------------------------------------------
  // AC2: siteSettings inline link definitions replaced with linkFields
  // ---------------------------------------------------------------------------
  describe('AC2: siteSettings link arrays use linkFields', () => {
    const getArrayFields = (fieldName: string) => {
      const arrayField = (siteSettings as any).fields.find((f: any) => f.name === fieldName)
      const member = arrayField?.of?.[0]
      return member?.fields?.map((f: any) => f.name) ?? []
    }

    test('7.7-008 — footerLinks array items have label, href, external fields', () => {
      const fields = getArrayFields('footerLinks')
      expect(fields).toContain('label')
      expect(fields).toContain('href')
      expect(fields).toContain('external')
    })

    test('7.7-009 — resourceLinks array items have label, href, external fields', () => {
      const fields = getArrayFields('resourceLinks')
      expect(fields).toContain('label')
      expect(fields).toContain('href')
      expect(fields).toContain('external')
    })

    test('7.7-010 — programLinks array items have label, href, external fields', () => {
      const fields = getArrayFields('programLinks')
      expect(fields).toContain('label')
      expect(fields).toContain('href')
      expect(fields).toContain('external')
    })

    test('7.7-011 — navigationItems children have label, href, external fields', () => {
      const navField = (siteSettings as any).fields.find((f: any) => f.name === 'navigationItems')
      const navMember = navField?.of?.[0]
      const childrenField = navMember?.fields?.find((f: any) => f.name === 'children')
      const childMember = childrenField?.of?.[0]
      const childFieldNames = childMember?.fields?.map((f: any) => f.name) ?? []
      expect(childFieldNames).toContain('label')
      expect(childFieldNames).toContain('href')
      expect(childFieldNames).toContain('external')
    })

    test('7.7-012 — navigationItems top-level retains children array field', () => {
      const navField = (siteSettings as any).fields.find((f: any) => f.name === 'navigationItems')
      const navMember = navField?.of?.[0]
      const navFieldNames = navMember?.fields?.map((f: any) => f.name) ?? []
      expect(navFieldNames).toContain('label')
      expect(navFieldNames).toContain('href')
      expect(navFieldNames).toContain('children')
    })
  })

  // ---------------------------------------------------------------------------
  // AC3: ctaButton uses buttonFields spread
  // ---------------------------------------------------------------------------
  describe('AC3: ctaButton uses buttonFields', () => {
    test('7.7-013 — buttonFields exports an array with text, url, variant fields', () => {
      expect(Array.isArray(buttonFields)).toBe(true)
      const fieldNames = buttonFields.map((f: any) => f.name)
      expect(fieldNames).toContain('text')
      expect(fieldNames).toContain('url')
      expect(fieldNames).toContain('variant')
    })

    test('7.7-014 — buttonFields matches button type fields', () => {
      expect(buttonFields).toHaveLength((button as any).fields.length)
      const bfNames = buttonFields.map((f: any) => f.name)
      const btNames = (button as any).fields.map((f: any) => f.name)
      expect(bfNames).toEqual(btNames)
    })

    test('7.7-015 — ctaButton has text, url, variant fields', () => {
      const ctaField = (siteSettings as any).fields.find((f: any) => f.name === 'ctaButton')
      const fieldNames = ctaField?.fields?.map((f: any) => f.name) ?? []
      expect(fieldNames).toContain('text')
      expect(fieldNames).toContain('url')
      expect(fieldNames).toContain('variant')
    })
  })

  // ---------------------------------------------------------------------------
  // AC4: link type registered in schemaTypes
  // ---------------------------------------------------------------------------
  describe('AC4: Registration', () => {
    test('7.7-016 — link type is registered in schemaTypes', () => {
      const typeNames = schemaTypes.map((t) => t.name)
      expect(typeNames).toContain('link')
    })
  })
})

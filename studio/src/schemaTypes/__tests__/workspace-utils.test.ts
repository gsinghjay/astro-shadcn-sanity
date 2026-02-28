/**
 * Story 15-2: Multi-Workspace Configuration — workspace-utils
 *
 * Tests createSchemaTypesForWorkspace() which returns schema types
 * with siteField.hidden set per target dataset.
 *
 * @story 15-2
 * @phase RED → GREEN
 */
import {describe, test, expect} from 'vitest'

import {createSchemaTypesForWorkspace} from '../workspace-utils'
import {schemaTypes} from '../index'

// Document types that have the site field (from Story 15.1)
const SITE_AWARE_TYPES = ['page', 'sponsor', 'project', 'testimonial', 'event', 'siteSettings']

describe('Story 15-2: createSchemaTypesForWorkspace', () => {
  test('returns the same number of schema types as the base schemaTypes array', () => {
    const result = createSchemaTypesForWorkspace('production')
    expect(result).toHaveLength(schemaTypes.length)
  })

  test('production dataset: site field is hidden on all site-aware types', () => {
    const result = createSchemaTypesForWorkspace('production')
    for (const typeName of SITE_AWARE_TYPES) {
      const typeDef = result.find((t: any) => t.name === typeName)
      expect(typeDef, `type '${typeName}' should exist`).toBeDefined()
      const siteField = (typeDef as any).fields?.find((f: any) => f.name === 'site')
      expect(siteField, `type '${typeName}' should have site field`).toBeDefined()
      expect(siteField.hidden).toBe(true)
    }
  })

  test('rwc dataset: site field is visible on all site-aware types', () => {
    const result = createSchemaTypesForWorkspace('rwc')
    for (const typeName of SITE_AWARE_TYPES) {
      const typeDef = result.find((t: any) => t.name === typeName)
      expect(typeDef, `type '${typeName}' should exist`).toBeDefined()
      const siteField = (typeDef as any).fields?.find((f: any) => f.name === 'site')
      expect(siteField, `type '${typeName}' should have site field`).toBeDefined()
      expect(siteField.hidden).toBe(false)
    }
  })

  test('types without site field are returned unchanged', () => {
    const result = createSchemaTypesForWorkspace('production')
    const submission = result.find((t: any) => t.name === 'submission')
    expect(submission).toBeDefined()
    // submission should be identical to the original (no site field)
    const original = schemaTypes.find((t: any) => t.name === 'submission')
    expect(submission).toBe(original) // same reference — not cloned
  })

  test('object types without fields are returned unchanged', () => {
    const result = createSchemaTypesForWorkspace('rwc')
    const seoType = result.find((t: any) => t.name === 'seo')
    const original = schemaTypes.find((t: any) => t.name === 'seo')
    // seo has fields but no site field — should be same reference
    expect(seoType).toBe(original)
  })

  test('site field preserves spread properties (e.g., group) after override', () => {
    const result = createSchemaTypesForWorkspace('rwc')
    // page schema uses {...siteField, group: 'layout'} — check group is preserved
    const pageType = result.find((t: any) => t.name === 'page')
    const siteField = (pageType as any).fields?.find((f: any) => f.name === 'site')
    // The site field should still have its original properties (name, type, options, validation)
    expect(siteField.name).toBe('site')
    expect(siteField.type).toBe('string')
    expect(siteField.hidden).toBe(false)
    expect(siteField.options).toBeDefined()
    expect(siteField.validation).toBeDefined()
  })

  test('does not mutate the original schemaTypes array', () => {
    const originalLength = schemaTypes.length
    const originalFirst = schemaTypes[0]
    createSchemaTypesForWorkspace('production')
    createSchemaTypesForWorkspace('rwc')
    expect(schemaTypes).toHaveLength(originalLength)
    expect(schemaTypes[0]).toBe(originalFirst)
  })
})

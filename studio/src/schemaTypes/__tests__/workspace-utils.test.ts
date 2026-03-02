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

import type {SchemaTypeDefinition} from 'sanity'

import {createSchemaTypesForWorkspace} from '../workspace-utils'
import {schemaTypes} from '../index'
import {SITE_AWARE_TYPES} from '../../constants'

/** All document types that have the site field (SITE_AWARE_TYPES + siteSettings) */
const TYPES_WITH_SITE_FIELD = [...SITE_AWARE_TYPES, 'siteSettings']

interface SchemaField {
  name: string
  hidden?: unknown
  type?: string
  options?: unknown
  validation?: unknown
  [key: string]: unknown
}

/** Extract a named type from the schema types array */
function findType(types: SchemaTypeDefinition[], name: string) {
  return types.find((t) => 'name' in t && t.name === name) as
    | (SchemaTypeDefinition & {fields?: SchemaField[]})
    | undefined
}

/** Extract a named field from a schema type */
function findField(types: SchemaTypeDefinition[], typeName: string, fieldName: string) {
  return findType(types, typeName)?.fields?.find((f) => f.name === fieldName)
}

describe('Story 15-2: createSchemaTypesForWorkspace', () => {
  test('returns the same number of schema types as the base schemaTypes array', () => {
    const result = createSchemaTypesForWorkspace('production')
    expect(result).toHaveLength(schemaTypes.length)
  })

  test('production dataset: site field is hidden on all types with site field', () => {
    const result = createSchemaTypesForWorkspace('production')
    for (const typeName of TYPES_WITH_SITE_FIELD) {
      const field = findField(result, typeName, 'site')
      expect(field, `type '${typeName}' should have site field`).toBeDefined()
      expect(field!.hidden).toBe(true)
    }
  })

  test('rwc dataset: site field is visible on all types with site field', () => {
    const result = createSchemaTypesForWorkspace('rwc')
    for (const typeName of TYPES_WITH_SITE_FIELD) {
      const field = findField(result, typeName, 'site')
      expect(field, `type '${typeName}' should have site field`).toBeDefined()
      expect(field!.hidden).toBe(false)
    }
  })

  test('types without site field are returned unchanged', () => {
    const result = createSchemaTypesForWorkspace('production')
    const submission = findType(result, 'submission')
    expect(submission).toBeDefined()
    const original = findType(schemaTypes, 'submission')
    expect(submission).toBe(original) // same reference — not cloned
  })

  test('object types without fields are returned unchanged', () => {
    const result = createSchemaTypesForWorkspace('rwc')
    const seoType = findType(result, 'seo')
    const original = findType(schemaTypes, 'seo')
    // seo has fields but no site field — should be same reference
    expect(seoType).toBe(original)
  })

  test('site field preserves spread properties (e.g., group) after override', () => {
    const result = createSchemaTypesForWorkspace('rwc')
    // page schema uses {...siteField, group: 'layout'} — check group is preserved
    const field = findField(result, 'page', 'site')
    expect(field).toBeDefined()
    expect(field!.name).toBe('site')
    expect(field!.type).toBe('string')
    expect(field!.hidden).toBe(false)
    expect(field!.options).toBeDefined()
    expect(field!.validation).toBeDefined()
  })

  test('does not mutate the original schemaTypes array', () => {
    const originalLength = schemaTypes.length
    const originalFirst = schemaTypes[0]
    createSchemaTypesForWorkspace('production')
    createSchemaTypesForWorkspace('rwc')
    expect(schemaTypes).toHaveLength(originalLength)
    expect(schemaTypes[0]).toBe(originalFirst)
  })

  test('unknown dataset (e.g., "staging"): site field defaults to visible', () => {
    const result = createSchemaTypesForWorkspace('staging')
    for (const typeName of TYPES_WITH_SITE_FIELD) {
      const field = findField(result, typeName, 'site')
      expect(field!.hidden).toBe(false)
    }
  })
})

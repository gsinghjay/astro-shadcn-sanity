/**
 * Story 21-10: Columns Block Schema Tests
 *
 * Validates the columnsBlock schema: field structure, variants, inner block
 * types (no recursive nesting), hiddenByVariant, and schema registration.
 *
 * @story 21-10
 * @phase GREEN
 */
import { describe, test, expect } from 'vitest'

import { columnsBlock } from '../../../studio/src/schemaTypes/blocks/columns-block'
import { schemaTypes } from '../../../studio/src/schemaTypes/index'
import { page } from '../../../studio/src/schemaTypes/documents/page'
import { listingPage } from '../../../studio/src/schemaTypes/documents/listing-page'

const BASE_FIELD_NAMES = ['backgroundVariant', 'spacing', 'maxWidth', 'alignment']

function getFields(schema: any): any[] {
  return schema.fields ?? []
}

function findField(schema: any, fieldName: string): any {
  return getFields(schema).find((f: any) => f.name === fieldName)
}

describe('Story 21-10: Columns Block Schema', () => {
  // -------------------------------------------------------------------------
  // AC1: Schema structure
  // -------------------------------------------------------------------------
  describe('AC1: Schema structure', () => {
    test('columnsBlock has correct name and type', () => {
      expect(columnsBlock.name).toBe('columnsBlock')
      expect(columnsBlock.type).toBe('object')
    })

    test('columnsBlock has icon defined', () => {
      expect(columnsBlock.icon).toBeDefined()
    })

    test('columnsBlock has base fields (backgroundVariant, spacing, maxWidth, alignment)', () => {
      const fieldNames = getFields(columnsBlock).map((f: any) => f.name)
      for (const base of BASE_FIELD_NAMES) {
        expect(fieldNames).toContain(base)
      }
    })

    test('columnsBlock has variant field with 5 options', () => {
      const variantField = findField(columnsBlock, 'variant')
      expect(variantField).toBeDefined()
      const options = variantField.options?.list ?? []
      expect(options).toHaveLength(5)
      const values = options.map((o: any) => o.value)
      expect(values).toEqual(['equal', 'wide-left', 'wide-right', 'sidebar-left', 'sidebar-right'])
    })

    test('variant field defaults to equal', () => {
      const variantField = findField(columnsBlock, 'variant')
      expect(variantField.initialValue).toBe('equal')
    })

    test('leftBlocks field exists as array type', () => {
      const field = findField(columnsBlock, 'leftBlocks')
      expect(field).toBeDefined()
      expect(field.type).toBe('array')
    })

    test('rightBlocks field exists as array type', () => {
      const field = findField(columnsBlock, 'rightBlocks')
      expect(field).toBeDefined()
      expect(field.type).toBe('array')
    })

    test('reverseOnMobile field is boolean', () => {
      const field = findField(columnsBlock, 'reverseOnMobile')
      expect(field).toBeDefined()
      expect(field.type).toBe('boolean')
      expect(field.initialValue).toBe(false)
    })

    test('verticalAlign field has 3 options', () => {
      const field = findField(columnsBlock, 'verticalAlign')
      expect(field).toBeDefined()
      const options = field.options?.list ?? []
      expect(options).toHaveLength(3)
      const values = options.map((o: any) => o.value)
      expect(values).toEqual(['top', 'center', 'stretch'])
    })

    test('verticalAlign defaults to top', () => {
      const field = findField(columnsBlock, 'verticalAlign')
      expect(field.initialValue).toBe('top')
    })
  })

  // -------------------------------------------------------------------------
  // AC2: Infinite nesting prevention
  // -------------------------------------------------------------------------
  describe('AC2: No recursive nesting', () => {
    test('leftBlocks does NOT include columnsBlock type', () => {
      const field = findField(columnsBlock, 'leftBlocks')
      const memberTypes = (field.of ?? []).map((m: any) => m.type)
      expect(memberTypes).not.toContain('columnsBlock')
    })

    test('rightBlocks does NOT include columnsBlock type', () => {
      const field = findField(columnsBlock, 'rightBlocks')
      const memberTypes = (field.of ?? []).map((m: any) => m.type)
      expect(memberTypes).not.toContain('columnsBlock')
    })

    test('leftBlocks and rightBlocks have identical type lists', () => {
      const leftField = findField(columnsBlock, 'leftBlocks')
      const rightField = findField(columnsBlock, 'rightBlocks')
      const leftTypes = (leftField.of ?? []).map((m: any) => m.type).sort()
      const rightTypes = (rightField.of ?? []).map((m: any) => m.type).sort()
      expect(leftTypes).toEqual(rightTypes)
    })

    test('inner block types include common blocks (richText, ctaBanner, etc.)', () => {
      const field = findField(columnsBlock, 'leftBlocks')
      const memberTypes = (field.of ?? []).map((m: any) => m.type)
      expect(memberTypes).toContain('richText')
      expect(memberTypes).toContain('ctaBanner')
      expect(memberTypes).toContain('statsRow')
      expect(memberTypes).toContain('heroBanner')
    })
  })

  // -------------------------------------------------------------------------
  // AC3: hiddenByVariant
  // -------------------------------------------------------------------------
  describe('AC3: hiddenByVariant', () => {
    test('reverseOnMobile is hidden when variant is equal', () => {
      const field = findField(columnsBlock, 'reverseOnMobile')
      expect(field.hidden).toBeDefined()
      expect(field.hidden({ parent: { variant: 'equal' } })).toBe(true)
    })

    test('reverseOnMobile is visible for non-equal variants', () => {
      const field = findField(columnsBlock, 'reverseOnMobile')
      expect(field.hidden({ parent: { variant: 'wide-left' } })).toBe(false)
      expect(field.hidden({ parent: { variant: 'sidebar-right' } })).toBe(false)
    })
  })

  // -------------------------------------------------------------------------
  // AC4: Schema registration
  // -------------------------------------------------------------------------
  describe('AC4: Registration', () => {
    test('columnsBlock is registered in schemaTypes', () => {
      const names = schemaTypes.map((s: any) => s.name)
      expect(names).toContain('columnsBlock')
    })

    test('columnsBlock is in page.blocks array', () => {
      const blocksField = page.fields.find((f: any) => f.name === 'blocks')
      const memberTypes = ((blocksField as any)?.of ?? []).map((m: any) => m.type)
      expect(memberTypes).toContain('columnsBlock')
    })

    test('columnsBlock is in listingPage.headerBlocks array', () => {
      const field = listingPage.fields.find((f: any) => f.name === 'headerBlocks')
      const memberTypes = ((field as any)?.of ?? []).map((m: any) => m.type)
      expect(memberTypes).toContain('columnsBlock')
    })

    test('columnsBlock is in listingPage.footerBlocks array', () => {
      const field = listingPage.fields.find((f: any) => f.name === 'footerBlocks')
      const memberTypes = ((field as any)?.of ?? []).map((m: any) => m.type)
      expect(memberTypes).toContain('columnsBlock')
    })
  })
})

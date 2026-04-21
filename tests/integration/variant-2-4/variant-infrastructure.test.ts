/**
 * Story 2-4: Variant Infrastructure — defineBlock variant support (AC1, AC5, AC6)
 *
 * Tests that defineBlock accepts optional variants config and produces
 * a variant field in the layout fieldset with dropdown layout.
 *
 * @story 2-4
 * @phase RED → GREEN
 */
import { describe, test, expect } from 'vitest'

import { defineBlock } from '../../../studio/src/schemaTypes/helpers/defineBlock'

/** Typed shape of defineBlock return for test assertions. */
type BlockSchema = {
  fields: Array<{
    name: string
    fieldset?: string
    options?: { layout?: string; list?: Array<{ title: string; value: string }> }
    initialValue?: string
    hidden?: (ctx: { parent?: { variant?: string } }) => boolean
  }>
}

describe('Story 2-4: Variant Infrastructure', () => {
  // ---------------------------------------------------------------------------
  // AC1: defineBlock accepts optional variants config
  // ---------------------------------------------------------------------------
  describe('AC1: defineBlock variant support', () => {
    test('2.4-INT-001 — defineBlock without variants still works (backward compat)', () => {
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [],
      })

      const fieldNames = (result as BlockSchema).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('backgroundVariant')
      expect(fieldNames).toContain('spacing')
      expect(fieldNames).toContain('maxWidth')
      expect(fieldNames).not.toContain('variant')
    })

    test('2.4-INT-002 — defineBlock with variants adds variant field', () => {
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [],
        variants: [
          { name: 'default', title: 'Default' },
          { name: 'split', title: 'Split' },
          { name: 'overlay', title: 'Overlay' },
        ],
      })

      const fieldNames = (result as BlockSchema).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('variant')
    })

    test('2.4-INT-003 — variant field uses dropdown (no explicit layout)', () => {
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [],
        variants: [
          { name: 'default', title: 'Default' },
          { name: 'split', title: 'Split' },
        ],
      })

      const variantField = (result as BlockSchema).fields.find((f: any) => f.name === 'variant')
      expect(variantField).toBeDefined()
      expect(variantField.options.layout).toBeUndefined()
    })

    test('2.4-INT-004 — variant field lists all provided variants', () => {
      const variants = [
        { name: 'default', title: 'Default' },
        { name: 'split', title: 'Split Layout' },
        { name: 'overlay', title: 'Overlay' },
      ]

      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [],
        variants,
      })

      const variantField = (result as BlockSchema).fields.find((f: any) => f.name === 'variant')
      const values = variantField.options.list.map((o: any) => o.value)
      expect(values).toEqual(['default', 'split', 'overlay'])
    })
  })

  // ---------------------------------------------------------------------------
  // AC5: variant field in layout fieldset
  // ---------------------------------------------------------------------------
  describe('AC5: variant field in layout fieldset', () => {
    test('2.4-INT-005 — variant field is in the layout fieldset', () => {
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [],
        variants: [
          { name: 'default', title: 'Default' },
          { name: 'split', title: 'Split' },
        ],
      })

      const variantField = (result as BlockSchema).fields.find((f: any) => f.name === 'variant')
      expect(variantField.fieldset).toBe('layout')
    })

    test('2.4-INT-006 — variant field initialValue is first variant (default)', () => {
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [],
        variants: [
          { name: 'default', title: 'Default' },
          { name: 'split', title: 'Split' },
        ],
      })

      const variantField = (result as BlockSchema).fields.find((f: any) => f.name === 'variant')
      expect(variantField.initialValue).toBe('default')
    })
  })

  // ---------------------------------------------------------------------------
  // AC6: conditional field hiding support
  // ---------------------------------------------------------------------------
  describe('AC6: conditional field hiding (hiddenByVariant)', () => {
    test('2.4-INT-007 — hiddenByVariant applies hidden function to specified fields', () => {
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [
          { name: 'imagePosition', title: 'Image Position', type: 'string' },
          { name: 'heading', title: 'Heading', type: 'string' },
        ],
        variants: [
          { name: 'default', title: 'Default' },
          { name: 'centered', title: 'Centered' },
        ],
        hiddenByVariant: {
          imagePosition: ['centered'],
        },
      })

      const imgPosField = (result as BlockSchema).fields.find((f: any) => f.name === 'imagePosition')
      expect(imgPosField.hidden).toBeDefined()
      expect(typeof imgPosField.hidden).toBe('function')
    })

    test('2.4-INT-008 — hidden function returns true when variant matches hidden list', () => {
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [
          { name: 'imagePosition', title: 'Image Position', type: 'string' },
        ],
        variants: [
          { name: 'default', title: 'Default' },
          { name: 'centered', title: 'Centered' },
        ],
        hiddenByVariant: {
          imagePosition: ['centered'],
        },
      })

      const imgPosField = (result as BlockSchema).fields.find((f: any) => f.name === 'imagePosition')
      // Simulate Sanity's hidden callback with parent context
      expect(imgPosField.hidden({ parent: { variant: 'centered' } })).toBe(true)
      expect(imgPosField.hidden({ parent: { variant: 'default' } })).toBe(false)
    })

    test('2.4-INT-009 — fields without hiddenByVariant entry are not affected', () => {
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [
          { name: 'imagePosition', title: 'Image Position', type: 'string' },
          { name: 'heading', title: 'Heading', type: 'string' },
        ],
        variants: [
          { name: 'default', title: 'Default' },
          { name: 'centered', title: 'Centered' },
        ],
        hiddenByVariant: {
          imagePosition: ['centered'],
        },
      })

      const headingField = (result as BlockSchema).fields.find((f: any) => f.name === 'heading')
      expect(headingField.hidden).toBeUndefined()
    })

    test('2.4-INT-010 — hiddenByVariant composes with existing hidden function', () => {
      const existingHidden = ({parent}: {parent?: {variant?: string}}) =>
        parent?.variant === 'default'

      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [
          { name: 'imagePosition', title: 'Image Position', type: 'string', hidden: existingHidden },
        ],
        variants: [
          { name: 'default', title: 'Default' },
          { name: 'centered', title: 'Centered' },
          { name: 'split', title: 'Split' },
        ],
        hiddenByVariant: {
          imagePosition: ['centered'],
        },
      })

      const imgPosField = (result as BlockSchema).fields.find((f: any) => f.name === 'imagePosition')
      // Hidden by existing function (variant=default)
      expect(imgPosField.hidden({ parent: { variant: 'default' } })).toBe(true)
      // Hidden by hiddenByVariant (variant=centered)
      expect(imgPosField.hidden({ parent: { variant: 'centered' } })).toBe(true)
      // Visible when neither condition matches
      expect(imgPosField.hidden({ parent: { variant: 'split' } })).toBe(false)
    })
  })
})

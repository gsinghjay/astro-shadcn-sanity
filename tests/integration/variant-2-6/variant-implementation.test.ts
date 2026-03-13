/**
 * Story 2-6: Content & Feature Layout Variants — Implementation Tests
 * Tests that variant fields are properly configured in schemas and hiddenByVariant rules work.
 * Tests component behavior with stegaClean applied to variant values.
 *
 * @story 2-6
 */
import { describe, test, expect } from 'vitest'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { textWithImage } from '../../../studio/src/schemaTypes/blocks/text-with-image'
import { featureGrid } from '../../../studio/src/schemaTypes/blocks/feature-grid'
import { richText } from '../../../studio/src/schemaTypes/blocks/rich-text'

const fromAstroAppRoot = (path: string) => resolve(process.cwd(), path)

/** Typed shape for schema field assertions */
type BlockSchema = {
  fields: Array<{
    name: string
    fieldset?: string
    options?: { layout?: string; list?: Array<any> }
    initialValue?: string
    hidden?: (ctx: { parent?: { variant?: string } }) => boolean
  }>
}

describe('Story 2-6: Content & Feature Layout Variants', () => {
  // ---------------------------------------------------------------------------
  // Task 1 AC: textWithImage variant field and hiddenByVariant
  // ---------------------------------------------------------------------------
  describe('Task 1: textWithImage schema — variant field and field hiding', () => {
    test('2.6-INT-001 — textWithImage has variant field', () => {
      const schema = textWithImage as BlockSchema
      const variantField = schema.fields.find((f) => f.name === 'variant')
      expect(variantField, 'textWithImage missing variant field').toBeDefined()
    })

    test('2.6-INT-002 — textWithImage variant field has 4 options', () => {
      const schema = textWithImage as BlockSchema
      const variantField = schema.fields.find((f) => f.name === 'variant')
      const values = variantField.options.list.map((o: any) => o.value)
      expect(values).toEqual(['split', 'split-asymmetric', 'reversed', 'floating'])
    })

    test('2.6-INT-003 — textWithImage variant field initialValue is split (default)', () => {
      const schema = textWithImage as BlockSchema
      const variantField = schema.fields.find((f) => f.name === 'variant')
      expect(variantField.initialValue).toBe('split')
    })

    test('2.6-INT-004 — textWithImage variant field is in layout fieldset', () => {
      const schema = textWithImage as BlockSchema
      const variantField = schema.fields.find((f) => f.name === 'variant')
      expect(variantField.fieldset).toBe('layout')
    })

    test('2.6-INT-005 — imagePosition is hidden for reversed variant', () => {
      const schema = textWithImage as BlockSchema
      const imgPosField = schema.fields.find((f) => f.name === 'imagePosition')
      expect(imgPosField.hidden({ parent: { variant: 'reversed' } })).toBe(true)
    })

    test('2.6-INT-006 — imagePosition is hidden for floating variant', () => {
      const schema = textWithImage as BlockSchema
      const imgPosField = schema.fields.find((f) => f.name === 'imagePosition')
      expect(imgPosField.hidden({ parent: { variant: 'floating' } })).toBe(true)
    })

    test('2.6-INT-007 — imagePosition is visible for split variant', () => {
      const schema = textWithImage as BlockSchema
      const imgPosField = schema.fields.find((f) => f.name === 'imagePosition')
      expect(imgPosField.hidden({ parent: { variant: 'split' } })).toBe(false)
    })

    test('2.6-INT-008 — imagePosition is visible for split-asymmetric variant', () => {
      const schema = textWithImage as BlockSchema
      const imgPosField = schema.fields.find((f) => f.name === 'imagePosition')
      expect(imgPosField.hidden({ parent: { variant: 'split-asymmetric' } })).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // Task 3 AC: featureGrid variant field and hiddenByVariant
  // ---------------------------------------------------------------------------
  describe('Task 3: featureGrid schema — variant field and field hiding', () => {
    test('2.6-INT-009 — featureGrid has variant field', () => {
      const schema = featureGrid as BlockSchema
      const variantField = schema.fields.find((f) => f.name === 'variant')
      expect(variantField, 'featureGrid missing variant field').toBeDefined()
    })

    test('2.6-INT-010 — featureGrid variant field has 5 options', () => {
      const schema = featureGrid as BlockSchema
      const variantField = schema.fields.find((f) => f.name === 'variant')
      const values = variantField.options.list.map((o: any) => o.value)
      expect(values).toEqual(['grid', 'grid-centered', 'horizontal-cards', 'sidebar-grid', 'stacked'])
    })

    test('2.6-INT-011 — featureGrid variant field initialValue is grid (default)', () => {
      const schema = featureGrid as BlockSchema
      const variantField = schema.fields.find((f) => f.name === 'variant')
      expect(variantField.initialValue).toBe('grid')
    })

    test('2.6-INT-012 — columns field is hidden for stacked variant', () => {
      const schema = featureGrid as BlockSchema
      const columnsField = schema.fields.find((f) => f.name === 'columns')
      expect(columnsField.hidden({ parent: { variant: 'stacked' } })).toBe(true)
    })

    test('2.6-INT-013 — columns field is hidden for sidebar-grid variant', () => {
      const schema = featureGrid as BlockSchema
      const columnsField = schema.fields.find((f) => f.name === 'columns')
      expect(columnsField.hidden({ parent: { variant: 'sidebar-grid' } })).toBe(true)
    })

    test('2.6-INT-014 — columns field is visible for grid variant', () => {
      const schema = featureGrid as BlockSchema
      const columnsField = schema.fields.find((f) => f.name === 'columns')
      expect(columnsField.hidden({ parent: { variant: 'grid' } })).toBe(false)
    })

    test('2.6-INT-015 — columns field is visible for grid-centered variant', () => {
      const schema = featureGrid as BlockSchema
      const columnsField = schema.fields.find((f) => f.name === 'columns')
      expect(columnsField.hidden({ parent: { variant: 'grid-centered' } })).toBe(false)
    })

    test('2.6-INT-016 — columns field is visible for horizontal-cards variant', () => {
      const schema = featureGrid as BlockSchema
      const columnsField = schema.fields.find((f) => f.name === 'columns')
      expect(columnsField.hidden({ parent: { variant: 'horizontal-cards' } })).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // Task 5 AC: richText variant field
  // ---------------------------------------------------------------------------
  describe('Task 5: richText schema — variant field', () => {
    test('2.6-INT-017 — richText has variant field', () => {
      const schema = richText as BlockSchema
      const variantField = schema.fields.find((f) => f.name === 'variant')
      expect(variantField, 'richText missing variant field').toBeDefined()
    })

    test('2.6-INT-018 — richText variant field has 3 options', () => {
      const schema = richText as BlockSchema
      const variantField = schema.fields.find((f) => f.name === 'variant')
      const values = variantField.options.list.map((o: any) => o.value)
      expect(values).toEqual(['prose', 'narrow', 'wide'])
    })

    test('2.6-INT-019 — richText variant field initialValue is prose (default)', () => {
      const schema = richText as BlockSchema
      const variantField = schema.fields.find((f) => f.name === 'variant')
      expect(variantField.initialValue).toBe('prose')
    })

    test('2.6-INT-020 — richText has no hiddenByVariant fields', () => {
      const schema = richText as BlockSchema
      // All fields should be visible regardless of variant
      const hiddenFields = schema.fields.filter((f) => f.hidden)
      expect(hiddenFields).toHaveLength(0)
    })
  })

  // ---------------------------------------------------------------------------
  // Component Behavior Tests (stegaClean validation)
  // ---------------------------------------------------------------------------
  describe('Component Behavior: stegaClean variant handling', () => {
    test('2.6-INT-021 — stegaClean is imported and usable', async () => {
      const { stegaClean } = await import('@sanity/client/stega')
      expect(typeof stegaClean).toBe('function')
      expect(stegaClean('split')).toBe('split')
    })

    test('2.6-INT-022 — stegaClean handles undefined gracefully', async () => {
      const { stegaClean } = await import('@sanity/client/stega')
      // stegaClean should handle undefined or null values
      const result = stegaClean(undefined as any)
      expect(result).toBeUndefined()
    })
  })

  // ---------------------------------------------------------------------------
  // Visual Regression Prevention Tests
  // ---------------------------------------------------------------------------
  describe('AC5: Default variants match current output (zero regression)', () => {
    test('2.6-INT-023 — textWithImage split variant is default', () => {
      const schema = textWithImage as BlockSchema
      const variantField = schema.fields.find((f) => f.name === 'variant')
      expect(variantField.initialValue).toBe('split')
    })

    test('2.6-INT-024 — featureGrid grid variant is default', () => {
      const schema = featureGrid as BlockSchema
      const variantField = schema.fields.find((f) => f.name === 'variant')
      expect(variantField.initialValue).toBe('grid')
    })

    test('2.6-INT-025 — richText prose variant is default', () => {
      const schema = richText as BlockSchema
      const variantField = schema.fields.find((f) => f.name === 'variant')
      expect(variantField.initialValue).toBe('prose')
    })
  })

  // ---------------------------------------------------------------------------
  // AC10: All variant values are cleanable with stegaClean
  // ---------------------------------------------------------------------------
  describe('AC10: stegaClean required before switch logic', () => {
    test('2.6-INT-026 — all textWithImage variant values survive stegaClean', async () => {
      const { stegaClean } = await import('@sanity/client/stega')
      const variants = ['split', 'split-asymmetric', 'reversed', 'floating']
      for (const v of variants) {
        expect(stegaClean(v)).toBe(v)
      }
    })

    test('2.6-INT-027 — all featureGrid variant values survive stegaClean', async () => {
      const { stegaClean } = await import('@sanity/client/stega')
      const variants = ['grid', 'grid-centered', 'horizontal-cards', 'sidebar-grid', 'stacked']
      for (const v of variants) {
        expect(stegaClean(v)).toBe(v)
      }
    })

    test('2.6-INT-028 — all richText variant values survive stegaClean', async () => {
      const { stegaClean } = await import('@sanity/client/stega')
      const variants = ['prose', 'narrow', 'wide']
      for (const v of variants) {
        expect(stegaClean(v)).toBe(v)
      }
    })
  })

  // ---------------------------------------------------------------------------
  // Source-level assertions for Story 2.6 variant behavior requirements
  // ---------------------------------------------------------------------------
  describe('Story 2.6 source assertions', () => {
    test('2.6-INT-029 — default featureGrid variant uses manual div grid, not SectionGrid', async () => {
      const source = await readFile(fromAstroAppRoot('src/components/blocks/custom/FeatureGrid.astro'), 'utf8')
      expect(source).toContain("{cleanVariant === 'grid' ? (")
      expect(source).toContain('grid w-full gap-6')
    })

    test('2.6-INT-030 — horizontal-cards variant renders feature image data', async () => {
      const source = await readFile(fromAstroAppRoot('src/components/blocks/custom/FeatureGrid.astro'), 'utf8')
      expect(source).toContain("cleanVariant === 'horizontal-cards'")
      expect(source).toContain('feature.image')
      expect(source).toContain('safeUrlFor(feature.image)')
    })

    test('2.6-INT-031 — richText narrow variant sets --section-width to 672px', async () => {
      const source = await readFile(fromAstroAppRoot('src/components/blocks/custom/RichText.astro'), 'utf8')
      expect(source).toContain("cleanVariant === 'narrow'")
      expect(source).toContain('--section-width: 672px')
    })

    test('2.6-INT-032 — richText wide variant still uses SectionProse', async () => {
      const source = await readFile(fromAstroAppRoot('src/components/blocks/custom/RichText.astro'), 'utf8')
      expect(source).toContain("cleanVariant === 'wide'")
      expect(source).toContain('<SectionProse size="lg" class="max-w-none">')
    })
  })
})

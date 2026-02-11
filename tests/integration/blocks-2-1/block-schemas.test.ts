/**
 * Story 2-1: Homepage Block Schemas (ATDD)
 *
 * Tests all 6 homepage block schemas created with defineBlock:
 * heroBanner, featureGrid, ctaBanner, statsRow, textWithImage, logoCloud.
 *
 * Validates field structure, types, validation, options, initial values,
 * base field inheritance, preview config, and schema registration.
 *
 * Uses static imports so Playwright's TS transformer can resolve them.
 *
 * @story 2-1
 * @phase GREEN (retroactive — schemas already implemented)
 */
import { describe, test, expect, beforeAll } from 'vitest'

// Schema imports — static so Playwright transforms them
import { heroBanner } from '../../../studio/src/schemaTypes/blocks/hero-banner'
import { featureGrid } from '../../../studio/src/schemaTypes/blocks/feature-grid'
import { ctaBanner } from '../../../studio/src/schemaTypes/blocks/cta-banner'
import { statsRow } from '../../../studio/src/schemaTypes/blocks/stats-row'
import { textWithImage } from '../../../studio/src/schemaTypes/blocks/text-with-image'
import { logoCloud } from '../../../studio/src/schemaTypes/blocks/logo-cloud'
import { schemaTypes } from '../../../studio/src/schemaTypes/index'

// Helper to extract block-specific fields (skip the 3 base fields)
const BASE_FIELD_NAMES = ['backgroundVariant', 'spacing', 'maxWidth']

function getFields(schema: any): any[] {
  return schema.fields ?? []
}

function getBlockFields(schema: any): any[] {
  return getFields(schema).filter((f: any) => !BASE_FIELD_NAMES.includes(f.name))
}

function findField(schema: any, fieldName: string): any {
  return getFields(schema).find((f: any) => f.name === fieldName)
}

// All 6 homepage block schemas for cross-cutting tests
const HOMEPAGE_BLOCKS = [
  { schema: heroBanner, name: 'heroBanner' },
  { schema: featureGrid, name: 'featureGrid' },
  { schema: ctaBanner, name: 'ctaBanner' },
  { schema: statsRow, name: 'statsRow' },
  { schema: textWithImage, name: 'textWithImage' },
  { schema: logoCloud, name: 'logoCloud' },
]

describe('Story 2-1: Homepage Block Schemas (ATDD)', () => {
  // ---------------------------------------------------------------------------
  // AC1: heroBanner block schema
  // ---------------------------------------------------------------------------
  describe('AC1: heroBanner', () => {
    test('[P0] 2.1-INT-001 — heroBanner has correct name and type object', () => {
      expect(heroBanner.name).toBe('heroBanner')
      expect(heroBanner.type).toBe('object')
    })

    test('[P1] 2.1-INT-002 — heroBanner has all 5 block-specific fields', () => {
      const fieldNames = getBlockFields(heroBanner).map((f: any) => f.name)
      expect(fieldNames).toContain('heading')
      expect(fieldNames).toContain('subheading')
      expect(fieldNames).toContain('backgroundImages')
      expect(fieldNames).toContain('ctaButtons')
      expect(fieldNames).toContain('alignment')
      expect(fieldNames).toHaveLength(5)
    })

    test('[P0] 2.1-INT-003 — heroBanner heading is required string', () => {
      const heading = findField(heroBanner, 'heading')
      expect(heading).toBeDefined()
      expect(heading.type).toBe('string')
      expect(heading.validation).toBeDefined()
    })

    test('[P0] 2.1-INT-004 — heroBanner backgroundImages is array of images with hotspot and required alt text (NFR16)', () => {
      const bgImages = findField(heroBanner, 'backgroundImages')
      expect(bgImages).toBeDefined()
      expect(bgImages.type).toBe('array')

      const imageType = bgImages.of?.[0]
      expect(imageType).toBeDefined()
      expect(imageType.type).toBe('image')
      expect(imageType.options?.hotspot).toBe(true)

      const altField = imageType.fields?.find((f: any) => f.name === 'alt')
      expect(altField).toBeDefined()
      expect(altField.type).toBe('string')
      expect(altField.validation).toBeDefined()
    })

    test('[P1] 2.1-INT-005 — heroBanner ctaButtons is array of button type', () => {
      const ctaButtons = findField(heroBanner, 'ctaButtons')
      expect(ctaButtons).toBeDefined()
      expect(ctaButtons.type).toBe('array')

      const memberTypes = ctaButtons.of.map((m: any) => m.type)
      expect(memberTypes).toContain('button')
    })

    test('[P1] 2.1-INT-006 — heroBanner alignment has options [left, center, right] and initialValue center', () => {
      const alignment = findField(heroBanner, 'alignment')
      expect(alignment).toBeDefined()
      expect(alignment.type).toBe('string')
      expect(alignment.options?.list).toEqual(['left', 'center', 'right'])
      expect(alignment.initialValue).toBe('center')
    })
  })

  // ---------------------------------------------------------------------------
  // AC1: featureGrid block schema
  // ---------------------------------------------------------------------------
  describe('AC1: featureGrid', () => {
    test('[P0] 2.1-INT-007 — featureGrid has correct name and type object', () => {
      expect(featureGrid.name).toBe('featureGrid')
      expect(featureGrid.type).toBe('object')
    })

    test('[P1] 2.1-INT-008 — featureGrid has all 3 block-specific fields', () => {
      const fieldNames = getBlockFields(featureGrid).map((f: any) => f.name)
      expect(fieldNames).toContain('heading')
      expect(fieldNames).toContain('items')
      expect(fieldNames).toContain('columns')
      expect(fieldNames).toHaveLength(3)
    })

    test('[P1] 2.1-INT-009 — featureGrid items is array of objects with icon, image, title, description', () => {
      const items = findField(featureGrid, 'items')
      expect(items).toBeDefined()
      expect(items.type).toBe('array')

      const objectMember = items.of.find((m: any) => m.type === 'object')
      expect(objectMember).toBeDefined()

      const itemFieldNames = objectMember.fields.map((f: any) => f.name)
      expect(itemFieldNames).toContain('icon')
      expect(itemFieldNames).toContain('image')
      expect(itemFieldNames).toContain('title')
      expect(itemFieldNames).toContain('description')
    })

    test('[P0] 2.1-INT-010 — featureGrid items image has hotspot and required alt text (NFR16)', () => {
      const items = findField(featureGrid, 'items')
      const objectMember = items.of.find((m: any) => m.type === 'object')
      const imageField = objectMember.fields.find((f: any) => f.name === 'image')

      expect(imageField).toBeDefined()
      expect(imageField.type).toBe('image')
      expect(imageField.options?.hotspot).toBe(true)

      const altField = imageField.fields?.find((f: any) => f.name === 'alt')
      expect(altField).toBeDefined()
      expect(altField.type).toBe('string')
      expect(altField.validation).toBeDefined()
    })

    test('[P1] 2.1-INT-011 — featureGrid items title is required', () => {
      const items = findField(featureGrid, 'items')
      const objectMember = items.of.find((m: any) => m.type === 'object')
      const titleField = objectMember.fields.find((f: any) => f.name === 'title')

      expect(titleField).toBeDefined()
      expect(titleField.type).toBe('string')
      expect(titleField.validation).toBeDefined()
    })

    test('[P1] 2.1-INT-012 — featureGrid columns is number with options [2, 3, 4] and initialValue 3', () => {
      const columns = findField(featureGrid, 'columns')
      expect(columns).toBeDefined()
      expect(columns.type).toBe('number')
      expect(columns.options?.list).toEqual([2, 3, 4])
      expect(columns.initialValue).toBe(3)
    })
  })

  // ---------------------------------------------------------------------------
  // AC1: ctaBanner block schema
  // ---------------------------------------------------------------------------
  describe('AC1: ctaBanner', () => {
    test('[P0] 2.1-INT-013 — ctaBanner has correct name and type object', () => {
      expect(ctaBanner.name).toBe('ctaBanner')
      expect(ctaBanner.type).toBe('object')
    })

    test('[P1] 2.1-INT-014 — ctaBanner has all 3 block-specific fields', () => {
      const fieldNames = getBlockFields(ctaBanner).map((f: any) => f.name)
      expect(fieldNames).toContain('heading')
      expect(fieldNames).toContain('description')
      expect(fieldNames).toContain('ctaButtons')
      expect(fieldNames).toHaveLength(3)
    })

    test('[P0] 2.1-INT-015 — ctaBanner heading is required string', () => {
      const heading = findField(ctaBanner, 'heading')
      expect(heading).toBeDefined()
      expect(heading.type).toBe('string')
      expect(heading.validation).toBeDefined()
    })

    test('[P1] 2.1-INT-016 — ctaBanner description is text type', () => {
      const description = findField(ctaBanner, 'description')
      expect(description).toBeDefined()
      expect(description.type).toBe('text')
    })

    test('[P1] 2.1-INT-017 — ctaBanner ctaButtons is array of button type', () => {
      const ctaButtons = findField(ctaBanner, 'ctaButtons')
      expect(ctaButtons).toBeDefined()
      expect(ctaButtons.type).toBe('array')

      const memberTypes = ctaButtons.of.map((m: any) => m.type)
      expect(memberTypes).toContain('button')
    })
  })

  // ---------------------------------------------------------------------------
  // AC1: statsRow block schema
  // ---------------------------------------------------------------------------
  describe('AC1: statsRow', () => {
    test('[P0] 2.1-INT-018 — statsRow has correct name and type object', () => {
      expect(statsRow.name).toBe('statsRow')
      expect(statsRow.type).toBe('object')
    })

    test('[P1] 2.1-INT-019 — statsRow has all 2 block-specific fields', () => {
      const fieldNames = getBlockFields(statsRow).map((f: any) => f.name)
      expect(fieldNames).toContain('heading')
      expect(fieldNames).toContain('stats')
      expect(fieldNames).toHaveLength(2)
    })

    test('[P1] 2.1-INT-020 — statsRow stats is array of objects with value (required), label (required), description', () => {
      const stats = findField(statsRow, 'stats')
      expect(stats).toBeDefined()
      expect(stats.type).toBe('array')

      const objectMember = stats.of.find((m: any) => m.type === 'object')
      expect(objectMember).toBeDefined()

      const statFieldNames = objectMember.fields.map((f: any) => f.name)
      expect(statFieldNames).toContain('value')
      expect(statFieldNames).toContain('label')
      expect(statFieldNames).toContain('description')

      // value and label are required
      const valueField = objectMember.fields.find((f: any) => f.name === 'value')
      expect(valueField.type).toBe('string')
      expect(valueField.validation).toBeDefined()

      const labelField = objectMember.fields.find((f: any) => f.name === 'label')
      expect(labelField.type).toBe('string')
      expect(labelField.validation).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  // AC1: textWithImage block schema
  // ---------------------------------------------------------------------------
  describe('AC1: textWithImage', () => {
    test('[P0] 2.1-INT-021 — textWithImage has correct name and type object', () => {
      expect(textWithImage.name).toBe('textWithImage')
      expect(textWithImage.type).toBe('object')
    })

    test('[P1] 2.1-INT-022 — textWithImage has all 4 block-specific fields', () => {
      const fieldNames = getBlockFields(textWithImage).map((f: any) => f.name)
      expect(fieldNames).toContain('heading')
      expect(fieldNames).toContain('content')
      expect(fieldNames).toContain('image')
      expect(fieldNames).toContain('imagePosition')
      expect(fieldNames).toHaveLength(4)
    })

    test('[P1] 2.1-INT-023 — textWithImage content is portableText type', () => {
      const content = findField(textWithImage, 'content')
      expect(content).toBeDefined()
      expect(content.type).toBe('portableText')
    })

    test('[P0] 2.1-INT-024 — textWithImage image has hotspot and required alt text (NFR16)', () => {
      const image = findField(textWithImage, 'image')
      expect(image).toBeDefined()
      expect(image.type).toBe('image')
      expect(image.options?.hotspot).toBe(true)

      const altField = image.fields?.find((f: any) => f.name === 'alt')
      expect(altField).toBeDefined()
      expect(altField.type).toBe('string')
      expect(altField.validation).toBeDefined()
    })

    test('[P1] 2.1-INT-025 — textWithImage imagePosition has options [left, right] and initialValue right', () => {
      const imagePosition = findField(textWithImage, 'imagePosition')
      expect(imagePosition).toBeDefined()
      expect(imagePosition.type).toBe('string')
      expect(imagePosition.options?.list).toEqual(['left', 'right'])
      expect(imagePosition.initialValue).toBe('right')
    })
  })

  // ---------------------------------------------------------------------------
  // AC1: logoCloud block schema
  // ---------------------------------------------------------------------------
  describe('AC1: logoCloud', () => {
    test('[P0] 2.1-INT-026 — logoCloud has correct name and type object', () => {
      expect(logoCloud.name).toBe('logoCloud')
      expect(logoCloud.type).toBe('object')
    })

    test('[P1] 2.1-INT-027 — logoCloud has all 3 block-specific fields', () => {
      const fieldNames = getBlockFields(logoCloud).map((f: any) => f.name)
      expect(fieldNames).toContain('heading')
      expect(fieldNames).toContain('autoPopulate')
      expect(fieldNames).toContain('sponsors')
      expect(fieldNames).toHaveLength(3)
    })

    test('[P1] 2.1-INT-028 — logoCloud autoPopulate is boolean with initialValue true', () => {
      const autoPopulate = findField(logoCloud, 'autoPopulate')
      expect(autoPopulate).toBeDefined()
      expect(autoPopulate.type).toBe('boolean')
      expect(autoPopulate.initialValue).toBe(true)
    })

    test('[P1] 2.1-INT-029 — logoCloud sponsors is array of references to sponsor', () => {
      const sponsors = findField(logoCloud, 'sponsors')
      expect(sponsors).toBeDefined()
      expect(sponsors.type).toBe('array')

      const refMember = sponsors.of.find((m: any) => m.type === 'reference')
      expect(refMember).toBeDefined()

      const refTargets = refMember.to.map((t: any) => t.type)
      expect(refTargets).toContain('sponsor')
    })

    test('[P2] 2.1-INT-030 — logoCloud sponsors has hidden function for conditional visibility', () => {
      const sponsors = findField(logoCloud, 'sponsors')
      expect(sponsors.hidden).toBeDefined()
      expect(typeof sponsors.hidden).toBe('function')

      // sponsors hidden when autoPopulate is not explicitly false
      expect(sponsors.hidden({ parent: { autoPopulate: true } })).toBe(true)
      expect(sponsors.hidden({ parent: { autoPopulate: false } })).toBe(false)
      expect(sponsors.hidden({ parent: {} })).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // AC2: Schema Registration
  // ---------------------------------------------------------------------------
  describe('AC2: Schema Registration', () => {
    test('[P0] 2.1-INT-031 — all 6 homepage block schemas are registered in schemaTypes', () => {
      const typeNames = schemaTypes.map((s: any) => s.name)

      expect(typeNames).toContain('heroBanner')
      expect(typeNames).toContain('featureGrid')
      expect(typeNames).toContain('ctaBanner')
      expect(typeNames).toContain('statsRow')
      expect(typeNames).toContain('textWithImage')
      expect(typeNames).toContain('logoCloud')
    })
  })

  // ---------------------------------------------------------------------------
  // AC1 (cross-cutting): Base fields inherited via defineBlock
  // ---------------------------------------------------------------------------
  describe('AC1: Base Field Inheritance', () => {
    for (const { schema, name } of HOMEPAGE_BLOCKS) {
      test(`[P0] 2.1-INT-032-${name} — ${name} has base fields (backgroundVariant, spacing, maxWidth)`, () => {
        const fieldNames = getFields(schema).map((f: any) => f.name)
        expect(fieldNames).toContain('backgroundVariant')
        expect(fieldNames).toContain('spacing')
        expect(fieldNames).toContain('maxWidth')
      })
    }
  })

  // ---------------------------------------------------------------------------
  // AC1 (cross-cutting): Preview configuration
  // ---------------------------------------------------------------------------
  describe('AC1: Preview Configuration', () => {
    for (const { schema, name } of HOMEPAGE_BLOCKS) {
      test(`[P2] 2.1-INT-033-${name} — ${name} has preview config selecting heading`, () => {
        expect((schema as any).preview).toBeDefined()
        expect((schema as any).preview.select.title).toBe('heading')
      })
    }

    test('[P2] 2.1-INT-034 — featureGrid items have preview selecting title', () => {
      const items = findField(featureGrid, 'items')
      const objectMember = items.of.find((m: any) => m.type === 'object')
      expect(objectMember.preview).toBeDefined()
      expect(objectMember.preview.select.title).toBe('title')
    })

    test('[P2] 2.1-INT-035 — statsRow stats have preview selecting label and value', () => {
      const stats = findField(statsRow, 'stats')
      const objectMember = stats.of.find((m: any) => m.type === 'object')
      expect(objectMember.preview).toBeDefined()
      expect(objectMember.preview.select.title).toBe('label')
      expect(objectMember.preview.select.subtitle).toBe('value')
    })
  })
})

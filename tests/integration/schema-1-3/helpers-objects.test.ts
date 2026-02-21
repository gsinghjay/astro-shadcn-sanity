/**
 * Story 1-3: Schema Infrastructure — Helpers & Object Schemas (AC1-5)
 *
 * Tests defineBlock helper, blockBaseFields, and object schemas (seo, button, portableText).
 * Uses static imports so Playwright's TS transformer can resolve them.
 *
 * @story 1-3
 * @phase GREEN
 */
import { describe, test, expect, beforeAll } from 'vitest'

// Schema imports — static so Playwright transforms them
import { defineBlock } from '../../../studio/src/schemaTypes/helpers/defineBlock'
import { blockBaseFields } from '../../../studio/src/schemaTypes/objects/block-base'
import { seo } from '../../../studio/src/schemaTypes/objects/seo'
import { button } from '../../../studio/src/schemaTypes/objects/button'
import { portableText } from '../../../studio/src/schemaTypes/objects/portable-text'

describe('Story 1-3: Schema Infrastructure (ATDD)', () => {
  // ---------------------------------------------------------------------------
  // AC1: defineBlock helper
  // ---------------------------------------------------------------------------
  describe('AC1: defineBlock Helper', () => {
    test('[P0] 1.3-INT-001 — defineBlock exports a function', () => {
      expect(typeof defineBlock).toBe('function')
    })

    test('[P0] 1.3-INT-002 — defineBlock merges base fields into block schema', () => {
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [],
      })

      expect(result.name).toBe('testBlock')
      expect(result.type).toBe('object')

      const fieldNames = (result as any).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('backgroundVariant')
      expect(fieldNames).toContain('spacing')
      expect(fieldNames).toContain('maxWidth')
    })

    test('[P0] 1.3-INT-003 — defineBlock places base fields before block-specific fields', () => {
      const result = defineBlock({
        name: 'testBlock',
        title: 'Test Block',
        fields: [
          { name: 'heading', title: 'Heading', type: 'string' },
        ],
      })

      const fieldNames = (result as any).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('heading')

      // Base fields come first, then block-specific
      const headingIdx = fieldNames.indexOf('heading')
      const bgIdx = fieldNames.indexOf('backgroundVariant')
      expect(headingIdx).toBeGreaterThan(bgIdx)
    })
  })

  // ---------------------------------------------------------------------------
  // AC2: block-base shared fields
  // ---------------------------------------------------------------------------
  describe('AC2: Block Base Fields', () => {
    test('[P0] 1.3-INT-004 — blockBaseFields contains backgroundVariant with constrained presets', () => {
      const bgField = blockBaseFields.find((f: any) => f.name === 'backgroundVariant')
      expect(bgField).toBeDefined()
      expect(bgField!.type).toBe('string')

      const options = (bgField as any).options?.list
      const values = options.map((o: any) => typeof o === 'object' ? o.value : o)
      expect(values).toEqual(expect.arrayContaining(['white', 'light', 'dark', 'primary']))
      expect(values).toHaveLength(4)
    })

    test('[P0] 1.3-INT-005 — blockBaseFields contains spacing with constrained presets', () => {
      const spacingField = blockBaseFields.find((f: any) => f.name === 'spacing')
      expect(spacingField).toBeDefined()
      expect(spacingField!.type).toBe('string')

      const options = (spacingField as any).options?.list
      const values = options.map((o: any) => typeof o === 'object' ? o.value : o)
      expect(values).toEqual(expect.arrayContaining(['none', 'small', 'default', 'large']))
      expect(values).toHaveLength(4)
    })

    test('[P0] 1.3-INT-006 — blockBaseFields contains maxWidth with constrained presets', () => {
      const maxWidthField = blockBaseFields.find((f: any) => f.name === 'maxWidth')
      expect(maxWidthField).toBeDefined()
      expect(maxWidthField!.type).toBe('string')

      const options = (maxWidthField as any).options?.list
      const values = options.map((o: any) => typeof o === 'object' ? o.value : o)
      expect(values).toEqual(expect.arrayContaining(['narrow', 'default', 'full']))
      expect(values).toHaveLength(3)
    })
  })

  // ---------------------------------------------------------------------------
  // AC3: SEO object schema
  // ---------------------------------------------------------------------------
  describe('AC3: SEO Object Schema', () => {
    test('[P1] 1.3-INT-007 — seo schema has metaTitle, metaDescription, ogImage fields', () => {
      expect(seo.name).toBe('seo')
      expect(seo.type).toBe('object')

      const fieldNames = (seo as any).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('metaTitle')
      expect(fieldNames).toContain('metaDescription')
      expect(fieldNames).toContain('ogImage')
    })

    test('[P1] 1.3-INT-008 — seo metaTitle has max length validation', () => {
      const metaTitle = (seo as any).fields.find((f: any) => f.name === 'metaTitle')
      expect(metaTitle).toBeDefined()
      expect(metaTitle.type).toBe('string')
      expect(metaTitle.validation).toBeDefined()
    })

    test('[P1] 1.3-INT-009 — seo metaDescription is text type with max length validation', () => {
      const metaDesc = (seo as any).fields.find((f: any) => f.name === 'metaDescription')
      expect(metaDesc).toBeDefined()
      expect(metaDesc.type).toBe('text')
      expect(metaDesc.validation).toBeDefined()
    })

    test('[P1] 1.3-INT-010 — seo ogImage has alt text field', () => {
      const ogImage = (seo as any).fields.find((f: any) => f.name === 'ogImage')
      expect(ogImage).toBeDefined()
      expect(ogImage.type).toBe('image')

      const altField = ogImage.fields?.find((f: any) => f.name === 'alt')
      expect(altField).toBeDefined()
      expect(altField.type).toBe('string')
    })
  })

  // ---------------------------------------------------------------------------
  // AC4: Button object schema
  // ---------------------------------------------------------------------------
  describe('AC4: Button Object Schema', () => {
    test('[P1] 1.3-INT-011 — button schema has text, url, variant fields', () => {
      expect(button.name).toBe('button')
      expect(button.type).toBe('object')

      const fieldNames = (button as any).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('text')
      expect(fieldNames).toContain('url')
      expect(fieldNames).toContain('variant')
    })

    test('[P1] 1.3-INT-012 — button text is required string', () => {
      const textField = (button as any).fields.find((f: any) => f.name === 'text')
      expect(textField).toBeDefined()
      expect(textField.type).toBe('string')
      expect(textField.validation).toBeDefined()
    })

    test('[P1] 1.3-INT-013 — button url is required string with URL validation', () => {
      const urlField = (button as any).fields.find((f: any) => f.name === 'url')
      expect(urlField).toBeDefined()
      expect(urlField.type).toBe('string')
      expect(urlField.validation).toBeDefined()
    })

    test('[P1] 1.3-INT-014 — button variant has constrained options', () => {
      const variantField = (button as any).fields.find((f: any) => f.name === 'variant')
      expect(variantField).toBeDefined()
      expect(variantField.type).toBe('string')

      const options = variantField.options?.list
      const values = options.map((o: any) => typeof o === 'object' ? o.value : o)
      expect(values).toEqual(
        expect.arrayContaining(['default', 'secondary', 'outline', 'ghost']),
      )
    })
  })

  // ---------------------------------------------------------------------------
  // AC5: Portable Text schema
  // ---------------------------------------------------------------------------
  describe('AC5: Portable Text Schema', () => {
    test('[P1] 1.3-INT-015 — portableText is array type with block, image, callout members', () => {
      expect(portableText.name).toBe('portableText')
      expect(portableText.type).toBe('array')

      const members = (portableText as any).of
      const memberTypes = members.map((m: any) => m.type || m.name)
      expect(memberTypes).toContain('block')
      expect(memberTypes).toContain('image')

      // Callout is a named object type within the array
      const hasCallout = members.some((m: any) => m.name === 'callout' || m.type === 'callout')
      expect(hasCallout).toBe(true)
    })

    test('[P1] 1.3-INT-016 — portableText block has expected styles', () => {
      const blockMember = (portableText as any).of.find((m: any) => m.type === 'block')
      expect(blockMember).toBeDefined()

      const styleValues = blockMember.styles.map((s: any) => s.value)
      expect(styleValues).toContain('normal')
      expect(styleValues).toContain('h2')
      expect(styleValues).toContain('h3')
      expect(styleValues).toContain('h4')
      expect(styleValues).toContain('blockquote')
    })

    test('[P1] 1.3-INT-017 — portableText block has strong, em, code, underline decorators', () => {
      const blockMember = (portableText as any).of.find((m: any) => m.type === 'block')
      const decorators = blockMember.marks.decorators.map((d: any) => d.value)
      expect(decorators).toContain('strong')
      expect(decorators).toContain('em')
      expect(decorators).toContain('code')
      expect(decorators).toContain('underline')
    })

    test('[P1] 1.3-INT-018 — portableText block has link and internalLink annotations', () => {
      const blockMember = (portableText as any).of.find((m: any) => m.type === 'block')
      const annotationNames = blockMember.marks.annotations.map((a: any) => a.name)
      expect(annotationNames).toContain('link')
      expect(annotationNames).toContain('internalLink')
    })

    test('[P1] 1.3-INT-019 — portableText image member has required alt text (NFR16)', () => {
      const imageMember = (portableText as any).of.find((m: any) => m.type === 'image')
      expect(imageMember).toBeDefined()

      const altField = imageMember.fields?.find((f: any) => f.name === 'alt')
      expect(altField).toBeDefined()
      expect(altField.validation).toBeDefined()
    })
  })
})

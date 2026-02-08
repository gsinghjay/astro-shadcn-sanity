/**
 * Story 2-0: Template Layout System — Page Schema (AC1-5)
 *
 * Tests template field, insert menu groups, and template-aware validation
 * on the page document schema.
 *
 * @story 2-0
 * @phase RED → GREEN
 */
import { test, expect } from '@playwright/test'

import { page as pageSchema } from '../../../studio/src/schemaTypes/documents/page'

test.describe('Story 2-0: Template Layout System — Page Schema', () => {
  // ---------------------------------------------------------------------------
  // AC1: Template string field with constrained layout options
  // ---------------------------------------------------------------------------
  test.describe('AC1: Template field exists with correct options', () => {
    test('[P0] 2.0-INT-001 — page schema has template field', () => {
      const fieldNames = (pageSchema as any).fields.map((f: any) => f.name)
      expect(fieldNames).toContain('template')
    })

    test('[P0] 2.0-INT-002 — template field is a string type', () => {
      const templateField = (pageSchema as any).fields.find((f: any) => f.name === 'template')
      expect(templateField).toBeDefined()
      expect(templateField.type).toBe('string')
    })

    test('[P0] 2.0-INT-003 — template field uses radio layout', () => {
      const templateField = (pageSchema as any).fields.find((f: any) => f.name === 'template')
      expect(templateField.options?.layout).toBe('radio')
    })

    test('[P0] 2.0-INT-004 — template field has correct initial value', () => {
      const templateField = (pageSchema as any).fields.find((f: any) => f.name === 'template')
      expect(templateField.initialValue).toBe('default')
    })
  })

  // ---------------------------------------------------------------------------
  // AC2: Available templates
  // ---------------------------------------------------------------------------
  test.describe('AC2: Available template options', () => {
    test('[P0] 2.0-INT-005 — template field has exactly 5 options', () => {
      const templateField = (pageSchema as any).fields.find((f: any) => f.name === 'template')
      expect(templateField.options?.list).toHaveLength(5)
    })

    test('[P0] 2.0-INT-006 — template options include all required values', () => {
      const templateField = (pageSchema as any).fields.find((f: any) => f.name === 'template')
      const values = templateField.options.list.map((item: any) => item.value)
      expect(values).toEqual(['default', 'fullWidth', 'landing', 'sidebar', 'twoColumn'])
    })
  })

  // ---------------------------------------------------------------------------
  // AC5: Template field placement (before blocks)
  // ---------------------------------------------------------------------------
  test.describe('AC5: Template field placement', () => {
    test('[P0] 2.0-INT-007 — template field appears before blocks field', () => {
      const fieldNames = (pageSchema as any).fields.map((f: any) => f.name)
      const templateIndex = fieldNames.indexOf('template')
      const blocksIndex = fieldNames.indexOf('blocks')
      expect(templateIndex).toBeGreaterThan(-1)
      expect(blocksIndex).toBeGreaterThan(-1)
      expect(templateIndex).toBeLessThan(blocksIndex)
    })

    test('[P1] 2.0-INT-008 — template field has a group assignment', () => {
      const templateField = (pageSchema as any).fields.find((f: any) => f.name === 'template')
      expect(templateField.group).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  // AC4: Insert menu groups on blocks field
  // ---------------------------------------------------------------------------
  test.describe('AC4: Insert menu groups', () => {
    test('[P0] 2.0-INT-009 — blocks field has insertMenu with filter enabled', () => {
      const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
      expect(blocksField.options?.insertMenu).toBeDefined()
      expect(blocksField.options.insertMenu.filter).toBe(true)
    })

    test('[P0] 2.0-INT-010 — insertMenu has categorized groups', () => {
      const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
      const groups = blocksField.options.insertMenu.groups
      expect(groups).toBeDefined()
      expect(groups.length).toBeGreaterThanOrEqual(5)

      const groupNames = groups.map((g: any) => g.name)
      expect(groupNames).toContain('heroes')
      expect(groupNames).toContain('content')
      expect(groupNames).toContain('media')
      expect(groupNames).toContain('social')
      expect(groupNames).toContain('cta')
    })

    test('[P0] 2.0-INT-011 — heroes group contains heroBanner', () => {
      const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
      const heroesGroup = blocksField.options.insertMenu.groups.find((g: any) => g.name === 'heroes')
      expect(heroesGroup.of).toContain('heroBanner')
    })

    test('[P0] 2.0-INT-012 — content group contains expected types', () => {
      const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
      const contentGroup = blocksField.options.insertMenu.groups.find((g: any) => g.name === 'content')
      expect(contentGroup.of).toEqual(expect.arrayContaining(['richText', 'textWithImage', 'faqSection', 'timeline']))
    })

    test('[P0] 2.0-INT-013 — media group contains expected types', () => {
      const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
      const mediaGroup = blocksField.options.insertMenu.groups.find((g: any) => g.name === 'media')
      expect(mediaGroup.of).toEqual(expect.arrayContaining(['statsRow', 'featureGrid', 'teamGrid']))
    })

    test('[P0] 2.0-INT-014 — social group contains expected types', () => {
      const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
      const socialGroup = blocksField.options.insertMenu.groups.find((g: any) => g.name === 'social')
      expect(socialGroup.of).toEqual(expect.arrayContaining(['sponsorCards', 'logoCloud']))
    })

    test('[P0] 2.0-INT-015 — cta group contains expected types', () => {
      const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
      const ctaGroup = blocksField.options.insertMenu.groups.find((g: any) => g.name === 'cta')
      expect(ctaGroup.of).toEqual(expect.arrayContaining(['ctaBanner', 'contactForm']))
    })

    test('[P1] 2.0-INT-016 — insertMenu has list and grid views', () => {
      const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
      const views = blocksField.options.insertMenu.views
      expect(views).toBeDefined()

      const viewNames = views.map((v: any) => v.name)
      expect(viewNames).toContain('list')
      expect(viewNames).toContain('grid')
    })
  })

  // ---------------------------------------------------------------------------
  // AC3: Page schema groups
  // ---------------------------------------------------------------------------
  test.describe('AC3: Page schema groups', () => {
    test('[P1] 2.0-INT-017 — page schema defines groups', () => {
      expect((pageSchema as any).groups).toBeDefined()
      expect((pageSchema as any).groups.length).toBeGreaterThan(0)
    })
  })
})

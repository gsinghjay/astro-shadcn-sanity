/**
 * Story 2-0: Template Layout System — Template-Aware Validation (AC9)
 *
 * Tests the advisory validation logic for block/template compatibility.
 *
 * @story 2-0
 * @phase GREEN
 */
import { test, expect } from '@playwright/test'

import {
  page as pageSchema,
  wideBlockWarnings,
  validateBlockTemplateCompatibility,
} from '../../../studio/src/schemaTypes/documents/page'

test.describe('Story 2-0: Template-Aware Validation (AC9)', () => {
  test('[P0] 2.0-INT-034 — wideBlockWarnings map is exported and non-empty', () => {
    expect(wideBlockWarnings).toBeDefined()
    expect(Object.keys(wideBlockWarnings).length).toBeGreaterThan(0)
  })

  test('[P0] 2.0-INT-035 — heroBanner warns in sidebar and twoColumn', () => {
    expect(wideBlockWarnings.heroBanner).toEqual(expect.arrayContaining(['sidebar', 'twoColumn']))
  })

  test('[P0] 2.0-INT-036 — statsRow warns in sidebar', () => {
    expect(wideBlockWarnings.statsRow).toContain('sidebar')
  })

  test('[P0] 2.0-INT-037 — timeline warns in sidebar and twoColumn', () => {
    expect(wideBlockWarnings.timeline).toEqual(expect.arrayContaining(['sidebar', 'twoColumn']))
  })

  test('[P0] 2.0-INT-038 — blocks field has custom validation defined', () => {
    const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
    expect(blocksField.validation).toBeDefined()
  })

  test('[P0] 2.0-INT-039 — compatible blocks do not appear in wideBlockWarnings', () => {
    // richText, textWithImage, faqSection, contactForm, featureGrid, ctaBanner
    // should not warn in any template
    const universalBlocks = ['richText', 'textWithImage', 'faqSection', 'contactForm', 'ctaBanner', 'featureGrid']
    for (const block of universalBlocks) {
      expect(wideBlockWarnings[block], `${block} should not have warnings`).toBeUndefined()
    }
  })

  test('[P1] 2.0-INT-040 — wideBlockWarnings covers all expected wide blocks', () => {
    const expectedWideBlocks = ['heroBanner', 'statsRow', 'logoCloud', 'sponsorCards', 'timeline', 'teamGrid']
    for (const block of expectedWideBlocks) {
      expect(wideBlockWarnings[block], `${block} should have warnings`).toBeDefined()
    }
  })
})

test.describe('Story 2-0: Validation Function Behavior (AC9)', () => {
  test('[P0] 2.0-INT-049 — returns true for null blocks', () => {
    expect(validateBlockTemplateCompatibility(null, 'sidebar')).toBe(true)
  })

  test('[P0] 2.0-INT-050 — returns true for undefined blocks', () => {
    expect(validateBlockTemplateCompatibility(undefined, 'sidebar')).toBe(true)
  })

  test('[P0] 2.0-INT-051 — returns true for empty blocks array', () => {
    expect(validateBlockTemplateCompatibility([], 'sidebar')).toBe(true)
  })

  test('[P0] 2.0-INT-052 — returns true for null template', () => {
    expect(validateBlockTemplateCompatibility([{_type: 'heroBanner'}], null)).toBe(true)
  })

  test('[P0] 2.0-INT-053 — returns true for undefined template', () => {
    expect(validateBlockTemplateCompatibility([{_type: 'heroBanner'}], undefined)).toBe(true)
  })

  test('[P0] 2.0-INT-054 — returns true for compatible blocks in default template', () => {
    const blocks = [{_type: 'richText'}, {_type: 'ctaBanner'}]
    expect(validateBlockTemplateCompatibility(blocks, 'default')).toBe(true)
  })

  test('[P0] 2.0-INT-055 — returns warning for heroBanner in sidebar', () => {
    const result = validateBlockTemplateCompatibility([{_type: 'heroBanner'}], 'sidebar')
    expect(result).toEqual({
      message: expect.stringContaining('heroBanner'),
      level: 'warning',
    })
  })

  test('[P0] 2.0-INT-056 — warning level is "warning", not "error"', () => {
    const result = validateBlockTemplateCompatibility([{_type: 'heroBanner'}], 'sidebar')
    expect(result).toHaveProperty('level', 'warning')
    expect(result).not.toHaveProperty('level', 'error')
  })

  test('[P0] 2.0-INT-057 — returns combined warnings for multiple incompatible blocks', () => {
    const blocks = [{_type: 'heroBanner'}, {_type: 'timeline'}]
    const result = validateBlockTemplateCompatibility(blocks, 'twoColumn')
    expect(result).not.toBe(true)
    const warning = result as {message: string; level: string}
    expect(warning.message).toContain('heroBanner')
    expect(warning.message).toContain('timeline')
    expect(warning.level).toBe('warning')
  })

  test('[P0] 2.0-INT-058 — returns true for compatible blocks in sidebar', () => {
    const blocks = [{_type: 'richText'}, {_type: 'faqSection'}, {_type: 'contactForm'}]
    expect(validateBlockTemplateCompatibility(blocks, 'sidebar')).toBe(true)
  })
})

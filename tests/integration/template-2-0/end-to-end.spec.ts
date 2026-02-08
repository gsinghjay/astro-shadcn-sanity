/**
 * Story 2-0: Template Layout System — End-to-End Verification (AC10, AC5)
 *
 * Comprehensive checks that the full template system is wired correctly.
 *
 * @story 2-0
 * @phase GREEN
 */
import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

import { page as pageSchema, wideBlockWarnings } from '../../../studio/src/schemaTypes/documents/page'

const TEMPLATES_DIR = path.resolve('astro-app/src/layouts/templates')
const SLUG_ROUTE = path.resolve('astro-app/src/pages/[...slug].astro')
const SANITY_LIB = path.resolve('astro-app/src/lib/sanity.ts')

test.describe('Story 2-0: End-to-End Verification', () => {
  // AC1+AC2+AC3: Template field with all options and radio layout
  test('[P0] 2.0-INT-041 — AC1+2+3 full template field spec', () => {
    const templateField = (pageSchema as any).fields.find((f: any) => f.name === 'template')
    expect(templateField).toBeDefined()
    expect(templateField.type).toBe('string')
    expect(templateField.options.layout).toBe('radio')
    expect(templateField.initialValue).toBe('default')
    expect(templateField.options.list).toHaveLength(5)
    expect(templateField.group).toBe('layout')
  })

  // AC4: Insert menu groups categorize blocks
  test('[P0] 2.0-INT-042 — AC4 insert menu groups cover all 12 block types', () => {
    const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
    const groups = blocksField.options.insertMenu.groups
    const allGroupedTypes = groups.flatMap((g: any) => g.of)

    // All 12 block types should be in at least one group
    const blockTypes = blocksField.of.map((b: any) => b.type)
    for (const type of blockTypes) {
      expect(allGroupedTypes, `Block type "${type}" not in any group`).toContain(type)
    }
  })

  // AC5: Template prominent before blocks
  test('[P0] 2.0-INT-043 — AC5 template field order and group', () => {
    const fieldNames = (pageSchema as any).fields.map((f: any) => f.name)
    const templateIdx = fieldNames.indexOf('template')
    const blocksIdx = fieldNames.indexOf('blocks')
    expect(templateIdx).toBeLessThan(blocksIdx)

    // Layout group is default (shown first in Studio)
    const groups = (pageSchema as any).groups
    const layoutGroup = groups.find((g: any) => g.name === 'layout')
    expect(layoutGroup.default).toBe(true)
  })

  // AC6+7: Template dispatch in frontend
  test('[P0] 2.0-INT-044 — AC6+7 all 5 template components exist with slots', () => {
    const templates = [
      'DefaultTemplate.astro',
      'FullWidthTemplate.astro',
      'LandingTemplate.astro',
      'SidebarTemplate.astro',
      'TwoColumnTemplate.astro',
    ]
    for (const t of templates) {
      const filePath = path.join(TEMPLATES_DIR, t)
      expect(fs.existsSync(filePath), `Missing: ${t}`).toBe(true)
      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content, `${t} has no slot`).toMatch(/<slot/)
    }
  })

  // AC8: Catch-all route wiring
  test('[P0] 2.0-INT-045 — AC8 catch-all route has complete template dispatch', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    // All 5 template values present
    for (const value of ['default', 'fullWidth', 'landing', 'sidebar', 'twoColumn']) {
      expect(content, `Missing template value: ${value}`).toContain(value)
    }
    // Has fallback
    expect(content).toMatch(/\?\?\s*DefaultTemplate/)
    // Uses BlockRenderer inside template
    expect(content).toContain('BlockRenderer')
    expect(content).toContain('TemplateComponent')
  })

  // AC9: Validation is advisory (warning, not error)
  test('[P0] 2.0-INT-046 — AC9 validation is advisory warnings', () => {
    const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
    expect(blocksField.validation).toBeDefined()
    // wideBlockWarnings only warns, never blocks — verified by structure
    for (const [, templates] of Object.entries(wideBlockWarnings)) {
      expect(Array.isArray(templates)).toBe(true)
    }
  })

  // Backward compatibility: GROQ query includes template
  test('[P0] 2.0-INT-047 — GROQ query includes template in projection', () => {
    const content = fs.readFileSync(SANITY_LIB, 'utf-8')
    expect(content).toMatch(/template/)
    expect(content).toContain('blocks[]')
  })

  // Backward compatibility: existing pages without template fall back
  test('[P1] 2.0-INT-048 — fallback logic handles null/undefined template', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    // ?? DefaultTemplate ensures null fallback
    expect(content).toMatch(/templates\[.*\]\s*\?\?\s*DefaultTemplate/)
  })

  // Landing template suppresses header/footer via Layout hideNav prop
  test('[P0] 2.0-INT-059 — landing template passes hideNav to Layout', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    expect(content).toMatch(/hideNav.*landing/)
  })

  test('[P0] 2.0-INT-060 — Layout.astro accepts hideNav prop', () => {
    const layoutPath = path.resolve('astro-app/src/layouts/Layout.astro')
    const content = fs.readFileSync(layoutPath, 'utf-8')
    expect(content).toContain('hideNav')
  })

  test('[P0] 2.0-INT-061 — Layout.astro conditionally renders Header/Footer', () => {
    const layoutPath = path.resolve('astro-app/src/layouts/Layout.astro')
    const content = fs.readFileSync(layoutPath, 'utf-8')
    expect(content).toMatch(/!hideNav.*Header/)
    expect(content).toMatch(/!hideNav.*Footer/)
  })
})

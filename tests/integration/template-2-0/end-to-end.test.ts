/**
 * Story 2-0: Template Layout System — End-to-End Verification
 *
 * Verifies the simplified full-width-only template system is wired correctly.
 *
 * @story 2-0
 */
import { describe, test, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { page as pageSchema } from '../../../studio/src/schemaTypes/documents/page'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASTRO_APP = path.resolve(__dirname, '../../../astro-app')
const TEMPLATES_DIR = path.join(ASTRO_APP, 'src/layouts/templates')
const SLUG_ROUTE = path.join(ASTRO_APP, 'src/pages/[...slug].astro')
const LAYOUT_FILE = path.join(ASTRO_APP, 'src/layouts/Layout.astro')

describe('Story 2-0: End-to-End Verification', () => {
  test('page schema has no template field', () => {
    const fieldNames = (pageSchema as any).fields.map((f: any) => f.name)
    expect(fieldNames).not.toContain('template')
  })

  test('insert menu groups cover all block types', () => {
    const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
    const groups = blocksField.options.insertMenu.groups
    const allGroupedTypes = groups.flatMap((g: any) => g.of)
    const blockTypes = blocksField.of.map((b: any) => b.type)
    for (const type of blockTypes) {
      expect(allGroupedTypes, `Block type "${type}" not in any group`).toContain(type)
    }
  })

  test('only FullWidthTemplate exists', () => {
    expect(fs.existsSync(path.join(TEMPLATES_DIR, 'FullWidthTemplate.astro'))).toBe(true)
    expect(fs.existsSync(path.join(TEMPLATES_DIR, 'DefaultTemplate.astro'))).toBe(false)
    expect(fs.existsSync(path.join(TEMPLATES_DIR, 'LandingTemplate.astro'))).toBe(false)
    expect(fs.existsSync(path.join(TEMPLATES_DIR, 'SidebarTemplate.astro'))).toBe(false)
    expect(fs.existsSync(path.join(TEMPLATES_DIR, 'TwoColumnTemplate.astro'))).toBe(false)
  })

  test('FullWidthTemplate has slot and uses w-full', () => {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, 'FullWidthTemplate.astro'), 'utf-8')
    expect(content).toMatch(/<slot/)
    expect(content).toContain('w-full')
  })

  test('catch-all route uses FullWidthTemplate directly', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    expect(content).toContain('FullWidthTemplate')
    expect(content).not.toMatch(/const templates\s*=/)
    expect(content).toContain('BlockRenderer')
  })

  test('Layout.astro does not accept hideNav prop', () => {
    const content = fs.readFileSync(LAYOUT_FILE, 'utf-8')
    expect(content).not.toContain('hideNav')
  })

  test('Layout.astro always renders Header and Footer', () => {
    const content = fs.readFileSync(LAYOUT_FILE, 'utf-8')
    expect(content).toContain('<Header />')
    expect(content).toContain('<Footer />')
    expect(content).not.toMatch(/\{!hideNav/)
  })
})

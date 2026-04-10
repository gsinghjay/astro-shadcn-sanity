/**
 * Story 2-0: Template Layout System — Template Shell Component
 *
 * Verifies only FullWidthTemplate exists after template simplification.
 *
 * @story 2-0
 */
import { describe, test, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const TEMPLATES_DIR = path.resolve(__dirname, '../../../astro-app/src/layouts/templates')

describe('Story 2-0: Template Shell Components', () => {
  test('FullWidthTemplate.astro exists', () => {
    expect(fs.existsSync(path.join(TEMPLATES_DIR, 'FullWidthTemplate.astro'))).toBe(true)
  })

  test('FullWidthTemplate contains a <slot /> element', () => {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, 'FullWidthTemplate.astro'), 'utf-8')
    expect(content).toMatch(/<slot\s*\/?>/)
  })

  test('FullWidthTemplate uses full width', () => {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, 'FullWidthTemplate.astro'), 'utf-8')
    expect(content).toContain('w-full')
  })

  test('removed templates no longer exist', () => {
    const removed = ['DefaultTemplate.astro', 'LandingTemplate.astro', 'SidebarTemplate.astro', 'TwoColumnTemplate.astro']
    for (const file of removed) {
      expect(fs.existsSync(path.join(TEMPLATES_DIR, file)), `${file} should be deleted`).toBe(false)
    }
  })
})

/**
 * Story 2-0: Template Layout System — Template Shell Components (AC7)
 *
 * Tests that all 5 template shell components exist and contain a <slot />.
 *
 * @story 2-0
 * @phase GREEN
 */
import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const TEMPLATES_DIR = path.resolve('astro-app/src/layouts/templates')

const TEMPLATE_FILES = [
  'DefaultTemplate.astro',
  'FullWidthTemplate.astro',
  'LandingTemplate.astro',
  'SidebarTemplate.astro',
  'TwoColumnTemplate.astro',
]

test.describe('Story 2-0: Template Shell Components (AC7)', () => {
  test('[P0] 2.0-INT-018 — all 5 template files exist', () => {
    for (const file of TEMPLATE_FILES) {
      const filePath = path.join(TEMPLATES_DIR, file)
      expect(fs.existsSync(filePath), `Missing: ${file}`).toBe(true)
    }
  })

  test('[P0] 2.0-INT-019 — each template contains a <slot /> element', () => {
    for (const file of TEMPLATE_FILES) {
      const filePath = path.join(TEMPLATES_DIR, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      expect(content, `${file} missing <slot`).toMatch(/<slot\s*\/?>/)
    }
  })

  test('[P0] 2.0-INT-020 — DefaultTemplate uses max-width container', () => {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, 'DefaultTemplate.astro'), 'utf-8')
    expect(content).toContain('max-w-')
  })

  test('[P0] 2.0-INT-021 — FullWidthTemplate uses full width', () => {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, 'FullWidthTemplate.astro'), 'utf-8')
    expect(content).toContain('w-full')
  })

  test('[P0] 2.0-INT-022 — SidebarTemplate uses grid with sidebar column', () => {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, 'SidebarTemplate.astro'), 'utf-8')
    expect(content).toContain('grid')
    expect(content).toMatch(/<aside/)
  })

  test('[P0] 2.0-INT-023 — TwoColumnTemplate uses two-column grid', () => {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, 'TwoColumnTemplate.astro'), 'utf-8')
    expect(content).toContain('grid-cols-2')
  })

  test('[P1] 2.0-INT-024 — LandingTemplate has data-template attribute', () => {
    const content = fs.readFileSync(path.join(TEMPLATES_DIR, 'LandingTemplate.astro'), 'utf-8')
    expect(content).toContain('data-template="landing"')
  })
})

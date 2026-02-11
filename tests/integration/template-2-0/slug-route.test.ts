/**
 * Story 2-0: Template Layout System — Catch-all Route & GROQ (AC6, AC8)
 *
 * Tests the [...slug].astro file structure and GROQ query exports.
 *
 * @story 2-0
 * @phase GREEN
 */
import { describe, test, expect, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASTRO_APP = path.resolve(__dirname, '../../../astro-app')
const SLUG_ROUTE = path.join(ASTRO_APP, 'src/pages/[...slug].astro')
const SANITY_LIB = path.join(ASTRO_APP, 'src/lib/sanity.ts')

describe('Story 2-0: Catch-all Route & GROQ Integration (AC6, AC8)', () => {
  test('[P0] 2.0-INT-025 — [...slug].astro exists', () => {
    expect(fs.existsSync(SLUG_ROUTE)).toBe(true)
  })

  test('[P0] 2.0-INT-026 — [...slug].astro imports all 5 template components', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    expect(content).toContain('DefaultTemplate')
    expect(content).toContain('FullWidthTemplate')
    expect(content).toContain('LandingTemplate')
    expect(content).toContain('SidebarTemplate')
    expect(content).toContain('TwoColumnTemplate')
  })

  test('[P0] 2.0-INT-027 — [...slug].astro has template dispatch map', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    expect(content).toMatch(/templates\s*[=:]/)
    expect(content).toContain('default')
    expect(content).toContain('fullWidth')
    expect(content).toContain('landing')
    expect(content).toContain('sidebar')
    expect(content).toContain('twoColumn')
  })

  test('[P0] 2.0-INT-028 — [...slug].astro falls back to DefaultTemplate', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    expect(content).toMatch(/\?\?\s*DefaultTemplate/)
  })

  test('[P0] 2.0-INT-029 — [...slug].astro uses BlockRenderer', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    expect(content).toContain('BlockRenderer')
  })

  test('[P0] 2.0-INT-030 — [...slug].astro imports from sanity.ts', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    expect(content).toContain('sanityClient')
    expect(content).toContain('ALL_PAGE_SLUGS_QUERY')
  })

  test('[P0] 2.0-INT-031 — sanity.ts exports PAGE_BY_SLUG_QUERY with template field', () => {
    const content = fs.readFileSync(SANITY_LIB, 'utf-8')
    expect(content).toContain('PAGE_BY_SLUG_QUERY')
    expect(content).toContain('template')
  })

  test('[P0] 2.0-INT-032 — sanity.ts exports ALL_PAGE_SLUGS_QUERY', () => {
    const content = fs.readFileSync(SANITY_LIB, 'utf-8')
    expect(content).toContain('ALL_PAGE_SLUGS_QUERY')
  })

  test('[P0] 2.0-INT-033 — [...slug].astro has getStaticPaths export', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    expect(content).toContain('getStaticPaths')
  })
})

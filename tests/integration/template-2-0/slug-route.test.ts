/**
 * Story 2-0: Template Layout System — Catch-all Route & GROQ
 *
 * Verifies [...slug].astro uses FullWidthTemplate directly and GROQ query
 * no longer projects the template field.
 *
 * @story 2-0
 */
import { describe, test, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASTRO_APP = path.resolve(__dirname, '../../../astro-app')
const SLUG_ROUTE = path.join(ASTRO_APP, 'src/pages/[...slug].astro')
const SANITY_LIB = path.join(ASTRO_APP, 'src/lib/sanity.ts')

describe('Story 2-0: Catch-all Route', () => {
  test('[...slug].astro exists', () => {
    expect(fs.existsSync(SLUG_ROUTE)).toBe(true)
  })

  test('[...slug].astro imports FullWidthTemplate', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    expect(content).toContain('FullWidthTemplate')
  })

  test('[...slug].astro does not import removed templates', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    expect(content).not.toContain('DefaultTemplate')
    expect(content).not.toContain('LandingTemplate')
    expect(content).not.toContain('SidebarTemplate')
    expect(content).not.toContain('TwoColumnTemplate')
  })

  test('[...slug].astro does not have a template dispatch map', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    expect(content).not.toMatch(/const templates\s*=/)
  })

  test('[...slug].astro uses BlockRenderer', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    expect(content).toContain('BlockRenderer')
  })

  test('[...slug].astro has getStaticPaths export', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    expect(content).toContain('getStaticPaths')
  })
})

describe('Story 2-0: GROQ Integration', () => {
  test('sanity.ts exports PAGE_BY_SLUG_QUERY', () => {
    const content = fs.readFileSync(SANITY_LIB, 'utf-8')
    expect(content).toContain('PAGE_BY_SLUG_QUERY')
  })

  test('sanity.ts exports ALL_PAGE_SLUGS_QUERY', () => {
    const content = fs.readFileSync(SANITY_LIB, 'utf-8')
    expect(content).toContain('ALL_PAGE_SLUGS_QUERY')
  })

  test('PAGE_BY_SLUG_QUERY includes blocks', () => {
    const content = fs.readFileSync(SANITY_LIB, 'utf-8')
    expect(content).toContain('blocks[]')
  })
})

/**
 * Story 2-0: Template Layout System — Catch-all Route & GROQ (AC6, AC8)
 *
 * Tests the [...slug].astro file structure and GROQ query exports.
 *
 * @story 2-0
 * @phase GREEN
 */
import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const SLUG_ROUTE = path.resolve('astro-app/src/pages/[...slug].astro')
const SANITY_LIB = path.resolve('astro-app/src/lib/sanity.ts')

test.describe('Story 2-0: Catch-all Route & GROQ Integration (AC6, AC8)', () => {
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
    expect(content).toContain('pageBySlugQuery')
  })

  test('[P0] 2.0-INT-031 — sanity.ts exports pageBySlugQuery with template field', () => {
    const content = fs.readFileSync(SANITY_LIB, 'utf-8')
    expect(content).toContain('pageBySlugQuery')
    expect(content).toContain('template')
  })

  test('[P0] 2.0-INT-032 — sanity.ts exports allPageSlugsQuery', () => {
    const content = fs.readFileSync(SANITY_LIB, 'utf-8')
    expect(content).toContain('allPageSlugsQuery')
  })

  test('[P0] 2.0-INT-033 — [...slug].astro has getStaticPaths export', () => {
    const content = fs.readFileSync(SLUG_ROUTE, 'utf-8')
    expect(content).toContain('getStaticPaths')
  })
})

/**
 * Story 21.0: Singleton Listing Page Documents — Route Update Tests
 *
 * Tests that all 4 listing pages import getListingPage, use BlockRenderer,
 * and apply graceful fallback patterns.
 *
 * @story 21-0
 * @phase GREEN
 */
import {describe, test, expect} from 'vitest'
import * as fs from 'node:fs'
import * as path from 'node:path'

const pagesDir = path.resolve(__dirname, '../../../astro-app/src/pages')

const routes = [
  {route: 'articles', file: 'articles/index.astro', defaultTitle: 'Articles'},
  {route: 'authors', file: 'authors/index.astro', defaultTitle: 'Authors'},
  {route: 'events', file: 'events/index.astro', defaultTitle: 'Events'},
  {route: 'projects', file: 'projects/index.astro', defaultTitle: 'Projects'},
  {route: 'sponsors', file: 'sponsors/index.astro', defaultTitle: 'Sponsors'},
] as const

describe('Story 21.0: Route Updates', () => {
  for (const {route, file, defaultTitle} of routes) {
    describe(`${route} listing page`, () => {
      const content = fs.readFileSync(path.join(pagesDir, file), 'utf-8')

      test('imports getListingPage from sanity lib', () => {
        expect(content).toMatch(/getListingPage/)
      })

      test('imports BlockRenderer', () => {
        expect(content).toMatch(/import BlockRenderer from/)
      })

      test(`calls getListingPage('${route}')`, () => {
        expect(content).toContain(`getListingPage('${route}')`)
      })

      test('uses ?? fallback for title', () => {
        expect(content).toMatch(/listingPage\?\.title \?\?/)
      })

      test('uses ?? fallback for seo', () => {
        expect(content).toMatch(/listingPage\?\.seo \?\?/)
      })

      test('conditionally renders headerBlocks with BlockRenderer', () => {
        expect(content).toMatch(/listingPage\?\.headerBlocks && listingPage\.headerBlocks\.length > 0/)
      })

      test('conditionally renders footerBlocks with BlockRenderer', () => {
        expect(content).toMatch(/listingPage\?\.footerBlocks && listingPage\.footerBlocks\.length > 0/)
      })

      test('passes pageDescription to header component or renders conditionally', () => {
        expect(content).toMatch(/pageDescription/)
      })

      test(`has hard-coded default title '${defaultTitle}'`, () => {
        expect(content).toContain(`'${defaultTitle}'`)
      })
    })
  }

  test('sponsors page adds breadcrumb', () => {
    const content = fs.readFileSync(path.join(pagesDir, 'sponsors/index.astro'), 'utf-8')
    expect(content).toMatch(/import Breadcrumb from/)
    expect(content).toMatch(/<Breadcrumb/)
  })
})

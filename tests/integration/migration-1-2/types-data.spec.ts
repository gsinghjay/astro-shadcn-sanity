/**
 * Story 1-2: Migrate Reference Project — Types & Data Files (AC7-8)
 *
 * Validates type definitions and static data files.
 *
 * @story 1-2
 */
import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { BLOCK_TYPES, BLOCK_TYPE_INTERFACES } from '../../support/constants'

// Import pure TS modules (astro-app has "type": "module")
import type { PageBlock } from '../../../astro-app/src/lib/types'
import { homePage } from '../../../astro-app/src/lib/data/home-page'
import { aboutPage } from '../../../astro-app/src/lib/data/about-page'
import { projectsPage } from '../../../astro-app/src/lib/data/projects-page'
import { sponsorsPage } from '../../../astro-app/src/lib/data/sponsors-page'
import { contactPage } from '../../../astro-app/src/lib/data/contact-page'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASTRO_APP = path.resolve(__dirname, '../../../astro-app')

test.describe('Story 1-2: Migrate Reference Project', () => {
  // ---------------------------------------------------------------------------
  // AC7: Types
  // ---------------------------------------------------------------------------
  test.describe('AC7: Types', () => {
    test('[P0] 1.2-INT-004 — types.ts exports PageBlock union with all 12 block type interfaces', async () => {
      const typesPath = path.join(ASTRO_APP, 'src/lib/types.ts')
      expect(fs.existsSync(typesPath), 'types.ts missing').toBe(true)

      const content = fs.readFileSync(typesPath, 'utf-8')

      for (const iface of BLOCK_TYPE_INTERFACES) {
        expect(
          content.includes(iface),
          `types.ts missing block type interface: ${iface}`,
        ).toBe(true)
      }

      expect(content, 'types.ts missing PageBlock union').toContain('PageBlock')
    })

    test('[P0] 1.2-INT-005 — Each block type interface has correct _type literal', async () => {
      const typesPath = path.join(ASTRO_APP, 'src/lib/types.ts')
      const content = fs.readFileSync(typesPath, 'utf-8')

      // Build mapping from BLOCK_TYPE_INTERFACES + BLOCK_TYPES (same order)
      for (let i = 0; i < BLOCK_TYPE_INTERFACES.length; i++) {
        const iface = BLOCK_TYPE_INTERFACES[i]
        const typeVal = BLOCK_TYPES[i]
        const pattern = new RegExp(
          `interface\\s+${iface}[\\s\\S]*?_type:\\s*['"]${typeVal}['"]`,
        )
        expect(
          pattern.test(content),
          `${iface} missing _type: '${typeVal}'`,
        ).toBe(true)
      }
    })

    test('[P0] 1.2-INT-006 — Data files use valid architecture _type values', async () => {
      const allPages = [homePage, aboutPage, projectsPage, sponsorsPage, contactPage]
      const allowedTypes = new Set<string>(BLOCK_TYPES)
      const foundTypes = new Set<string>()

      for (const page of allPages) {
        expect(page.blocks.length, `${page.title} has no blocks`).toBeGreaterThan(0)

        for (const block of page.blocks) {
          foundTypes.add(block._type)
          expect(
            allowedTypes.has(block._type),
            `Invalid _type "${block._type}" in page "${page.title}"`,
          ).toBe(true)
        }
      }

      expect(foundTypes.size, 'Data files should use multiple block types').toBeGreaterThan(1)
    })
  })

  // ---------------------------------------------------------------------------
  // AC8: Data Files
  // ---------------------------------------------------------------------------
  test.describe('AC8: Data Files', () => {
    test('[P1] 1.2-INT-008 — All 6 data files exist and export from data/index.ts', async () => {
      const dataDir = path.join(ASTRO_APP, 'src/lib/data')
      const expectedFiles = [
        'site-settings.ts',
        'home-page.ts',
        'about-page.ts',
        'projects-page.ts',
        'sponsors-page.ts',
        'contact-page.ts',
      ]

      for (const file of expectedFiles) {
        const filePath = path.join(dataDir, file)
        expect(
          fs.existsSync(filePath),
          `Missing data file: ${file}`,
        ).toBe(true)
      }

      const indexPath = path.join(dataDir, 'index.ts')
      expect(fs.existsSync(indexPath), 'data/index.ts missing').toBe(true)

      const indexContent = fs.readFileSync(indexPath, 'utf-8')
      const expectedExports = [
        'site-settings',
        'home-page',
        'about-page',
        'projects-page',
        'sponsors-page',
        'contact-page',
      ]

      for (const exp of expectedExports) {
        expect(
          indexContent.includes(exp),
          `data/index.ts missing re-export for: ${exp}`,
        ).toBe(true)
      }
    })

    test('[P1] 1.2-INT-009 — Each data page has a non-empty blocks array', async () => {
      const pages = [
        { name: 'homePage', data: homePage },
        { name: 'aboutPage', data: aboutPage },
        { name: 'projectsPage', data: projectsPage },
        { name: 'sponsorsPage', data: sponsorsPage },
        { name: 'contactPage', data: contactPage },
      ]

      for (const { name, data } of pages) {
        expect(Array.isArray(data.blocks), `${name}.blocks is not an array`).toBe(true)
        expect(data.blocks.length, `${name}.blocks is empty`).toBeGreaterThan(0)
      }
    })
  })
})

/**
 * Story 1-2: Migrate Reference Project — Block Components (AC1)
 *
 * Validates block component files and BlockRenderer mapping.
 *
 * @story 1-2
 */
import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { BLOCK_NAMES, BLOCK_TYPES } from '../../support/constants'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASTRO_APP = path.resolve(__dirname, '../../../astro-app')

test.describe('Story 1-2: Migrate Reference Project', () => {
  // ---------------------------------------------------------------------------
  // AC1: Block Components
  // ---------------------------------------------------------------------------
  test.describe('AC1: Block Components', () => {
    test('[P0] 1.2-INT-001 — All 12 block .astro files exist with PascalCase names', async () => {
      const blocksDir = path.join(ASTRO_APP, 'src/components/blocks')

      for (const name of BLOCK_NAMES) {
        const filePath = path.join(blocksDir, `${name}.astro`)
        expect(
          fs.existsSync(filePath),
          `Missing block component: ${name}.astro`,
        ).toBe(true)
      }
    })

    test('[P0] 1.2-INT-002 — BlockRenderer.astro contains switch cases for all 12 _type values', async () => {
      const rendererPath = path.join(ASTRO_APP, 'src/components/BlockRenderer.astro')
      expect(fs.existsSync(rendererPath), 'BlockRenderer.astro missing').toBe(true)

      const content = fs.readFileSync(rendererPath, 'utf-8')

      for (const type of BLOCK_TYPES) {
        expect(
          content.includes(`'${type}'`) || content.includes(`"${type}"`),
          `BlockRenderer missing switch case for _type: ${type}`,
        ).toBe(true)
      }
    })

    test('[P0] 1.2-INT-003 — BlockRenderer.astro imports all 12 block components', async () => {
      const rendererPath = path.join(ASTRO_APP, 'src/components/BlockRenderer.astro')
      const content = fs.readFileSync(rendererPath, 'utf-8')

      for (const name of BLOCK_NAMES) {
        const importPattern = new RegExp(`import\\s+${name}\\s+from`)
        expect(
          importPattern.test(content),
          `BlockRenderer missing import for: ${name}`,
        ).toBe(true)
      }
    })
  })
})

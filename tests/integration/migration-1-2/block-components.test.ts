/**
 * Story 1-2: Migrate Reference Project — Block Components (AC1)
 *
 * Validates block component files and BlockRenderer mapping.
 *
 * @story 1-2
 */
import { describe, test, expect, beforeAll } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { BLOCK_NAMES, BLOCK_TYPES } from '../../support/constants'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASTRO_APP = path.resolve(__dirname, '../../../astro-app')

describe('Story 1-2: Migrate Reference Project', () => {
  // ---------------------------------------------------------------------------
  // AC1: Block Components
  // ---------------------------------------------------------------------------
  describe('AC1: Block Components', () => {
    test('[P0] 1.2-INT-001 — All 11 block .astro files exist with PascalCase names', () => {
      const blocksDir = path.join(ASTRO_APP, 'src/components/blocks/custom')

      for (const name of BLOCK_NAMES) {
        const filePath = path.join(blocksDir, `${name}.astro`)
        expect(
          fs.existsSync(filePath),
          `Missing block component: ${name}.astro`,
        ).toBe(true)
      }
    })

    test('[P0] 1.2-INT-002 — BlockRenderer.astro uses block-registry for dynamic block discovery', () => {
      const rendererPath = path.join(ASTRO_APP, 'src/components/BlockRenderer.astro')
      expect(fs.existsSync(rendererPath), 'BlockRenderer.astro missing').toBe(true)

      const content = fs.readFileSync(rendererPath, 'utf-8')

      // BlockRenderer imports from block-registry (which uses import.meta.glob)
      expect(
        content.includes('block-registry'),
        'BlockRenderer must import from block-registry',
      ).toBe(true)
    })

    test('[P0] 1.2-INT-003 — block-registry.ts auto-discovers custom blocks from blocks/custom/', () => {
      const registryPath = path.join(ASTRO_APP, 'src/components/block-registry.ts')
      expect(fs.existsSync(registryPath), 'block-registry.ts missing').toBe(true)

      const content = fs.readFileSync(registryPath, 'utf-8')

      // Registry uses import.meta.glob to auto-discover blocks
      expect(
        content.includes("import.meta.glob('./blocks/custom/*.astro'"),
        'block-registry must glob blocks/custom/*.astro',
      ).toBe(true)

      // Registry converts PascalCase filenames to camelCase type names
      expect(
        content.includes('filename[0].toLowerCase()'),
        'block-registry must convert PascalCase to camelCase',
      ).toBe(true)
    })
  })
})

/**
 * Story 1-2: Migrate Reference Project — Types (AC7)
 *
 * Validates type definitions derived from TypeGen.
 * Data files (AC8) removed — pages now fetch from Sanity CMS.
 *
 * @story 1-2
 */
import { describe, test, expect } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { BLOCK_TYPES, BLOCK_TYPE_INTERFACES } from '../../support/constants'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ASTRO_APP = path.resolve(__dirname, '../../../astro-app')

describe('Story 1-2: Migrate Reference Project', () => {
  // ---------------------------------------------------------------------------
  // AC7: Types
  // ---------------------------------------------------------------------------
  describe('AC7: Types', () => {
    test('[P0] 1.2-INT-004 — types.ts exports PageBlock union and all block type aliases', () => {
      const typesPath = path.join(ASTRO_APP, 'src/lib/types.ts')
      expect(fs.existsSync(typesPath), 'types.ts missing').toBe(true)

      const content = fs.readFileSync(typesPath, 'utf-8')

      for (const iface of BLOCK_TYPE_INTERFACES) {
        expect(
          content.includes(iface),
          `types.ts missing block type: ${iface}`,
        ).toBe(true)
      }

      expect(content, 'types.ts missing PageBlock union').toContain('PageBlock')
    })

    test('[P0] 1.2-INT-005 — Each block type uses Extract<PageBlock> with correct _type literal', () => {
      const typesPath = path.join(ASTRO_APP, 'src/lib/types.ts')
      const content = fs.readFileSync(typesPath, 'utf-8')

      // Block types use Extract<PageBlock, { _type: 'typeName' }> pattern
      for (let i = 0; i < BLOCK_TYPE_INTERFACES.length; i++) {
        const iface = BLOCK_TYPE_INTERFACES[i]
        const typeVal = BLOCK_TYPES[i]
        const pattern = new RegExp(
          `export\\s+type\\s+${iface}\\s*=\\s*Extract<PageBlock,\\s*\\{\\s*_type:\\s*'${typeVal}'\\s*\\}>`,
        )
        expect(
          pattern.test(content),
          `${iface} missing Extract<PageBlock, { _type: '${typeVal}' }>`,
        ).toBe(true)
      }
    })
  })
})

/**
 * Story 1-3: Schema Infrastructure — Registration & Build (AC8-10)
 *
 * Tests schema registration array and studio build verification.
 * Uses static imports so Playwright's TS transformer can resolve them.
 *
 * @story 1-3
 * @phase GREEN
 */
import { describe, test, expect, beforeAll } from 'vitest'
import { execSync } from 'child_process'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { BUILD_TIMEOUT_MS } from '../../support/constants'

// Schema imports — static so Playwright transforms them
import { schemaTypes } from '../../../studio/src/schemaTypes/index'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const STUDIO_ROOT = path.resolve(__dirname, '../../../studio')

describe('Story 1-3: Schema Infrastructure (ATDD)', () => {
  // ---------------------------------------------------------------------------
  // AC8: Schema Registration
  // ---------------------------------------------------------------------------
  describe('AC8: Schema Registration', () => {
    test('[P0] 1.3-INT-030 — schemaTypes array contains all registered schemas', () => {
      const typeNames = schemaTypes.map((s: any) => s.name)

      // Object schemas
      expect(typeNames).toContain('seo')
      expect(typeNames).toContain('button')
      expect(typeNames).toContain('portableText')

      // Document schemas
      expect(typeNames).toContain('page')
      expect(typeNames).toContain('siteSettings')

      // At minimum 5 schemas registered (objects + documents, no blocks yet)
      expect(schemaTypes.length).toBeGreaterThanOrEqual(5)
    })

    test('[P0] 1.3-INT-031 — blockBaseFields is NOT registered as a standalone schema', () => {
      const typeNames = schemaTypes.map((s: any) => s.name)
      expect(typeNames).not.toContain('blockBase')
      expect(typeNames).not.toContain('block-base')
    })
  })

  // ---------------------------------------------------------------------------
  // AC9: Schema Quality (defineType/defineField usage)
  // ---------------------------------------------------------------------------
  describe('AC9: Schema Quality', () => {
    test('[P1] 1.3-INT-032 — all schemas have a name property', () => {
      for (const schema of schemaTypes) {
        expect(schema, `Schema missing name`).toHaveProperty('name')
        expect(typeof (schema as any).name).toBe('string')
        expect((schema as any).name.length).toBeGreaterThan(0)
      }
    })

    test('[P1] 1.3-INT-033 — all schemas have typed fields', () => {
      for (const schema of schemaTypes) {
        const s = schema as any
        if (s.fields) {
          for (const field of s.fields) {
            expect(field, `Field in ${s.name} missing name`).toHaveProperty('name')
            expect(field, `Field ${field.name} in ${s.name} missing type`).toHaveProperty('type')
          }
        }
      }
    })
  })

  // ---------------------------------------------------------------------------
  // AC10: Studio Build Verification
  // ---------------------------------------------------------------------------
  describe('AC10: Studio Build Verification', () => {
    test('[P0] 1.3-INT-034 — studio builds without schema errors', () => {
      const result = execSync('npm run build', {
        cwd: STUDIO_ROOT,
        encoding: 'utf-8',
        timeout: BUILD_TIMEOUT_MS,
        env: {
          ...process.env,
          SANITY_STUDIO_PROJECT_ID:
            process.env.SANITY_STUDIO_PROJECT_ID || 'placeholder',
          SANITY_STUDIO_DATASET:
            process.env.SANITY_STUDIO_DATASET || 'production',
        },
      })

      expect(result).toBeDefined()
    }, BUILD_TIMEOUT_MS)
  })
})

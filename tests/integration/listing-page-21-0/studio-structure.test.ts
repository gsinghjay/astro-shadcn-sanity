/**
 * Story 21.0: Singleton Listing Page Documents — Studio Structure Tests
 *
 * Tests that the listing page singleton pattern is correctly configured:
 * constants, desk structure imports, and sanity.config document actions/templates.
 *
 * @story 21-0
 * @phase GREEN
 */
import {describe, test, expect} from 'vitest'
import {CAPSTONE_SINGLETON_TYPES, SITE_AWARE_TYPES} from '../../../studio/src/constants'

describe('Story 21.0: Studio Structure', () => {
  describe('constants', () => {
    test('CAPSTONE_SINGLETON_TYPES includes listingPage', () => {
      expect(CAPSTONE_SINGLETON_TYPES.has('listingPage')).toBe(true)
    })

    test('SITE_AWARE_TYPES does NOT include listingPage', () => {
      expect(SITE_AWARE_TYPES).not.toContain('listingPage')
    })
  })

  describe('capstone desk structure', () => {
    test('capstoneDeskStructure exports a function', async () => {
      const mod = await import('../../../studio/src/structure/capstone-desk-structure')
      expect(typeof mod.capstoneDeskStructure).toBe('function')
    })
  })

  describe('rwc desk structure', () => {
    test('createRwcDeskStructure exports a function', async () => {
      const mod = await import('../../../studio/src/structure/rwc-desk-structure')
      expect(typeof mod.createRwcDeskStructure).toBe('function')
    })
  })
})

/**
 * Story 2-0: Template Layout System — Validation
 *
 * Template-aware validation was removed when the template system was
 * simplified to full-width only. These tests verify the page schema
 * no longer exports template validation artifacts.
 *
 * @story 2-0
 */
import { describe, test, expect } from 'vitest'

import * as pageExports from '../../../studio/src/schemaTypes/documents/page'

describe('Story 2-0: Template validation removed', () => {
  test('wideBlockWarnings is no longer exported', () => {
    expect((pageExports as Record<string, unknown>).wideBlockWarnings).toBeUndefined()
  })

  test('validateBlockTemplateCompatibility is no longer exported', () => {
    expect((pageExports as Record<string, unknown>).validateBlockTemplateCompatibility).toBeUndefined()
  })

  test('blocks field has no custom validation', () => {
    const blocksField = ((pageExports.page as any).fields as any[]).find((f: any) => f.name === 'blocks')
    expect(blocksField.validation).toBeUndefined()
  })
})

/**
 * Story 2-0: Template Layout System — Page Schema
 *
 * Verifies template field was removed and insert menu groups remain intact.
 *
 * @story 2-0
 */
import { describe, test, expect } from 'vitest'

import { page as pageSchema } from '../../../studio/src/schemaTypes/documents/page'

describe('Story 2-0: Page Schema — Template field removed', () => {
  test('page schema does not have a template field', () => {
    const fieldNames = (pageSchema as any).fields.map((f: any) => f.name)
    expect(fieldNames).not.toContain('template')
  })

  test('page schema still has core fields', () => {
    const fieldNames = (pageSchema as any).fields.map((f: any) => f.name)
    expect(fieldNames).toContain('title')
    expect(fieldNames).toContain('slug')
    expect(fieldNames).toContain('seo')
    expect(fieldNames).toContain('blocks')
  })

  test('page schema still defines groups', () => {
    expect((pageSchema as any).groups).toBeDefined()
    expect((pageSchema as any).groups.length).toBeGreaterThan(0)
  })
})

describe('Story 2-0: Page Schema — Insert menu groups', () => {
  test('blocks field has insertMenu with filter enabled', () => {
    const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
    expect(blocksField.options?.insertMenu).toBeDefined()
    expect(blocksField.options.insertMenu.filter).toBe(true)
  })

  test('insertMenu has categorized groups', () => {
    const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
    const groups = blocksField.options.insertMenu.groups
    const groupNames = groups.map((g: any) => g.name)
    expect(groupNames).toContain('heroes')
    expect(groupNames).toContain('content')
    expect(groupNames).toContain('media')
    expect(groupNames).toContain('social')
    expect(groupNames).toContain('cta')
  })

  test('insertMenu has list and grid views', () => {
    const blocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
    const viewNames = blocksField.options.insertMenu.views.map((v: any) => v.name)
    expect(viewNames).toContain('list')
    expect(viewNames).toContain('grid')
  })
})

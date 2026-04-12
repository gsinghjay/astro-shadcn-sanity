/**
 * Story 21.0: Singleton Listing Page Documents — Schema Tests
 *
 * Tests the listingPage document schema structure, validation rules,
 * field definitions, and preview configuration.
 *
 * @story 21-0
 * @phase GREEN
 */
import {describe, test, expect} from 'vitest'

import {listingPage} from '../../../studio/src/schemaTypes/documents/listing-page'
import {page as pageSchema} from '../../../studio/src/schemaTypes/documents/page'
import {schemaTypes} from '../../../studio/src/schemaTypes/index'

// Mock Sanity Rule for validation testing
class MockRule {
  private _chain: string[] = []
  required() { this._chain.push('required'); return this }
  max(n: number) { this._chain.push(`max(${n})`); return this }
  get chain() { return this._chain }
}

function getValidationChain(field: any): string[] {
  if (!field.validation) return []
  const rule = new MockRule()
  field.validation(rule)
  return rule.chain
}

describe('Story 21.0: Listing Page Schema', () => {
  const fields = (listingPage as any).fields as any[]
  const fieldNames = fields.map((f: any) => f.name)

  test('schema has correct name, type, and icon', () => {
    expect(listingPage.name).toBe('listingPage')
    expect(listingPage.type).toBe('document')
    expect(listingPage.icon).toBeDefined()
  })

  test('schema is registered in schemaTypes index', () => {
    const names = schemaTypes.map((s: any) => s.name)
    expect(names).toContain('listingPage')
  })

  test('schema has all required fields', () => {
    expect(fieldNames).toEqual([
      'route', 'title', 'description', 'seo', 'headerBlocks', 'footerBlocks',
    ])
  })

  describe('route field', () => {
    const routeField = fields.find((f: any) => f.name === 'route')

    test('is a required string with radio layout', () => {
      expect(routeField.type).toBe('string')
      expect(routeField.options.layout).toBe('radio')
      expect(getValidationChain(routeField)).toContain('required')
    })

    test('has 5 route options', () => {
      const values = routeField.options.list.map((o: any) => o.value)
      expect(values).toEqual(['articles', 'authors', 'events', 'projects', 'sponsors'])
    })

    test('is readOnly', () => {
      expect(routeField.readOnly).toBe(true)
    })
  })

  describe('title field', () => {
    const titleField = fields.find((f: any) => f.name === 'title')

    test('is a string with max 150 validation', () => {
      expect(titleField.type).toBe('string')
      expect(getValidationChain(titleField)).toContain('max(150)')
    })
  })

  describe('description field', () => {
    const descField = fields.find((f: any) => f.name === 'description')

    test('is a text with max 500 validation', () => {
      expect(descField.type).toBe('text')
      expect(getValidationChain(descField)).toContain('max(500)')
    })
  })

  describe('seo field', () => {
    const seoField = fields.find((f: any) => f.name === 'seo')

    test('references the seo object type', () => {
      expect(seoField.type).toBe('seo')
    })
  })

  describe('headerBlocks and footerBlocks fields', () => {
    const headerField = fields.find((f: any) => f.name === 'headerBlocks')
    const footerField = fields.find((f: any) => f.name === 'footerBlocks')

    test('are both array types', () => {
      expect(headerField.type).toBe('array')
      expect(footerField.type).toBe('array')
    })

    test('contain the same block types as page.ts blocks field', () => {
      const pageBlocksField = (pageSchema as any).fields.find((f: any) => f.name === 'blocks')
      const pageBlockTypes = pageBlocksField.of.map((b: any) => b.type).sort()
      const headerBlockTypes = headerField.of.map((b: any) => b.type).sort()
      const footerBlockTypes = footerField.of.map((b: any) => b.type).sort()

      expect(headerBlockTypes).toEqual(pageBlockTypes)
      expect(footerBlockTypes).toEqual(pageBlockTypes)
    })

    test('have insertMenu options with filter and groups', () => {
      expect(headerField.options.insertMenu.filter).toBe(true)
      expect(headerField.options.insertMenu.groups.length).toBeGreaterThan(0)
      expect(footerField.options.insertMenu.filter).toBe(true)
      expect(footerField.options.insertMenu.groups.length).toBeGreaterThan(0)
    })
  })

  describe('preview configuration', () => {
    test('selects title and route as subtitle', () => {
      expect(listingPage.preview?.select).toEqual({title: 'title', subtitle: 'route'})
    })

    test('prepare formats route label correctly', () => {
      const prepare = (listingPage.preview as any).prepare
      expect(prepare({title: 'My Articles', subtitle: 'articles'})).toEqual({
        title: 'My Articles',
        subtitle: '/articles — Articles',
      })
    })

    test('prepare handles missing title with route as title', () => {
      const prepare = (listingPage.preview as any).prepare
      const result = prepare({title: '', subtitle: 'events'})
      expect(result.title).toBe('/events — Events')
      expect(result.subtitle).toBe('/events — Events')
    })

    test('prepare handles missing route', () => {
      const prepare = (listingPage.preview as any).prepare
      const result = prepare({title: '', subtitle: undefined})
      expect(result.title).toBe('Unconfigured')
      expect(result.subtitle).toBe('Unconfigured')
    })
  })
})

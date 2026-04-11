import {describe, test, expect} from 'vitest'
import {articleList} from '../blocks/article-list'

interface SchemaField {
  name: string
  type: string
  description?: string
  options?: Record<string, unknown>
  of?: Array<{type: string; to?: Array<{type: string}>}>
  hidden?: (ctx: {parent?: {contentType?: string; variant?: string}}) => boolean
  validation?: (rule: MockRule) => unknown
  [key: string]: unknown
}

/**
 * Minimal Rule proxy for testing custom validators. Captures the validator
 * function passed to `Rule.custom()` so tests can invoke it directly with
 * different inputs and assert on the return value.
 */
interface MockRule {
  custom: (fn: CustomValidator) => MockRule
  min: (n: number) => MockRule
  max: (n: number) => MockRule
  required: () => MockRule
}

type CustomValidator = (
  value: unknown,
  context: {parent?: {contentType?: string}},
) => true | string

function captureCustomValidator(field: SchemaField): CustomValidator {
  let captured: CustomValidator | undefined
  const mockRule: MockRule = {
    custom: (fn) => {
      captured = fn
      return mockRule
    },
    min: () => mockRule,
    max: () => mockRule,
    required: () => mockRule,
  }
  field.validation!(mockRule)
  if (!captured) {
    throw new Error(`No Rule.custom() call captured for field "${field.name}"`)
  }
  return captured
}

function findField(fieldName: string): SchemaField | undefined {
  return ((articleList as unknown as {fields: SchemaField[]}).fields ?? []).find(
    (f) => f.name === fieldName,
  )
}

describe('articleList block schema (Story 19.4)', () => {
  describe('block-level configuration', () => {
    test('block name is "articleList"', () => {
      expect(articleList.name).toBe('articleList')
    })

    test('retains variants: grid, split-featured, list', () => {
      const variantField = findField('variant')
      expect(variantField).toBeDefined()
      const options = (variantField!.options as {list: Array<{value: string}>}).list
      const values = options.map((o) => o.value)
      expect(values).toContain('grid')
      expect(values).toContain('split-featured')
      expect(values).toContain('list')
    })
  })

  describe('contentType field (AC #2)', () => {
    test('contentType field exists and is a string', () => {
      const contentType = findField('contentType')
      expect(contentType).toBeDefined()
      expect(contentType!.type).toBe('string')
    })

    test('contentType options are exactly [all, by-category]', () => {
      const contentType = findField('contentType')
      const list = (contentType!.options as {list: Array<{title: string; value: string}>}).list
      const values = list.map((o) => o.value)
      expect(values).toEqual(['all', 'by-category'])
    })

    test('contentType options use titles "All" and "By Category"', () => {
      const contentType = findField('contentType')
      const list = (contentType!.options as {list: Array<{title: string; value: string}>}).list
      expect(list.find((o) => o.value === 'all')?.title).toBe('All')
      expect(list.find((o) => o.value === 'by-category')?.title).toBe('By Category')
    })

    test('contentType uses radio layout with initialValue "all"', () => {
      const contentType = findField('contentType')
      expect((contentType!.options as {layout: string}).layout).toBe('radio')
      expect(contentType!.initialValue).toBe('all')
    })

    test('contentType does NOT include legacy "blog" or "news" options', () => {
      const contentType = findField('contentType')
      const list = (contentType!.options as {list: Array<{value: string}>}).list
      const values = list.map((o) => o.value)
      expect(values).not.toContain('blog')
      expect(values).not.toContain('news')
    })
  })

  describe('categories field (AC #2)', () => {
    test('categories field exists and is an array', () => {
      const categories = findField('categories')
      expect(categories).toBeDefined()
      expect(categories!.type).toBe('array')
    })

    test('categories array contains references to articleCategory', () => {
      const categories = findField('categories')
      const of = categories!.of!
      expect(of).toHaveLength(1)
      expect(of[0].type).toBe('reference')
      expect(of[0].to).toEqual([{type: 'articleCategory'}])
    })

    test('categories field is hidden when contentType is "all"', () => {
      const categories = findField('categories')
      expect(typeof categories!.hidden).toBe('function')
      expect(categories!.hidden!({parent: {contentType: 'all'}})).toBe(true)
    })

    test('categories field is visible when contentType is "by-category"', () => {
      const categories = findField('categories')
      expect(categories!.hidden!({parent: {contentType: 'by-category'}})).toBe(false)
    })

    test('categories field has editor description', () => {
      const categories = findField('categories')
      expect(categories!.description).toBe('Select one or more categories to filter articles')
    })

    test('categories field is ordered after contentType and before limit', () => {
      const fieldNames = ((articleList as unknown as {fields: SchemaField[]}).fields ?? []).map(
        (f) => f.name,
      )
      const contentTypeIdx = fieldNames.indexOf('contentType')
      const categoriesIdx = fieldNames.indexOf('categories')
      const limitIdx = fieldNames.indexOf('limit')
      expect(contentTypeIdx).toBeGreaterThanOrEqual(0)
      expect(categoriesIdx).toBe(contentTypeIdx + 1)
      expect(limitIdx).toBeGreaterThan(categoriesIdx)
    })
  })

  describe('categories Rule.custom validation', () => {
    test('categories field has a validation function', () => {
      const categories = findField('categories')
      expect(typeof categories!.validation).toBe('function')
    })

    test('returns error string when contentType is "by-category" and categories is empty array', () => {
      const categories = findField('categories')
      const validator = captureCustomValidator(categories!)
      expect(validator([], {parent: {contentType: 'by-category'}})).toBe(
        'Select at least one category when filtering by category',
      )
    })

    test('returns error string when contentType is "by-category" and categories is null', () => {
      const categories = findField('categories')
      const validator = captureCustomValidator(categories!)
      expect(validator(null, {parent: {contentType: 'by-category'}})).toBe(
        'Select at least one category when filtering by category',
      )
    })

    test('returns error string when contentType is "by-category" and categories is undefined', () => {
      const categories = findField('categories')
      const validator = captureCustomValidator(categories!)
      expect(validator(undefined, {parent: {contentType: 'by-category'}})).toBe(
        'Select at least one category when filtering by category',
      )
    })

    test('returns true when contentType is "by-category" and categories has at least one entry', () => {
      const categories = findField('categories')
      const validator = captureCustomValidator(categories!)
      expect(validator([{_ref: 'cat-news'}], {parent: {contentType: 'by-category'}})).toBe(true)
    })

    test('returns true when contentType is "all" regardless of categories', () => {
      const categories = findField('categories')
      const validator = captureCustomValidator(categories!)
      expect(validator([], {parent: {contentType: 'all'}})).toBe(true)
      expect(validator(null, {parent: {contentType: 'all'}})).toBe(true)
      expect(validator([{_ref: 'cat-news'}], {parent: {contentType: 'all'}})).toBe(true)
    })

    test('returns true when parent context is undefined (defensive)', () => {
      const categories = findField('categories')
      const validator = captureCustomValidator(categories!)
      expect(validator([], {})).toBe(true)
    })
  })

  describe('retained fields (AC #3)', () => {
    test('heading field (from headerFields) exists', () => {
      expect(findField('heading')).toBeDefined()
    })

    test('description field (from headerFields) exists', () => {
      expect(findField('description')).toBeDefined()
    })

    test('limit field exists with default 6', () => {
      const limit = findField('limit')
      expect(limit).toBeDefined()
      expect(limit!.type).toBe('number')
      expect(limit!.initialValue).toBe(6)
    })

    test('ctaButtons field exists as array of button', () => {
      const ctaButtons = findField('ctaButtons')
      expect(ctaButtons).toBeDefined()
      expect(ctaButtons!.type).toBe('array')
      expect(ctaButtons!.of![0].type).toBe('button')
    })
  })
})

import {describe, test, expect} from 'vitest'
import {linkCardItem} from '../schemaTypes/objects/link-card-item'

interface SchemaField {
  name: string
  type: string
  title?: string
  description?: string
  validation?: (rule: ValidationRule) => ValidationRule
  [key: string]: unknown
}

interface ValidationRule {
  required: () => ValidationRule
  max: (n: number) => ValidationRule
  uri: (opts: unknown) => ValidationRule
  calls: string[]
}

function createRuleProxy(): ValidationRule {
  const calls: string[] = []
  const proxy: ValidationRule = {
    calls,
    required() {
      calls.push('required')
      return proxy
    },
    max(n: number) {
      calls.push(`max:${n}`)
      return proxy
    },
    uri(_opts: unknown) {
      calls.push('uri')
      return proxy
    },
  }
  return proxy
}

function findField(fieldName: string): SchemaField | undefined {
  return ((linkCardItem as unknown as {fields: SchemaField[]}).fields ?? []).find(
    (f) => f.name === fieldName,
  )
}

function recordValidation(fieldName: string): string[] {
  const field = findField(fieldName)
  if (!field?.validation) return []
  const rule = createRuleProxy()
  field.validation(rule)
  return rule.calls
}

describe('linkCardItem schema (Story 18.9 — editable per-card CTA label)', () => {
  test('schema name is linkCardItem', () => {
    expect(linkCardItem.name).toBe('linkCardItem')
  })

  describe('ctaLabel field', () => {
    test('ctaLabel field exists', () => {
      expect(findField('ctaLabel')).toBeDefined()
    })

    test('ctaLabel is a string', () => {
      expect(findField('ctaLabel')!.type).toBe('string')
    })

    test('ctaLabel has title "CTA Label"', () => {
      expect(findField('ctaLabel')!.title).toBe('CTA Label')
    })

    test('ctaLabel has an editor description that mentions the grid variant', () => {
      const description = findField('ctaLabel')!.description
      expect(typeof description).toBe('string')
      expect(description!.toLowerCase()).toContain('grid')
      expect(description).toContain("'Learn more'")
    })

    test('ctaLabel validation calls Rule.max(50) and is NOT required', () => {
      const calls = recordValidation('ctaLabel')
      expect(calls).toContain('max:50')
      expect(calls).not.toContain('required')
    })

    test('ctaLabel is positioned between description and icon', () => {
      const fieldNames = ((linkCardItem as unknown as {fields: SchemaField[]}).fields ?? []).map(
        (f) => f.name,
      )
      const descriptionIdx = fieldNames.indexOf('description')
      const ctaLabelIdx = fieldNames.indexOf('ctaLabel')
      const iconIdx = fieldNames.indexOf('icon')
      expect(descriptionIdx).toBeGreaterThanOrEqual(0)
      expect(ctaLabelIdx).toBe(descriptionIdx + 1)
      expect(iconIdx).toBe(ctaLabelIdx + 1)
    })
  })

  describe('existing fields are unchanged', () => {
    test('title field still requires a value with max(150)', () => {
      const calls = recordValidation('title')
      expect(calls).toContain('required')
      expect(calls).toContain('max:150')
    })

    test('description field still has max(500)', () => {
      const calls = recordValidation('description')
      expect(calls).toContain('max:500')
    })

    test('url field still requires a value with uri()', () => {
      const calls = recordValidation('url')
      expect(calls).toContain('required')
      expect(calls).toContain('uri')
    })
  })
})

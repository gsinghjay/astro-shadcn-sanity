import { describe, test, expect } from 'vitest'
import { faqSection } from '../blocks/faq-section'

describe('faqSection schema: variants configuration', () => {
  test('variant field options include split, stacked, spread-header, and narrow', () => {
    const variantField = ((faqSection as any).fields as any[]).find((f) => f.name === 'variant')
    expect(variantField).toBeDefined()
    const variantNames = (variantField.options.list as any[]).map((v) => v.value)
    expect(variantNames).toContain('split')
    expect(variantNames).toContain('stacked')
    expect(variantNames).toContain('spread-header')
    expect(variantNames).toContain('narrow')
  })

  test('split is the first/default variant option', () => {
    const variantField = ((faqSection as any).fields as any[]).find((f) => f.name === 'variant')
    const options = variantField.options.list as any[]
    expect(options[0].value).toBe('split')
  })

  test('each variant option has a title', () => {
    const variantField = ((faqSection as any).fields as any[]).find((f) => f.name === 'variant')
    const options = variantField.options.list as any[]
    options.forEach((v) => {
      expect(v.title).toBeDefined()
      expect(typeof v.title).toBe('string')
      expect(v.title.length).toBeGreaterThan(0)
    })
  })

  test('heading field exists', () => {
    const headingField = ((faqSection as any).fields as any[]).find((f) => f.name === 'heading')
    expect(headingField).toBeDefined()
    expect(headingField.type).toBe('string')
  })

  test('items field exists and is an array', () => {
    const itemsField = ((faqSection as any).fields as any[]).find((f) => f.name === 'items')
    expect(itemsField).toBeDefined()
    expect(itemsField.type).toBe('array')
  })

  test('variant field is auto-generated and set to radio layout', () => {
    const variantField = ((faqSection as any).fields as any[]).find((f) => f.name === 'variant')
    expect(variantField).toBeDefined()
    expect(variantField.type).toBe('string')
    expect(variantField.options.layout).toBe('radio')
  })

  test('variant field has initialValue set to split (default)', () => {
    const variantField = ((faqSection as any).fields as any[]).find((f) => f.name === 'variant')
    expect(variantField.initialValue).toBe('split')
  })
})

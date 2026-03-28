import { describe, test, expect } from 'vitest'
import { faqSection } from '../blocks/faq-section'

describe('faqSection schema: variants configuration', () => {
  test('faqSection has variants defined', () => {
    expect((faqSection as any).variants).toBeDefined()
    expect((faqSection as any).variants.length).toBeGreaterThan(0)
  })

  test('variants include split, stacked, spread-header, and narrow', () => {
    const variantNames = ((faqSection as any).variants as any[]).map((v) => v.name)
    expect(variantNames).toContain('split')
    expect(variantNames).toContain('stacked')
    expect(variantNames).toContain('spread-header')
    expect(variantNames).toContain('narrow')
  })

  test('split is the first/default variant', () => {
    const variants = (faqSection as any).variants as any[]
    expect(variants[0].name).toBe('split')
  })

  test('each variant has a title', () => {
    const variants = (faqSection as any).variants as any[]
    variants.forEach((v) => {
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

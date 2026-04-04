import { describe, test, expect } from 'vitest'
import { testimonials } from '../blocks/testimonials'

describe('testimonials schema: variants configuration', () => {
  test('variant field options include grid, masonry, split, carousel, and marquee', () => {
    const variantField = ((testimonials as any).fields as any[]).find((f) => f.name === 'variant')
    expect(variantField).toBeDefined()
    const variantNames = (variantField.options.list as any[]).map((v) => v.value)
    expect(variantNames).toContain('grid')
    expect(variantNames).toContain('masonry')
    expect(variantNames).toContain('split')
    expect(variantNames).toContain('carousel')
    expect(variantNames).toContain('marquee')
  })

  test('grid is the first/default variant option', () => {
    const variantField = ((testimonials as any).fields as any[]).find((f) => f.name === 'variant')
    const options = variantField.options.list as any[]
    expect(options[0].value).toBe('grid')
  })

  test('variant field is auto-generated and set to radio layout', () => {
    const variantField = ((testimonials as any).fields as any[]).find((f) => f.name === 'variant')
    expect(variantField).toBeDefined()
    expect(variantField.type).toBe('string')
    expect(variantField.options.layout).toBe('radio')
  })

  test('variant field has initialValue set to grid (default)', () => {
    const variantField = ((testimonials as any).fields as any[]).find((f) => f.name === 'variant')
    expect(variantField.initialValue).toBe('grid')
  })

  test('displayMode is hidden in carousel and marquee variants', () => {
    const displayModeField = ((testimonials as any).fields as any[]).find((f) => f.name === 'displayMode')
    expect(displayModeField).toBeDefined()
    expect(displayModeField.hidden({ parent: { variant: 'carousel' } })).toBe(true)
    expect(displayModeField.hidden({ parent: { variant: 'marquee' } })).toBe(true)
    expect(displayModeField.hidden({ parent: { variant: 'grid' } })).toBe(false)
  })

  test('testimonials array keeps existing manual-mode hidden logic', () => {
    const testimonialsField = ((testimonials as any).fields as any[]).find((f) => f.name === 'testimonials')
    expect(testimonialsField).toBeDefined()
    expect(testimonialsField.hidden({ parent: { displayMode: 'manual' } })).toBe(false)
    expect(testimonialsField.hidden({ parent: { displayMode: 'all' } })).toBe(true)
  })
})

import { describe, test, expect } from 'vitest'
import { sponsorSteps } from '../blocks/sponsor-steps'

describe('sponsorSteps schema: variants configuration', () => {
  test('variant field options include steps, split, and spread', () => {
    const variantField = ((sponsorSteps as any).fields as any[]).find((f) => f.name === 'variant')
    expect(variantField).toBeDefined()
    const variantNames = (variantField.options.list as any[]).map((v) => v.value)
    expect(variantNames).toContain('steps')
    expect(variantNames).toContain('split')
    expect(variantNames).toContain('spread')
  })

  test('steps is the first/default variant option', () => {
    const variantField = ((sponsorSteps as any).fields as any[]).find((f) => f.name === 'variant')
    const options = variantField.options.list as any[]
    expect(options[0].value).toBe('steps')
  })

  test('variant field is auto-generated and set to radio layout', () => {
    const variantField = ((sponsorSteps as any).fields as any[]).find((f) => f.name === 'variant')
    expect(variantField).toBeDefined()
    expect(variantField.type).toBe('string')
    expect(variantField.options.layout).toBe('radio')
  })

  test('variant field has initialValue set to steps (default)', () => {
    const variantField = ((sponsorSteps as any).fields as any[]).find((f) => f.name === 'variant')
    expect(variantField.initialValue).toBe('steps')
  })
})

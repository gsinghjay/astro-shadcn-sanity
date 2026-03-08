import { describe, test, expect } from 'vitest'
import { sponsor } from '../documents/sponsor'

interface SchemaField {
  name: string
  type: string
  initialValue?: unknown
  description?: string
  group?: string
  [key: string]: unknown
}

function findField(fieldName: string): SchemaField | undefined {
  return (sponsor.fields as SchemaField[])?.find((f) => f.name === fieldName)
}

describe('Sponsor schema: hidden field', () => {
  test('hidden field exists with boolean type', () => {
    const field = findField('hidden')
    expect(field).toBeDefined()
    expect(field!.type).toBe('boolean')
  })

  test('hidden field has initialValue false', () => {
    const field = findField('hidden')
    expect(field!.initialValue).toBe(false)
  })

  test('hidden field is in the main group', () => {
    const field = findField('hidden')
    expect(field!.group).toBe('main')
  })

  test('hidden field has a description', () => {
    const field = findField('hidden')
    expect(field!.description).toBe('Hide this sponsor from public pages')
  })
})

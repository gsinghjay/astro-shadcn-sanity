import {describe, test, expect} from 'vitest'
import {DocumentTextIcon} from '@sanity/icons'
import {sponsorAgreement} from '../documents/sponsor-agreement'

interface SchemaField {
  name: string
  type: string
  description?: string
  initialValue?: unknown
  options?: {accept?: string}
  validation?: (rule: ValidationRule) => ValidationRule
  of?: Array<{type: string}>
  [key: string]: unknown
}

interface ValidationRule {
  required: () => ValidationRule
  max: (n: number) => ValidationRule
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
  }
  return proxy
}

function findField(fieldName: string): SchemaField | undefined {
  return (sponsorAgreement.fields as SchemaField[])?.find((f) => f.name === fieldName)
}

function recordValidation(fieldName: string): string[] {
  const field = findField(fieldName)
  if (!field?.validation) return []
  const rule = createRuleProxy()
  field.validation(rule)
  return rule.calls
}

describe('Sponsor agreement schema: top-level', () => {
  test('schema name is sponsorAgreement', () => {
    expect(sponsorAgreement.name).toBe('sponsorAgreement')
  })

  test('schema type is document (uses defineType)', () => {
    expect(sponsorAgreement.type).toBe('document')
  })

  test('schema icon is DocumentTextIcon', () => {
    expect(sponsorAgreement.icon).toBe(DocumentTextIcon)
  })

  test('preview selects title + pdfFile and prepare falls back when title missing', () => {
    expect(sponsorAgreement.preview).toBeDefined()
    expect(sponsorAgreement.preview?.select).toEqual({title: 'title', media: 'pdfFile'})
    const prepared = sponsorAgreement.preview?.prepare?.({title: undefined} as never)
    expect(prepared).toEqual({title: 'Sponsor Agreement', subtitle: 'Singleton — agreement PDF'})
    const preparedWithTitle = sponsorAgreement.preview?.prepare?.({title: 'Agreement 2026'} as never)
    expect(preparedWithTitle).toEqual({title: 'Agreement 2026', subtitle: 'Singleton — agreement PDF'})
  })
})

describe('Sponsor agreement schema: title field', () => {
  test('title field exists with string type', () => {
    const field = findField('title')
    expect(field).toBeDefined()
    expect(field!.type).toBe('string')
  })

  test('title field is required with max 150', () => {
    expect(recordValidation('title')).toEqual(['required', 'max:150'])
  })
})

describe('Sponsor agreement schema: intro field', () => {
  test('intro field exists with array type of blocks', () => {
    const field = findField('intro')
    expect(field).toBeDefined()
    expect(field!.type).toBe('array')
    expect(field!.of?.[0]?.type).toBe('block')
  })
})

describe('Sponsor agreement schema: pdfFile field', () => {
  test('pdfFile field exists with file type', () => {
    const field = findField('pdfFile')
    expect(field).toBeDefined()
    expect(field!.type).toBe('file')
  })

  test('pdfFile accepts application/pdf only', () => {
    const field = findField('pdfFile')
    expect(field!.options?.accept).toBe('application/pdf')
  })

  test('pdfFile is required', () => {
    expect(recordValidation('pdfFile')).toEqual(['required'])
  })
})

describe('Sponsor agreement schema: checkboxLabel field', () => {
  test('checkboxLabel has expected default initial value', () => {
    const field = findField('checkboxLabel')
    expect(field).toBeDefined()
    expect(field!.type).toBe('string')
    expect(field!.initialValue).toBe('I have read and accept the sponsor agreement')
  })

  test('checkboxLabel is required with max 200', () => {
    expect(recordValidation('checkboxLabel')).toEqual(['required', 'max:200'])
  })
})

describe('Sponsor agreement schema: acceptButtonText field', () => {
  test('acceptButtonText has initial value "Accept & Continue"', () => {
    const field = findField('acceptButtonText')
    expect(field).toBeDefined()
    expect(field!.type).toBe('string')
    expect(field!.initialValue).toBe('Accept & Continue')
  })

  test('acceptButtonText is required with max 60', () => {
    expect(recordValidation('acceptButtonText')).toEqual(['required', 'max:60'])
  })
})

describe('Sponsor agreement schema: bodyContent field', () => {
  test('bodyContent field exists with array type of blocks', () => {
    const field = findField('bodyContent')
    expect(field).toBeDefined()
    expect(field!.type).toBe('array')
    expect(field!.of?.[0]?.type).toBe('block')
  })
})

describe('Sponsor agreement schema: exclusions', () => {
  test('seo field does NOT exist (auth-only content)', () => {
    expect(findField('seo')).toBeUndefined()
  })

  test('route field does NOT exist (true singleton, not route-keyed)', () => {
    expect(findField('route')).toBeUndefined()
  })
})

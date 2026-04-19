import {describe, test, expect} from 'vitest'
import {portalPage} from '../documents/portal-page'

interface SchemaField {
  name: string
  type: string
  readOnly?: boolean
  description?: string
  options?: {list?: Array<{title: string; value: string}>; layout?: string}
  hidden?: unknown
  of?: unknown[]
  [key: string]: unknown
}

function findField(fieldName: string): SchemaField | undefined {
  return (portalPage.fields as SchemaField[])?.find((f) => f.name === fieldName)
}

describe('Portal page schema', () => {
  test('schema name is portalPage', () => {
    expect(portalPage.name).toBe('portalPage')
  })

  test('schema type is document', () => {
    expect(portalPage.type).toBe('document')
  })

  test('has preview config with prepare function', () => {
    expect(portalPage.preview).toBeDefined()
    expect(portalPage.preview?.select).toEqual({title: 'title', subtitle: 'route'})
    expect(portalPage.preview?.prepare).toBeDefined()
  })
})

describe('Portal page schema: route field', () => {
  test('route field exists with string type', () => {
    const field = findField('route')
    expect(field).toBeDefined()
    expect(field!.type).toBe('string')
  })

  test('route field is readOnly', () => {
    const field = findField('route')
    expect(field!.readOnly).toBe(true)
  })

  test('route field has radio layout with 6 options', () => {
    const field = findField('route')
    expect(field!.options?.layout).toBe('radio')
    expect(field!.options?.list).toHaveLength(6)
    const values = field!.options?.list?.map((o) => o.value)
    expect(values).toEqual(['dashboard', 'events', 'progress', 'sponsorship', 'login', 'denied'])
  })

  test('route field has description', () => {
    const field = findField('route')
    expect(field!.description).toBeDefined()
  })
})

describe('Portal page schema: title and description fields', () => {
  test('title field exists with string type', () => {
    const field = findField('title')
    expect(field).toBeDefined()
    expect(field!.type).toBe('string')
  })

  test('description field exists with text type', () => {
    const field = findField('description')
    expect(field).toBeDefined()
    expect(field!.type).toBe('text')
  })
})

describe('Portal page schema: block arrays', () => {
  test('headerBlocks field exists with array type', () => {
    const field = findField('headerBlocks')
    expect(field).toBeDefined()
    expect(field!.type).toBe('array')
  })

  test('footerBlocks field exists with array type', () => {
    const field = findField('footerBlocks')
    expect(field).toBeDefined()
    expect(field!.type).toBe('array')
  })
})

describe('Portal page schema: dashboardCards field', () => {
  test('dashboardCards field exists with array type', () => {
    const field = findField('dashboardCards')
    expect(field).toBeDefined()
    expect(field!.type).toBe('array')
  })

  test('dashboardCards has hidden callback', () => {
    const field = findField('dashboardCards')
    expect(typeof field!.hidden).toBe('function')
  })

  test('dashboardCards is hidden when route is not dashboard', () => {
    const field = findField('dashboardCards')
    const hiddenFn = field!.hidden as (ctx: {document?: {route?: string}}) => boolean
    expect(hiddenFn({document: {route: 'events'}})).toBe(true)
    expect(hiddenFn({document: {route: 'dashboard'}})).toBe(false)
  })

  test('dashboardCards object has required subfields', () => {
    const field = findField('dashboardCards')
    const objectDef = (field!.of as Array<{type: string; fields?: SchemaField[]}>)?.[0]
    expect(objectDef?.type).toBe('object')
    const subFieldNames = objectDef?.fields?.map((f) => f.name)
    expect(subFieldNames).toContain('title')
    expect(subFieldNames).toContain('description')
    expect(subFieldNames).toContain('iconName')
    expect(subFieldNames).toContain('route')
    expect(subFieldNames).toContain('enabled')
  })
})

describe('Portal page schema: no seo field', () => {
  test('seo field does NOT exist', () => {
    const field = findField('seo')
    expect(field).toBeUndefined()
  })
})

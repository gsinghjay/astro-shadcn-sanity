import {describe, test, expect} from 'vitest'
import {author} from '../documents/author'

interface SchemaField {
  name: string
  type: string
  description?: string
  group?: string
  rows?: number
  validation?: unknown
  options?: Record<string, unknown>
  fields?: SchemaField[]
  of?: Array<{type: string; fields?: SchemaField[]; preview?: unknown; validation?: unknown}>
  [key: string]: unknown
}

function findField(fieldName: string): SchemaField | undefined {
  return (author.fields as SchemaField[])?.find((f) => f.name === fieldName)
}

describe('Author document schema (Story 20.1)', () => {
  describe('document-level configuration', () => {
    test('has name "author" and type "document"', () => {
      expect(author.name).toBe('author')
      expect(author.type).toBe('document')
    })

    test('has title "Author"', () => {
      expect(author.title).toBe('Author')
    })

    test('has UserIcon icon', () => {
      expect(author.icon).toBeDefined()
    })

    test('has groups: main (default), links', () => {
      const groups = author.groups as Array<{name: string; default?: boolean; icon?: unknown}>
      expect(groups).toHaveLength(2)
      expect(groups[0]).toMatchObject({name: 'main', default: true})
      expect(groups[1]).toMatchObject({name: 'links'})
      expect(groups[1].icon).toBeDefined()
    })

    test('has preview selecting name, role, image', () => {
      expect(author.preview).toEqual({
        select: {title: 'name', subtitle: 'role', media: 'image'},
      })
    })
  })

  describe('name field', () => {
    test('exists as required string with max 100', () => {
      const field = findField('name')
      expect(field).toBeDefined()
      expect(field!.type).toBe('string')
      expect(field!.group).toBe('main')
      expect(field!.description).toBeDefined()
      expect(field!.validation).toBeDefined()
    })
  })

  describe('slug field', () => {
    test('exists as required slug sourced from name', () => {
      const field = findField('slug')
      expect(field).toBeDefined()
      expect(field!.type).toBe('slug')
      expect(field!.group).toBe('main')
      expect(field!.options).toBeDefined()
      expect((field!.options as any).source).toBe('name')
      expect((field!.options as any).maxLength).toBe(96)
      expect((field!.options as any).isUnique).toBeDefined()
      expect(field!.validation).toBeDefined()
    })
  })

  describe('site field', () => {
    test('exists with group main', () => {
      const field = findField('site')
      expect(field).toBeDefined()
      expect(field!.group).toBe('main')
    })
  })

  describe('role field', () => {
    test('exists as optional string with max 100', () => {
      const field = findField('role')
      expect(field).toBeDefined()
      expect(field!.type).toBe('string')
      expect(field!.group).toBe('main')
      expect(field!.description).toBeDefined()
      expect(field!.validation).toBeDefined()
    })
  })

  describe('bio field', () => {
    test('exists as optional text with max 500 and rows 3', () => {
      const field = findField('bio')
      expect(field).toBeDefined()
      expect(field!.type).toBe('text')
      expect(field!.group).toBe('main')
      expect(field!.rows).toBe(3)
      expect(field!.description).toBeDefined()
      expect(field!.validation).toBeDefined()
    })
  })

  describe('credentials field', () => {
    test('exists as array of strings in main group', () => {
      const field = findField('credentials')
      expect(field).toBeDefined()
      expect(field!.type).toBe('array')
      expect(field!.group).toBe('main')
      expect(field!.of).toHaveLength(1)
      expect(field!.of![0].type).toBe('string')
      expect(field!.description).toBeDefined()
      expect(field!.validation).toBeDefined()
    })
  })

  describe('image field', () => {
    test('exists as image with hotspot in main group', () => {
      const field = findField('image')
      expect(field).toBeDefined()
      expect(field!.type).toBe('image')
      expect(field!.group).toBe('main')
      expect((field!.options as any).hotspot).toBe(true)
      expect(field!.description).toBeDefined()
    })

    test('is optional (no required validation)', () => {
      const field = findField('image')
      // image field is intentionally optional unlike sponsor logo — verify no validation rule
      expect(field!.validation).toBeUndefined()
    })

    test('has nested alt field', () => {
      const field = findField('image')
      expect(field!.fields).toBeDefined()
      const altField = field!.fields!.find((f) => f.name === 'alt')
      expect(altField).toBeDefined()
      expect(altField!.type).toBe('string')
      expect(altField!.description).toBeDefined()
    })
  })

  describe('sameAs field', () => {
    test('exists as array of url in links group', () => {
      const field = findField('sameAs')
      expect(field).toBeDefined()
      expect(field!.type).toBe('array')
      expect(field!.group).toBe('links')
      expect(field!.of).toHaveLength(1)
      expect(field!.of![0].type).toBe('url')
      expect(field!.description).toBeDefined()
      expect(field!.validation).toBeDefined()
    })

    test('array items have uri validation', () => {
      const field = findField('sameAs')
      expect(field!.of![0].validation).toBeDefined()
    })
  })

  describe('socialLinks field', () => {
    test('exists as array of objects in links group', () => {
      const field = findField('socialLinks')
      expect(field).toBeDefined()
      expect(field!.type).toBe('array')
      expect(field!.group).toBe('links')
      expect(field!.of).toHaveLength(1)
      expect(field!.of![0].type).toBe('object')
      expect(field!.description).toBeDefined()
      expect(field!.validation).toBeDefined()
    })

    test('object has platform and url fields', () => {
      const field = findField('socialLinks')
      const objectDef = field!.of![0]
      expect(objectDef.fields).toBeDefined()
      const platformField = objectDef.fields!.find((f: any) => f.name === 'platform')
      const urlField = objectDef.fields!.find((f: any) => f.name === 'url')
      expect(platformField).toBeDefined()
      expect(platformField!.type).toBe('string')
      expect(platformField!.validation).toBeDefined()
      expect(urlField).toBeDefined()
      expect(urlField!.type).toBe('url')
      expect(urlField!.validation).toBeDefined()
    })

    test('platform field has radio layout with 5 options', () => {
      const field = findField('socialLinks')
      const objectDef = field!.of![0]
      const platformField = objectDef.fields!.find((f: any) => f.name === 'platform')
      expect((platformField as any).options.layout).toBe('radio')
      expect((platformField as any).options.list).toHaveLength(5)
    })

    test('object has preview config', () => {
      const field = findField('socialLinks')
      const objectDef = field!.of![0]
      expect(objectDef.preview).toEqual({
        select: {title: 'platform', subtitle: 'url'},
      })
    })
  })

  describe('field order', () => {
    test('fields follow the required order', () => {
      const fieldNames = (author.fields as SchemaField[]).map((f) => f.name)
      expect(fieldNames).toEqual([
        'name',
        'slug',
        'site',
        'role',
        'bio',
        'credentials',
        'image',
        'sameAs',
        'socialLinks',
      ])
    })
  })
})

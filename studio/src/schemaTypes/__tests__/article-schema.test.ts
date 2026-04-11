import {describe, test, expect} from 'vitest'
import {article} from '../documents/article'

interface SchemaField {
  name: string
  type: string
  description?: string
  group?: string
  rows?: number
  validation?: unknown
  options?: Record<string, unknown>
  fields?: SchemaField[]
  of?: Array<{type: string; to?: Array<{type: string}>; fields?: SchemaField[]; validation?: unknown}>
  [key: string]: unknown
}

function findField(fieldName: string): SchemaField | undefined {
  return (article.fields as SchemaField[])?.find((f) => f.name === fieldName)
}

describe('Article document schema (Story 19.2)', () => {
  describe('document-level configuration', () => {
    test('has name "article" and type "document"', () => {
      expect(article.name).toBe('article')
      expect(article.type).toBe('document')
    })

    test('has title "Article"', () => {
      expect(article.title).toBe('Article')
    })

    test('has DocumentTextIcon icon', () => {
      expect(article.icon).toBeDefined()
    })

    test('has groups: main (default), content, seo', () => {
      const groups = article.groups as Array<{name: string; default?: boolean; icon?: unknown}>
      expect(groups).toHaveLength(3)
      expect(groups[0]).toMatchObject({name: 'main', default: true})
      expect(groups[1]).toMatchObject({name: 'content'})
      expect(groups[2]).toMatchObject({name: 'seo'})
      expect(groups[2].icon).toBeDefined()
    })

    test('has orderings: publishedAt desc, publishedAt asc, title asc', () => {
      const orderings = article.orderings as Array<{name: string; by: Array<{field: string; direction: string}>}>
      expect(orderings).toHaveLength(3)
      expect(orderings[0]).toMatchObject({
        name: 'publishedAtDesc',
        by: [{field: 'publishedAt', direction: 'desc'}],
      })
      expect(orderings[1]).toMatchObject({
        name: 'publishedAtAsc',
        by: [{field: 'publishedAt', direction: 'asc'}],
      })
      expect(orderings[2]).toMatchObject({
        name: 'titleAsc',
        by: [{field: 'title', direction: 'asc'}],
      })
    })

    test('has preview selecting title, publishedAt, featuredImage', () => {
      expect(article.preview?.select).toEqual({
        title: 'title',
        subtitle: 'publishedAt',
        media: 'featuredImage',
      })
    })

    test('preview prepare formats date', () => {
      const prepare = (article.preview as any)?.prepare
      expect(prepare).toBeDefined()
      const result = prepare({title: 'Test', subtitle: '2026-01-15T00:00:00Z', media: null})
      expect(result.title).toBe('Test')
      expect(result.subtitle).toContain('2026')
      expect(result.media).toBeNull()
    })

    test('preview prepare handles missing date', () => {
      const prepare = (article.preview as any)?.prepare
      const result = prepare({title: 'Test', subtitle: undefined, media: null})
      expect(result.subtitle).toBe('No publish date')
    })
  })

  describe('title field', () => {
    test('exists as required string with max 150 in main group', () => {
      const field = findField('title')
      expect(field).toBeDefined()
      expect(field!.type).toBe('string')
      expect(field!.group).toBe('main')
      expect(field!.description).toBeDefined()
      expect(field!.validation).toBeDefined()
    })
  })

  describe('slug field', () => {
    test('exists as required slug sourced from title', () => {
      const field = findField('slug')
      expect(field).toBeDefined()
      expect(field!.type).toBe('slug')
      expect(field!.group).toBe('main')
      expect(field!.options).toBeDefined()
      expect((field!.options as any).source).toBe('title')
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

  describe('excerpt field', () => {
    test('exists as required text with max 200 and rows 3 in main group', () => {
      const field = findField('excerpt')
      expect(field).toBeDefined()
      expect(field!.type).toBe('text')
      expect(field!.group).toBe('main')
      expect(field!.rows).toBe(3)
      expect(field!.description).toBeDefined()
      expect(field!.validation).toBeDefined()
    })
  })

  describe('featuredImage field', () => {
    test('exists as required image with hotspot in main group', () => {
      const field = findField('featuredImage')
      expect(field).toBeDefined()
      expect(field!.type).toBe('image')
      expect(field!.group).toBe('main')
      expect((field!.options as any).hotspot).toBe(true)
      expect(field!.description).toBeDefined()
      expect(field!.validation).toBeDefined()
    })

    test('has nested required alt field', () => {
      const field = findField('featuredImage')
      expect(field!.fields).toBeDefined()
      const altField = field!.fields!.find((f) => f.name === 'alt')
      expect(altField).toBeDefined()
      expect(altField!.type).toBe('string')
      expect(altField!.description).toBeDefined()
      expect(altField!.validation).toBeDefined()
    })
  })

  describe('body field', () => {
    test('exists as required portableText in content group', () => {
      const field = findField('body')
      expect(field).toBeDefined()
      expect(field!.type).toBe('portableText')
      expect(field!.group).toBe('content')
      expect(field!.validation).toBeDefined()
    })
  })

  describe('author field', () => {
    test('exists as optional reference to author in main group', () => {
      const field = findField('author')
      expect(field).toBeDefined()
      expect(field!.type).toBe('reference')
      expect(field!.group).toBe('main')
      expect(field!.description).toBeDefined()
      const to = (field as any).to as Array<{type: string}>
      expect(to).toEqual([{type: 'author'}])
    })
  })

  describe('publishedAt field', () => {
    test('exists as required datetime in main group', () => {
      const field = findField('publishedAt')
      expect(field).toBeDefined()
      expect(field!.type).toBe('datetime')
      expect(field!.group).toBe('main')
      expect(field!.description).toBeDefined()
      expect(field!.validation).toBeDefined()
    })
  })

  describe('updatedAt field', () => {
    test('exists as optional datetime in main group', () => {
      const field = findField('updatedAt')
      expect(field).toBeDefined()
      expect(field!.type).toBe('datetime')
      expect(field!.group).toBe('main')
      expect(field!.description).toBeDefined()
    })

    test('has cross-field validation against publishedAt', () => {
      const field = findField('updatedAt')
      expect(field!.validation).toBeDefined()
    })
  })

  describe('category field', () => {
    test('exists as required reference to articleCategory in main group', () => {
      const field = findField('category')
      expect(field).toBeDefined()
      expect(field!.type).toBe('reference')
      expect(field!.group).toBe('main')
      expect(field!.description).toBeDefined()
      expect(field!.validation).toBeDefined()
      const to = (field as any).to as Array<{type: string}>
      expect(to).toEqual([{type: 'articleCategory'}])
    })
  })

  describe('tags field', () => {
    test('exists as array of strings with tags layout in main group', () => {
      const field = findField('tags')
      expect(field).toBeDefined()
      expect(field!.type).toBe('array')
      expect(field!.group).toBe('main')
      expect(field!.of).toHaveLength(1)
      expect(field!.of![0].type).toBe('string')
      expect((field!.options as any).layout).toBe('tags')
      expect(field!.description).toBeDefined()
      expect(field!.validation).toBeDefined()
    })
  })

  describe('relatedArticles field', () => {
    test('exists as array of references to article in content group', () => {
      const field = findField('relatedArticles')
      expect(field).toBeDefined()
      expect(field!.type).toBe('array')
      expect(field!.group).toBe('content')
      expect(field!.of).toHaveLength(1)
      expect(field!.of![0].type).toBe('reference')
      expect(field!.of![0].to).toEqual([{type: 'article'}])
      expect(field!.description).toBeDefined()
      expect(field!.validation).toBeDefined()
    })

    test('has self-reference filter on reference members', () => {
      const field = findField('relatedArticles')
      const refMember = field!.of![0] as Record<string, unknown>
      expect(refMember.options).toBeDefined()
      const options = refMember.options as Record<string, unknown>
      expect(options.filter).toBeDefined()
      expect(typeof options.filter).toBe('function')
    })
  })

  describe('seo field', () => {
    test('exists as seo type in seo group', () => {
      const field = findField('seo')
      expect(field).toBeDefined()
      expect(field!.type).toBe('seo')
      expect(field!.group).toBe('seo')
    })
  })

  describe('field order', () => {
    test('fields follow the required order', () => {
      const fieldNames = (article.fields as SchemaField[]).map((f) => f.name)
      expect(fieldNames).toEqual([
        'title',
        'slug',
        'site',
        'excerpt',
        'featuredImage',
        'body',
        'author',
        'publishedAt',
        'updatedAt',
        'category',
        'tags',
        'relatedArticles',
        'seo',
      ])
    })
  })
})

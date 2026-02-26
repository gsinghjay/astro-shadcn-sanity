/**
 * Story 15-1: RWC Dataset & Schema — Site Field Definition
 *
 * Tests the reusable siteField helper exported from site-field.ts.
 *
 * @story 15-1
 * @phase RED → GREEN
 */
import {describe, test, expect} from 'vitest'

import {siteField} from '../site-field'

describe('Story 15-1: siteField definition', () => {
  test('has correct name, type, and title', () => {
    expect(siteField.name).toBe('site')
    expect(siteField.type).toBe('string')
    expect(siteField.title).toBe('Site')
  })

  test('has description', () => {
    expect(siteField.description).toBe('Which RWC site this content belongs to')
  })

  test('has two options in list: rwc-us and rwc-intl', () => {
    const options = (siteField as any).options
    expect(options).toBeDefined()
    expect(options.list).toHaveLength(2)
    expect(options.list).toEqual([
      {title: 'RWC US', value: 'rwc-us'},
      {title: 'RWC International', value: 'rwc-intl'},
    ])
  })

  test('has radio layout', () => {
    const options = (siteField as any).options
    expect(options.layout).toBe('radio')
  })

  test('hidden is a function', () => {
    expect(typeof siteField.hidden).toBe('function')
  })

  test('validation is a function', () => {
    expect(typeof siteField.validation).toBe('function')
  })
})

describe('Story 15-1: siteField in document schemas', () => {
  test('page schema includes site field', async () => {
    const {page} = await import('../../documents/page')
    const fieldNames = (page as any).fields.map((f: any) => f.name)
    expect(fieldNames).toContain('site')
  })

  test('sponsor schema includes site field', async () => {
    const {sponsor} = await import('../../documents/sponsor')
    const fieldNames = (sponsor as any).fields.map((f: any) => f.name)
    expect(fieldNames).toContain('site')
  })

  test('project schema includes site field', async () => {
    const {project} = await import('../../documents/project')
    const fieldNames = (project as any).fields.map((f: any) => f.name)
    expect(fieldNames).toContain('site')
  })

  test('testimonial schema includes site field', async () => {
    const {testimonial} = await import('../../documents/testimonial')
    const fieldNames = (testimonial as any).fields.map((f: any) => f.name)
    expect(fieldNames).toContain('site')
  })

  test('event schema includes site field', async () => {
    const {event} = await import('../../documents/event')
    const fieldNames = (event as any).fields.map((f: any) => f.name)
    expect(fieldNames).toContain('site')
  })

  test('siteSettings schema includes site field', async () => {
    const {siteSettings} = await import('../../documents/site-settings')
    const fieldNames = (siteSettings as any).fields.map((f: any) => f.name)
    expect(fieldNames).toContain('site')
  })

  test('site field is placed after slug in page schema', async () => {
    const {page} = await import('../../documents/page')
    const fieldNames = (page as any).fields.map((f: any) => f.name)
    const slugIndex = fieldNames.indexOf('slug')
    const siteIndex = fieldNames.indexOf('site')
    expect(siteIndex).toBeGreaterThan(slugIndex)
  })

  test('site field is placed after slug in sponsor schema', async () => {
    const {sponsor} = await import('../../documents/sponsor')
    const fieldNames = (sponsor as any).fields.map((f: any) => f.name)
    const slugIndex = fieldNames.indexOf('slug')
    const siteIndex = fieldNames.indexOf('site')
    expect(siteIndex).toBeGreaterThan(slugIndex)
  })

  test('submission schema does NOT include site field', async () => {
    const {submission} = await import('../../documents/submission')
    const fieldNames = (submission as any).fields.map((f: any) => f.name)
    expect(fieldNames).not.toContain('site')
  })
})

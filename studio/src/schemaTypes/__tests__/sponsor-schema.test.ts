import { describe, test, expect } from 'vitest'
import { sponsor } from '../documents/sponsor'

interface SchemaField {
  name: string
  type: string
  initialValue?: unknown
  description?: string
  group?: string
  readOnly?: (ctx: { currentUser: unknown }) => boolean
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

// Story 24.7 (M-4): allowedEmails is admin-only in Studio. The readOnly callback
// is the UI gate — gates non-admin Studio users out of editing the sponsor
// whitelist. Authoritative enforcement still lives in the Sanity dashboard ACL.
describe('Sponsor schema: allowedEmails readOnly gate', () => {
  const callReadOnly = (currentUser: unknown): boolean => {
    const field = findField('allowedEmails')
    return field!.readOnly!({ currentUser })
  }

  test('returns true (read-only) when currentUser is null', () => {
    expect(callReadOnly(null)).toBe(true)
  })

  test('returns true when currentUser exists but roles is undefined', () => {
    expect(callReadOnly({ id: 'p1', email: 'x@example.com' })).toBe(true)
  })

  test('returns true when roles array is empty', () => {
    expect(callReadOnly({ id: 'p1', email: 'x@example.com', roles: [] })).toBe(true)
  })

  test('returns true for non-admin role (editor)', () => {
    expect(
      callReadOnly({ id: 'p1', email: 'x@example.com', roles: [{ name: 'editor' }] }),
    ).toBe(true)
  })

  test('returns true for non-admin role (developer)', () => {
    expect(
      callReadOnly({ id: 'p1', email: 'x@example.com', roles: [{ name: 'developer' }] }),
    ).toBe(true)
  })

  test('returns false (editable) for administrator role', () => {
    expect(
      callReadOnly({ id: 'p1', email: 'x@example.com', roles: [{ name: 'administrator' }] }),
    ).toBe(false)
  })

  // Sanity's role machine name is the lowercased 'administrator'. Display name
  // 'Administrator' is something different — and case-sensitive comparison
  // means a typo here would silently lock the field for everyone.
  test('returns true for "Administrator" (case-sensitive — display name is not the machine name)', () => {
    expect(
      callReadOnly({ id: 'p1', email: 'x@example.com', roles: [{ name: 'Administrator' }] }),
    ).toBe(true)
  })

  test('returns false when roles include administrator alongside other roles', () => {
    expect(
      callReadOnly({
        id: 'p1',
        email: 'x@example.com',
        roles: [{ name: 'editor' }, { name: 'administrator' }],
      }),
    ).toBe(false)
  })
})

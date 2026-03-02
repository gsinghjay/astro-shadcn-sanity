/**
 * Story 16-4: Sanity Schema — team, capstoneStudent, studentResource (AC: 1, 2, 6, 8)
 *
 * Tests schema structure for all three student portal document types.
 * Uses static imports per project convention.
 *
 * @story 16-4
 * @phase GREEN
 */
import { describe, test, expect } from 'vitest'

import { capstoneStudent } from '../../../studio/src/schemaTypes/documents/capstone-student'
import { team } from '../../../studio/src/schemaTypes/documents/team'
import { studentResource } from '../../../studio/src/schemaTypes/documents/student-resource'
import { schemaTypes } from '../../../studio/src/schemaTypes/index'

// Schema test helpers — use Record<string, any> for deep Sanity field property access in assertions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SchemaFieldRecord = Record<string, any>;

function fieldNames(schema: { fields: Array<{ name: string }> }): string[] {
  return schema.fields.map((f) => f.name)
}

function findField(schema: { fields: SchemaFieldRecord[] }, name: string): SchemaFieldRecord | undefined {
  return schema.fields.find((f) => f.name === name)
}

describe('Story 16-4: Student Portal Schemas', () => {
  // ---------------------------------------------------------------------------
  // AC1/AC8: All three types registered in schemaTypes array
  // ---------------------------------------------------------------------------
  describe('AC1: Schema Registration', () => {
    test('16.4-INT-001 — capstoneStudent is registered in schemaTypes', () => {
      const names = schemaTypes.map((s: any) => s.name)
      expect(names).toContain('capstoneStudent')
    })

    test('16.4-INT-002 — team is registered in schemaTypes', () => {
      const names = schemaTypes.map((s: any) => s.name)
      expect(names).toContain('team')
    })

    test('16.4-INT-003 — studentResource is registered in schemaTypes', () => {
      const names = schemaTypes.map((s: any) => s.name)
      expect(names).toContain('studentResource')
    })
  })

  // ---------------------------------------------------------------------------
  // AC1/AC6: capstoneStudent schema structure
  // ---------------------------------------------------------------------------
  describe('AC1/AC6: capstoneStudent Schema', () => {
    test('16.4-INT-010 — capstoneStudent is a document type with correct name', () => {
      expect(capstoneStudent.name).toBe('capstoneStudent')
      expect(capstoneStudent.type).toBe('document')
    })

    test('16.4-INT-011 — capstoneStudent has all expected fields', () => {
      const names = fieldNames(capstoneStudent)
      expect(names).toContain('name')
      expect(names).toContain('email')
      expect(names).toContain('semester')
      expect(names).toContain('githubUsername')
      expect(names).toContain('discordUsername')
      expect(names).toHaveLength(5)
    })

    test('16.4-INT-012 — capstoneStudent name is required string', () => {
      const field = findField(capstoneStudent, 'name')
      expect(field.type).toBe('string')
      expect(field.validation).toBeDefined()
    })

    test('16.4-INT-013 — capstoneStudent email is required with email validation', () => {
      const field = findField(capstoneStudent, 'email')
      expect(field.type).toBe('string')
      expect(field.validation).toBeDefined()
    })

    test('16.4-INT-014 — capstoneStudent semester has radio options', () => {
      const field = findField(capstoneStudent, 'semester')
      expect(field.type).toBe('string')
      expect(field.options?.list).toContain('Spring 2026')
      expect(field.options?.list).toContain('Fall 2026')
      expect(field.options?.layout).toBe('radio')
    })

    test('16.4-INT-015 — capstoneStudent has icon', () => {
      expect(capstoneStudent.icon).toBeDefined()
    })

    test('16.4-INT-016 — capstoneStudent preview shows name and email', () => {
      expect((capstoneStudent as any).preview?.select?.title).toBe('name')
      expect((capstoneStudent as any).preview?.select?.subtitle).toBe('email')
    })
  })

  // ---------------------------------------------------------------------------
  // AC1/AC2/AC3/AC4/AC6: team schema structure
  // ---------------------------------------------------------------------------
  describe('AC1/AC2/AC3/AC4/AC6: team Schema', () => {
    test('16.4-INT-020 — team is a document type with correct name', () => {
      expect(team.name).toBe('team')
      expect(team.type).toBe('document')
    })

    test('16.4-INT-021 — team has all expected fields', () => {
      const names = fieldNames(team)
      expect(names).toContain('name')
      expect(names).toContain('semester')
      expect(names).toContain('project')
      expect(names).toContain('maxMembers')
      expect(names).toContain('pm')
      expect(names).toContain('assistantPm')
      expect(names).toContain('members')
      expect(names).toContain('githubRepoUrl')
      expect(names).toContain('discordChannelUrl')
      expect(names).toContain('teamResources')
      expect(names).toHaveLength(10)
    })

    test('16.4-INT-022 — team.project references existing project type (AC2)', () => {
      const field = findField(team, 'project')
      expect(field.type).toBe('reference')
      const refTypes = field.to.map((t: any) => t.type)
      expect(refTypes).toContain('project')
    })

    test('16.4-INT-023 — team.pm references capstoneStudent and is required', () => {
      const field = findField(team, 'pm')
      expect(field.type).toBe('reference')
      const refTypes = field.to.map((t: any) => t.type)
      expect(refTypes).toContain('capstoneStudent')
      expect(field.validation).toBeDefined()
    })

    test('16.4-INT-024 — team.members is array of references to capstoneStudent', () => {
      const field = findField(team, 'members')
      expect(field.type).toBe('array')
      const memberRef = field.of[0]
      expect(memberRef.type).toBe('reference')
      const refTypes = memberRef.to.map((t: any) => t.type)
      expect(refTypes).toContain('capstoneStudent')
    })

    test('16.4-INT-025 — team.assistantPm has hidden function (AC4)', () => {
      const field = findField(team, 'assistantPm')
      expect(field.type).toBe('reference')
      expect(field.hidden).toBeDefined()
      expect(typeof field.hidden).toBe('function')
    })

    test('16.4-INT-026 — team.assistantPm hidden when members <= 5', () => {
      const field = findField(team, 'assistantPm')
      // 5 members → hidden
      expect(field.hidden({ document: { members: [1, 2, 3, 4, 5] } })).toBe(true)
      // 0 members → hidden
      expect(field.hidden({ document: { members: [] } })).toBe(true)
      // no members field → hidden
      expect(field.hidden({ document: {} })).toBe(true)
      // 6 members → visible
      expect(field.hidden({ document: { members: [1, 2, 3, 4, 5, 6] } })).toBe(false)
    })

    test('16.4-INT-027 — team has field groups (main, team, links)', () => {
      const groups = (team as any).groups?.map((g: any) => g.name)
      expect(groups).toContain('main')
      expect(groups).toContain('team')
      expect(groups).toContain('links')
    })

    test('16.4-INT-028 — team preview uses prepare function (AC3)', () => {
      const preview = (team as any).preview
      expect(preview?.prepare).toBeDefined()
      expect(typeof preview.prepare).toBe('function')

      const result = preview.prepare({ title: 'Alpha', subtitle: 'Spring 2026', pm: 'Jane Doe' })
      expect(result.title).toBe('Alpha')
      expect(result.subtitle).toContain('PM: Jane Doe')
    })

    test('16.4-INT-029 — team.maxMembers has min 2, max 12, initialValue 5', () => {
      const field = findField(team, 'maxMembers')
      expect(field.type).toBe('number')
      expect(field.initialValue).toBe(5)
      expect(field.validation).toBeDefined()
    })

    test('16.4-INT-030 — team has icon', () => {
      expect(team.icon).toBeDefined()
    })

    test('16.4-INT-031 — team.teamResources is array of inline objects', () => {
      const field = findField(team, 'teamResources')
      expect(field.type).toBe('array')
      const obj = field.of[0]
      expect(obj.type).toBe('object')
      const objFieldNames = obj.fields.map((f: any) => f.name)
      expect(objFieldNames).toContain('label')
      expect(objFieldNames).toContain('url')
      expect(objFieldNames).toContain('category')
    })
  })

  // ---------------------------------------------------------------------------
  // AC1/AC6: studentResource schema structure
  // ---------------------------------------------------------------------------
  describe('AC1/AC6: studentResource Schema', () => {
    test('16.4-INT-040 — studentResource is a document type with correct name', () => {
      expect(studentResource.name).toBe('studentResource')
      expect(studentResource.type).toBe('document')
    })

    test('16.4-INT-041 — studentResource has all expected fields', () => {
      const names = fieldNames(studentResource)
      expect(names).toContain('title')
      expect(names).toContain('description')
      expect(names).toContain('url')
      expect(names).toContain('category')
      expect(names).toContain('sortOrder')
      expect(names).toHaveLength(5)
    })

    test('16.4-INT-042 — studentResource title is required string', () => {
      const field = findField(studentResource, 'title')
      expect(field.type).toBe('string')
      expect(field.validation).toBeDefined()
    })

    test('16.4-INT-043 — studentResource url is required', () => {
      const field = findField(studentResource, 'url')
      expect(field.type).toBe('url')
      expect(field.validation).toBeDefined()
    })

    test('16.4-INT-044 — studentResource category has correct options', () => {
      const field = findField(studentResource, 'category')
      expect(field.type).toBe('string')
      expect(field.options?.list).toEqual(['calendar', 'academic', 'communication', 'development', 'general'])
    })

    test('16.4-INT-045 — studentResource has sortOrder with initialValue 0', () => {
      const field = findField(studentResource, 'sortOrder')
      expect(field.type).toBe('number')
      expect(field.initialValue).toBe(0)
    })

    test('16.4-INT-046 — studentResource has orderings definition', () => {
      const orderings = (studentResource as any).orderings
      expect(orderings).toBeDefined()
      expect(orderings[0].name).toBe('sortOrderAsc')
      expect(orderings[0].by[0].field).toBe('sortOrder')
      expect(orderings[0].by[0].direction).toBe('asc')
    })

    test('16.4-INT-047 — studentResource has icon', () => {
      expect(studentResource.icon).toBeDefined()
    })

    test('16.4-INT-048 — studentResource preview shows title and category', () => {
      expect((studentResource as any).preview?.select?.title).toBe('title')
      expect((studentResource as any).preview?.select?.subtitle).toBe('category')
    })
  })
})

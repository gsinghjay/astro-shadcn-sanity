# Story 16.4: Sanity Schema — `team`, `capstoneStudent`, `studentResource`

Status: review

## Story

As a **platform operator**,
I want **`team`, `capstoneStudent`, and `studentResource` document types in Sanity**,
so that **team data, student rosters, and program resources are managed in the CMS alongside existing content**.

## Acceptance Criteria

1. **Given** the Sanity Studio schema is updated, **when** `capstoneStudent`, `team`, and `studentResource` types are registered, **then** all three types appear in Sanity Studio with correct fields, validation, and preview configurations
2. **Given** a `team` document is created in Studio, **when** setting the `project` reference, **then** it links to an existing `project` document — the `project` schema itself has zero modifications
3. **Given** the `team` document has a `pm` reference, **when** viewing the team preview in Studio, **then** the preview shows `{team name} — PM: {pm name}`
4. **Given** a `team` document with ≤5 members, **when** viewing in Studio, **then** the `assistantPm` field is hidden
5. **Given** the schema is deployed, **when** running `npm run typegen`, **then** TypeScript types are generated for all three new document types without errors
6. **Given** all three schemas follow Sanity best practices, **when** reviewing the implementation, **then** all fields use `defineField` + `defineArrayMember` wrappers, all types have icons from `@sanity/icons`, and validation rules match the epic specification
7. **Given** GROQ queries are added to `lib/sanity.ts`, **when** running `npm run typegen`, **then** typed query result types are generated for `STUDENT_TEAM_QUERY` and `STUDENT_PROGRAM_RESOURCES_QUERY`
8. **Given** the existing test suite, **when** running `npm run test:unit` after all changes, **then** all 641+ existing tests pass with zero regressions AND new schema structure tests validate all three types

## Tasks / Subtasks

- [x] **Task 1: Create `capstoneStudent` document schema** (AC: 1, 6)
  - [x] 1.1 Create `studio/src/schemaTypes/documents/capstone-student.ts` — file name is kebab-case per project convention; type name is `capstoneStudent` (camelCase)
  - [x] 1.2 Fields: `name` (string, required), `email` (string, required, email validation), `semester` (string, options list: `['Spring 2026', 'Fall 2026']`), `githubUsername` (string), `discordUsername` (string)
  - [x] 1.3 Add icon from `@sanity/icons` (e.g., `UsersIcon` or `UserIcon`)
  - [x] 1.4 Preview config: `select: { title: 'name', subtitle: 'email' }`

- [x] **Task 2: Create `team` document schema** (AC: 1, 2, 3, 4, 6)
  - [x] 2.1 Create `studio/src/schemaTypes/documents/team.ts`
  - [x] 2.2 Fields (see Implementation Guide below for full spec):
    - `name` (string, required)
    - `semester` (string, required, options list with radio layout)
    - `project` (reference to `project` — existing schema, ZERO modifications to project)
    - `maxMembers` (number, required, min 2, max 12, initialValue 5)
    - `pm` (reference to `capstoneStudent`, required, description: "Must also be in Members")
    - `assistantPm` (reference to `capstoneStudent`, hidden when members ≤5)
    - `members` (array of references to `capstoneStudent`, required, min 1) — MUST use `defineArrayMember`
    - `githubRepoUrl` (url)
    - `discordChannelUrl` (url)
    - `teamResources` (array of inline objects with `label`, `url`, `category`) — MUST use `defineArrayMember`
  - [x] 2.3 Add icon from `@sanity/icons` (e.g., `UsersIcon`)
  - [x] 2.4 Add field groups: `main` (name, semester, project, maxMembers), `team` (pm, assistantPm, members), `links` (githubRepoUrl, discordChannelUrl, teamResources)
  - [x] 2.5 Preview config with `prepare()`: show `{team name} — PM: {pm name}` in subtitle
  - [x] 2.6 `assistantPm` hidden logic: `hidden: ({ document }) => { const members = (document?.members as unknown[]) ?? []; return members.length <= 5; }`

- [x] **Task 3: Create `studentResource` document schema** (AC: 1, 6)
  - [x] 3.1 Create `studio/src/schemaTypes/documents/student-resource.ts`
  - [x] 3.2 Fields: `title` (string, required), `description` (text, rows: 2), `url` (url, required), `category` (string, options list: `['calendar', 'academic', 'communication', 'development', 'general']`), `sortOrder` (number, initialValue: 0)
  - [x] 3.3 Add icon from `@sanity/icons` (e.g., `DocumentsIcon` or `LinkIcon`)
  - [x] 3.4 Preview config: `select: { title: 'title', subtitle: 'category' }`
  - [x] 3.5 Add ordering definition: `orderings: [{ title: 'Sort Order', name: 'sortOrderAsc', by: [{ field: 'sortOrder', direction: 'asc' }] }]`

- [x] **Task 4: Register schemas in index** (AC: 1)
  - [x] 4.1 Update `studio/src/schemaTypes/index.ts` — import all three new types and add to `schemaTypes` array
  - [x] 4.2 Add in the documents section (after existing document imports like `project`, `event`, etc.)

- [x] **Task 5: Deploy schema and generate types** (AC: 5)
  - [x] 5.1 Run `npx sanity schema deploy` from `studio/` directory
  - [x] 5.2 Run `npm run typegen` from root to regenerate `sanity.types.ts`
  - [x] 5.3 Verify generated types include `CapstoneStudent`, `Team`, `StudentResource` document types
  - [x] 5.4 Verify no TypeScript errors: `npx astro check` or `tsc --noEmit`

- [x] **Task 6: Add GROQ queries to `lib/sanity.ts`** (AC: 7)
  - [x] 6.1 Add `STUDENT_TEAM_QUERY` — find student's team by email, with full project/sponsor/member expansion (see GROQ section below)
  - [x] 6.2 Add `STUDENT_PROGRAM_RESOURCES_QUERY` — all `studentResource` docs ordered by `sortOrder`
  - [x] 6.3 Both queries MUST use `defineQuery(groq\`...\`)` pattern per project convention
  - [x] 6.4 Add async getter functions: `getStudentTeam(email: string)` and `getStudentProgramResources()`
  - [x] 6.5 Export query result types: `export type StudentTeam = NonNullable<STUDENT_TEAM_QUERY_RESULT>` and `export type StudentResource = STUDENT_PROGRAM_RESOURCES_QUERY_RESULT[number]`
  - [x] 6.6 Run `npm run typegen` again after adding queries

- [x] **Task 7: Schema structure tests** (AC: 8)
  - [x] 7.1 Add schema tests in `tests/integration/student-portal-16-4/student-schemas.test.ts`:
    - Verify `capstoneStudent` type exists with expected fields
    - Verify `team` type exists with expected fields and references
    - Verify `studentResource` type exists with expected fields
    - Verify `team.project` references `project` type
    - Verify `team.pm` and `team.members` reference `capstoneStudent`
  - [x] 7.2 Run `npm run test:unit` — 672 tests pass (31 new + 641 existing), zero regressions

- [x] **Task 8: Update Studio desk structure (if needed)** (AC: 1)
  - [x] 8.1 Checked `studio/src/structure/capstone-desk-structure.ts` — uses `S.documentTypeListItems().filter()` auto-discovery
  - [x] 8.2 N/A — desk structure auto-discovers types (only siteSettings + submission are manual)
  - [x] 8.3 Verified: new types will auto-appear in Studio sidebar via auto-discovery

## Dev Notes

### Architecture Context

This story adds the Sanity CMS data model that the entire student portal depends on. Stories 16.5–16.10 all consume these schemas and queries. The architecture decision to use Sanity (not D1) for team/student data was made during the brainstorming session to eliminate ~8 SP of custom admin UI — Osama manages teams in Sanity Studio, PMs manage membership through the portal.

| Decision | Rationale |
|---|---|
| Teams in Sanity (not D1) | Eliminates custom admin UI, leverages Studio for ops |
| `team` → `project` direction | Existing `project` schema stays completely untouched |
| `capstoneStudent` as document | Referenceable by teams, future-proofs profiles |
| Roles from references | PM/APM derived from `team.pm`/`team.assistantPm` — no role field on student |
| D1 for sessions only | Auth tables (16.2) already in D1; team data doesn't need SQL queries |

### Sanity Best Practice Compliance

Per loaded Sanity rules (`sanity-schema`, `sanity-groq`):

1. **`defineType` + `defineField` + `defineArrayMember`**: All three schemas MUST use strict definition syntax. The `team.members` array and `team.teamResources` array MUST wrap items in `defineArrayMember()`.
2. **Icons on every type**: Each document type gets an icon from `@sanity/icons`. This improves Studio UX significantly.
3. **Data over presentation**: Schema models what things ARE (student, team, resource), not how they look. Field names describe content semantics.
4. **References for reusable content**: `capstoneStudent` is a reference type (used by multiple teams). `project` is a reference (existing, shared). Correct per decision matrix.
5. **Validation patterns**: Required fields use `rule.required()`. Email uses `rule.email()`. Number uses `rule.min()/max()`. Array uses `rule.min(1)`.
6. **Preview configurations**: All three types have meaningful preview configs so Studio lists are navigable.
7. **No field deletion**: `project` schema is untouched — zero modifications, zero risk.
8. **Field groups**: `team` document has many fields — organize into groups (`main`, `team`, `links`) for Studio UX.

### Implementation Guide — Schema Specifications

#### `capstoneStudent` (Full Schema)

```typescript
// studio/src/schemaTypes/documents/capstone-student.ts
import {defineType, defineField} from 'sanity'
import {UserIcon} from '@sanity/icons'

export const capstoneStudent = defineType({
  name: 'capstoneStudent',
  title: 'Capstone Student',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'email',
      title: 'Email (@njit.edu)',
      type: 'string',
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: 'semester',
      title: 'Semester',
      type: 'string',
      options: {
        list: ['Spring 2026', 'Fall 2026'],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'githubUsername',
      title: 'GitHub Username',
      type: 'string',
    }),
    defineField({
      name: 'discordUsername',
      title: 'Discord Username',
      type: 'string',
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'email'},
  },
})
```

#### `team` (Full Schema)

```typescript
// studio/src/schemaTypes/documents/team.ts
import {defineType, defineField, defineArrayMember} from 'sanity'
import {UsersIcon} from '@sanity/icons'

export const team = defineType({
  name: 'team',
  title: 'Capstone Team',
  type: 'document',
  icon: UsersIcon,
  groups: [
    {name: 'main', title: 'Main', default: true},
    {name: 'team', title: 'Team'},
    {name: 'links', title: 'Links & Resources'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Team Name',
      type: 'string',
      group: 'main',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'semester',
      title: 'Semester',
      type: 'string',
      group: 'main',
      validation: (rule) => rule.required(),
      options: {
        list: ['Spring 2026', 'Fall 2026'],
        layout: 'radio',
      },
    }),
    defineField({
      name: 'project',
      title: 'Assigned Project',
      type: 'reference',
      group: 'main',
      to: [{type: 'project'}],
    }),
    defineField({
      name: 'maxMembers',
      title: 'Max Team Size',
      type: 'number',
      group: 'main',
      initialValue: 5,
      validation: (rule) => rule.required().min(2).max(12),
    }),
    defineField({
      name: 'pm',
      title: 'Project Manager (PM)',
      type: 'reference',
      group: 'team',
      to: [{type: 'capstoneStudent'}],
      validation: (rule) => rule.required(),
      description: 'Designated student PM — must also be in Members',
    }),
    defineField({
      name: 'assistantPm',
      title: 'Assistant PM',
      type: 'reference',
      group: 'team',
      to: [{type: 'capstoneStudent'}],
      description: 'Available when team has more than 5 members',
      hidden: ({document}) => {
        const members = (document?.members as unknown[]) ?? []
        return members.length <= 5
      },
    }),
    defineField({
      name: 'members',
      title: 'Team Members',
      type: 'array',
      group: 'team',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'capstoneStudent'}],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'githubRepoUrl',
      title: 'GitHub Repository URL',
      type: 'url',
      group: 'links',
    }),
    defineField({
      name: 'discordChannelUrl',
      title: 'Team Discord Channel',
      type: 'url',
      group: 'links',
    }),
    defineField({
      name: 'teamResources',
      title: 'Team Resources & Links',
      type: 'array',
      group: 'links',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'category',
              title: 'Category',
              type: 'string',
              options: {
                list: ['communication', 'development', 'documents', 'general'],
              },
              initialValue: 'general',
            }),
          ],
          preview: {
            select: {title: 'label', subtitle: 'url'},
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {title: 'name', subtitle: 'semester', pm: 'pm.name'},
    prepare({title, subtitle, pm}) {
      return {
        title: title ?? 'Unnamed Team',
        subtitle: `${subtitle ?? ''} — PM: ${pm ?? 'Unassigned'}`,
      }
    },
  },
})
```

#### `studentResource` (Full Schema)

```typescript
// studio/src/schemaTypes/documents/student-resource.ts
import {defineType, defineField} from 'sanity'
import {DocumentsIcon} from '@sanity/icons'

export const studentResource = defineType({
  name: 'studentResource',
  title: 'Student Resource',
  type: 'document',
  icon: DocumentsIcon,
  orderings: [
    {
      title: 'Sort Order',
      name: 'sortOrderAsc',
      by: [{field: 'sortOrder', direction: 'asc'}],
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: ['calendar', 'academic', 'communication', 'development', 'general'],
      },
    }),
    defineField({
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'category'},
  },
})
```

### GROQ Queries

Both queries follow the project convention: `defineQuery(groq\`...\`)`, exported as constants in `lib/sanity.ts`, with async getter functions.

```typescript
// STUDENT_TEAM_QUERY — find the student's team by email
// Note: Does NOT include ($site == "" || site == $site) filter because
// team/capstoneStudent schemas don't have a site field (capstone-only)
export const STUDENT_TEAM_QUERY = defineQuery(groq`
  *[_type == "team" && $email in members[]->email][0]{
    _id,
    name,
    semester,
    maxMembers,
    githubRepoUrl,
    discordChannelUrl,
    project->{
      _id,
      title,
      "slug": slug.current,
      description,
      sponsor->{
        _id,
        name,
        "slug": slug.current,
        logo {
          asset->{ _id, url, metadata { lqip, dimensions } },
          alt
        }
      },
      technologies
    },
    "pm": pm->{ name, email, githubUsername },
    "assistantPm": assistantPm->{ name, email, githubUsername },
    "members": members[]->{ _id, name, email, githubUsername, discordUsername },
    "memberCount": count(members),
    "isPM": pm->email == $email,
    "isAPM": assistantPm->email == $email,
    teamResources[]{ label, url, category }
  }
`);

// STUDENT_PROGRAM_RESOURCES_QUERY — program-wide resources
export const STUDENT_PROGRAM_RESOURCES_QUERY = defineQuery(groq`
  *[_type == "studentResource"] | order(sortOrder asc) {
    _id,
    title,
    description,
    url,
    category
  }
`);
```

**GROQ performance notes** (per `sanity-groq` rules):
- `_type == "team"` is optimizable (uses index)
- `$email in members[]->email` requires reference expansion in filter — this is non-optimizable but acceptable given ~50 teams max per semester. For scale (>500 teams), consider adding a denormalized `memberEmails` string array field.
- `| order(sortOrder asc)` before projection is correct order
- All projections are explicit (no `{ ... }` select-all)
- `$email` param (not string interpolation) for security + caching

**Getter functions:**

```typescript
export async function getStudentTeam(email: string): Promise<STUDENT_TEAM_QUERY_RESULT> {
  const { result } = await loadQuery<STUDENT_TEAM_QUERY_RESULT>({
    query: STUDENT_TEAM_QUERY,
    params: { email },
  });
  return result;
}

export async function getStudentProgramResources(): Promise<STUDENT_PROGRAM_RESOURCES_QUERY_RESULT> {
  const { result } = await loadQuery<STUDENT_PROGRAM_RESOURCES_QUERY_RESULT>({
    query: STUDENT_PROGRAM_RESOURCES_QUERY,
    params: {},
  });
  return result ?? [];
}
```

**Type exports:**

```typescript
export type StudentTeam = NonNullable<STUDENT_TEAM_QUERY_RESULT>;
export type StudentProgramResource = STUDENT_PROGRAM_RESOURCES_QUERY_RESULT[number];
```

### Existing Files to Modify

| File | Change | Notes |
|---|---|---|
| `studio/src/schemaTypes/index.ts` | Import + register 3 new types | Add in documents section |
| `astro-app/src/lib/sanity.ts` | Add 2 GROQ queries + getter functions + type exports | Follow existing `defineQuery(groq\`...\`)` pattern |
| `astro-app/sanity.types.ts` | Regenerated by `npm run typegen` | Do not hand-edit |

### New Files to Create

| File | Purpose |
|---|---|
| `studio/src/schemaTypes/documents/capstone-student.ts` | `capstoneStudent` document schema |
| `studio/src/schemaTypes/documents/team.ts` | `team` document schema |
| `studio/src/schemaTypes/documents/student-resource.ts` | `studentResource` document schema |

### Files NOT to Touch

| File | Why |
|---|---|
| `studio/src/schemaTypes/documents/project.ts` | Existing project schema — zero modifications (team references project, not vice versa) |
| `studio/src/schemaTypes/documents/sponsor.ts` | Not affected by student portal schemas |
| `astro-app/src/middleware.ts` | Auth middleware — complete from Story 16.3 |
| `astro-app/src/pages/student/index.astro` | Placeholder page — replaced in Story 16.5 |
| `astro-app/src/lib/student-auth.ts` | Better Auth factory — unchanged |
| `astro-app/src/lib/db.ts` | D1 helpers — unchanged |

### Project Structure Notes

- Schema files follow kebab-case naming: `capstone-student.ts`, `team.ts`, `student-resource.ts`
- Type names follow camelCase: `capstoneStudent`, `team`, `studentResource`
- Studio formatting: `semi: false`, `singleQuote: true`, `bracketSpacing: false`, `printWidth: 100`
- astro-app formatting: `singleQuote: true`, `trailingComma: "all"`, `printWidth: 120`
- GROQ queries go in `astro-app/src/lib/sanity.ts` — never inline in page/component files
- These schemas are **capstone-only** (no `site` field) — they don't participate in multi-site filtering

### Testing Requirements

**Schema structure tests** (Vitest, integration layer):
- Verify all three document types exist in the exported `schemaTypes` array
- Verify `team.project` reference targets `project` type
- Verify `team.pm` and `team.members` reference `capstoneStudent` type
- Verify field counts and required field names for each type
- Follow existing pattern in `tests/integration/schema-validation.test.ts` if it exists, otherwise create

**TypeGen validation:**
- After `npm run typegen`, verify `sanity.types.ts` contains `CapstoneStudent`, `Team`, `StudentResource` interfaces
- Run `npx astro check` to verify zero type errors

**Regression:**
- `npm run test:unit` — all 641+ tests pass, zero regressions

### Previous Story Intelligence (16.3)

Key learnings from 16.3 that apply:

1. **Pre-existing E2E failure**: `@vitest/expect` Symbol conflict with Playwright crashes E2E before any test runs. This is NOT a regression — same failure on clean state. Don't let this block story completion.
2. **641 tests currently pass** (`npm run test:unit`): This is the baseline. All must still pass after 16.4.
3. **`env.d.ts` already has auth bindings**: `user` type includes `role: 'sponsor' | 'student'` and `name?: string` from 16.3. No changes needed for auth types.
4. **Student pages are SSR**: All `/student/*` pages must have `export const prerender = false`. This is already established (16.3 placeholder page + middleware).
5. **Portal Layout fork needed in 16.5**: The `PortalLayout.astro` pattern (sidebar nav, user display, mobile Sheet drawer) will be forked for `StudentLayout.astro` in Story 16.5 — NOT in this story.

### Git Intelligence

Recent commits on `feat/16-3-dual-auth-middleware-integration` branch:
```
3036975 chore: add sign-out button to placeholder student page
596746a chore: update story 16.3 with preview testing findings and file list
8e36668 fix: use absolute URL for auth client in student login page
a068406 fix: redirect unauthenticated students to login page instead of API endpoint
afa26de chore: add placeholder student page for middleware auth testing (Story 16.3)
a77eea3 fix: address code review findings for dual-auth middleware (Story 16.3)
1ff8764 feat: add dual-auth middleware for sponsor + student routes (Story 16.3)
```

**Branch convention**: `feat/{story-key}` (e.g., `feat/16-4-sanity-schema-team-capstone-student-resource`)
**Commit convention**: `feat:`, `fix:`, `chore:` with `(Story X.Y)` suffix

### Dependency Check

| Dependency | Status | Notes |
|---|---|---|
| Story 16.3 (middleware) | **done** | Middleware handles `/student/*` auth — schemas don't depend on auth at runtime but are logically downstream |
| Sanity Studio v5 | installed `^5.10.0` | `defineType`, `defineField`, `defineArrayMember` available |
| `@sanity/icons` | installed | Icon imports available |
| `groq` ^5.8.1 | installed | `defineQuery` available |
| Existing `project` schema | **untouched** | Team references project, not vice versa |

### References

- [Source: Epic 16 — Story 16.4 ACs + Schema Specs](/_bmad-output/planning-artifacts/epics/epic-16-student-authentication-portal.md)
- [Source: Epic 16 — Architecture Decisions table](/_bmad-output/planning-artifacts/epics/epic-16-student-authentication-portal.md#architecture-decisions-from-brainstorming-session-2026-03-01)
- [Source: Epic 16 — GROQ Queries](/_bmad-output/planning-artifacts/epics/epic-16-student-authentication-portal.md#groq-queries)
- [Source: project-context.md — Schema Rules](/_bmad-output/project-context.md)
- [Sanity Rule: sanity-schema — defineType + defineField + defineArrayMember](via MCP get_sanity_rules)
- [Sanity Rule: sanity-groq — defineQuery + performance](via MCP get_sanity_rules)
- [Sanity Rule: sanity-astro — data fetching patterns](via MCP get_sanity_rules)

## Dev Agent Record

### Agent Model Used

Claude Opus 4.6

### Debug Log References

None — clean implementation, no blockers.

### Completion Notes List

- Created 3 Sanity document schemas: `capstoneStudent`, `team`, `studentResource`
- All schemas use `defineType`, `defineField`, `defineArrayMember` per project convention
- All schemas have icons from `@sanity/icons` and meaningful preview configs
- `team` schema: field groups (main/team/links), `assistantPm` hidden when members ≤ 5, preview with `prepare()` showing PM name
- `team.project` references existing `project` schema — zero modifications to project
- Schema deployed to Content Lake (both workspaces)
- TypeGen produces `CapstoneStudent`, `Team`, `StudentResource` types + `STUDENT_TEAM_QUERY_RESULT`, `STUDENT_PROGRAM_RESOURCES_QUERY_RESULT` query result types
- Fixed GROQ projection: story spec had `technologies` but actual project field is `technologyTags`
- Fixed GROQ projection: added missing `hotspot, crop` to sponsor logo in `STUDENT_TEAM_QUERY` (found during code review — matches pattern used by all other sponsor queries)
- GROQ queries have no `site` filter — student portal types are capstone-only
- Desk structure auto-discovers new types via `S.documentTypeListItems().filter()`
- 31 new schema tests pass, 672 total tests pass (zero regressions)

### File List

**New files:**
- `studio/src/schemaTypes/documents/capstone-student.ts` — capstoneStudent document schema
- `studio/src/schemaTypes/documents/team.ts` — team document schema
- `studio/src/schemaTypes/documents/student-resource.ts` — studentResource document schema
- `tests/integration/student-portal-16-4/student-schemas.test.ts` — 31 schema structure tests

**Modified files:**
- `studio/src/schemaTypes/index.ts` — import + register 3 new types
- `astro-app/src/lib/sanity.ts` — 2 GROQ queries + getter functions + type exports + imports
- `astro-app/src/sanity.types.ts` — regenerated by typegen (19 queries, 53 schema types)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status: in-progress → review

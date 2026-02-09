# Story 2.2b: Remaining Pages GROQ Queries & Data Fetching

Status: draft

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want typed GROQ queries that fetch content for all remaining pages from Sanity,
So that the entire site renders CMS-driven content instead of placeholder data.

## Acceptance Criteria

1. `astro-app/src/lib/sanity.ts` exports typed GROQ query functions for all remaining page types (about, sponsors, projects, contact, generic pages)
2. Each page query projects base fields (backgroundVariant, spacing, maxWidth) plus type-specific fields for all 6 remaining block types (richText, faqSection, contactForm, sponsorCards, timeline, teamGrid)
3. All remaining pages are updated to fetch content from Sanity instead of importing placeholder data
4. `astro-app/src/lib/types.ts` is updated to reflect Sanity query result types for remaining blocks
5. Remaining block components are updated to accept Sanity field names
6. `astro-app/src/lib/data/` directory (placeholder data) is removed entirely
7. Seed content is created in Sanity Studio for remaining pages
8. All pages render correctly from Sanity content
9. All GROQ queries are defined in `lib/sanity.ts` — no inline queries in pages or components

## Tasks / Subtasks

- [ ] Task 1: Update types.ts for remaining blocks (AC: #4)
  - [ ] 1.1 Update `RichText` type: add `content` (portable text)
  - [ ] 1.2 Update `FaqSection` type: add `heading`, `items[]` with `question`/`answer`
  - [ ] 1.3 Update `ContactForm` type: add `heading`, `description`, `successMessage`
  - [ ] 1.4 Update `SponsorCards` type: add `heading`, `displayMode`, `sponsors[]` (sponsor refs)
  - [ ] 1.5 Update `Timeline` type: add `heading`, `autoPopulate`, `events[]` (event refs)
  - [ ] 1.6 Update `TeamGrid` type: add `heading`, `useDocumentRefs`, `teams[]` (team refs), `members[]` (inline objects)
  - [ ] 1.7 Ensure `Page` type block union includes all 12 block types

- [ ] Task 2: Add GROQ query projections for remaining blocks (AC: #1, #2, #9)
  - [ ] 2.1 Add block projections for richText, faqSection, contactForm
  - [ ] 2.2 Add block projections for sponsorCards with sponsor reference expansion (name, logo, website, tier, featured)
  - [ ] 2.3 Add block projections for timeline with event reference expansion
  - [ ] 2.4 Add block projections for teamGrid with team reference expansion and inline member support
  - [ ] 2.5 Ensure `getPage(slug)` query covers all 12 block types

- [ ] Task 3: Update remaining block components to accept Sanity field names (AC: #5)
  - [ ] 3.1 Update `RichText.astro` — render portable text content
  - [ ] 3.2 Update `FaqSection.astro` — accept `heading`, `items[]`
  - [ ] 3.3 Update `ContactForm.astro` — accept `heading`, `description`, `successMessage`
  - [ ] 3.4 Update `SponsorCards.astro` — accept sponsor refs with `displayMode` filtering
  - [ ] 3.5 Update `Timeline.astro` — accept event refs or auto-populated events
  - [ ] 3.6 Update `TeamGrid.astro` — accept team refs or inline members based on `useDocumentRefs` toggle

- [ ] Task 4: Wire remaining pages to Sanity (AC: #3, #8)
  - [ ] 4.1 Update `about.astro` to fetch from Sanity
  - [ ] 4.2 Update `sponsors.astro` (listing page) to fetch from Sanity
  - [ ] 4.3 Update `projects.astro` (listing page) to fetch from Sanity
  - [ ] 4.4 Update `contact.astro` to fetch from Sanity
  - [ ] 4.5 Update any generic/dynamic page routes to fetch from Sanity

- [ ] Task 5: Clean up placeholder data (AC: #6)
  - [ ] 5.1 Verify no pages still import from `astro-app/src/lib/data/`
  - [ ] 5.2 Delete `astro-app/src/lib/data/` directory entirely
  - [ ] 5.3 Remove any unused type exports from types.ts

- [ ] Task 6: Create seed content for remaining pages (AC: #7)
  - [ ] 6.1 Create about page document with blocks in Sanity
  - [ ] 6.2 Create sponsors listing page document
  - [ ] 6.3 Create projects listing page document
  - [ ] 6.4 Create contact page document with contactForm block
  - [ ] 6.5 Create any additional sponsor/team/event documents needed for reference blocks

- [ ] Task 7: Verify end-to-end (AC: #8)
  - [ ] 7.1 Run `npm run dev` — verify all pages render from Sanity data
  - [ ] 7.2 Verify no 404s or missing content across the site
  - [ ] 7.3 Run `npm run build` from root — verify full build succeeds
  - [ ] 7.4 Run `npm run test:integration` — existing tests still green

## Dev Notes

### Scope Note

This story completes the work deferred from Story 2.2 (which was scoped to homepage only). Depends on:
- Story 2.1b (remaining 6 block schemas)
- Story 2.2 (homepage wiring — establishes GROQ query patterns and Sanity client usage)
- Story 3.1 (sponsor documents — needed for sponsorCards and logoCloud)
- Epics 3-4 document schemas may NOT exist yet — timeline (event refs) and teamGrid (team refs) may render with empty reference pickers, same forward-reference pattern

### Dependencies

- **Requires:** Story 2.1b, Story 2.2, Story 3.1
- **Optional:** Stories 4.1 (team docs), 4.2 (event docs) — reference blocks work without them but pickers will be empty

### References

- See Story 2.2 Dev Notes for GROQ query patterns, Sanity client config, and anti-patterns — they apply identically here.
- [Source: _bmad-output/planning-artifacts/epics.md — Story 2.2 acceptance criteria (full scope)]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

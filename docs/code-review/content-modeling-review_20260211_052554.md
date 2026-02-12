# Content Modeling Review

Analysis of the current Sanity schema against content modeling best practices, with actionable recommendations.

## Current Strengths

The project already follows several best practices:

- **`button` object** — reused across `heroBanner`, `ctaBanner`, `sponsorSteps`
- **`seo` object** — shared SEO fields on `page`
- **`portableText` object** — shared rich text config
- **`defineBlock` helper** — consistent base fields across all 11 blocks
- **`sponsor` as a document** — correctly referenced (not embedded) by `logoCloud` and `sponsorCards`
- **Type safety** — end-to-end from schema → GROQ → components via TypeGen
- **Auto-discovery** — block registry auto-discovers new components (no manual registration)
- **Smart projections** — `select()` and conditional projections in GROQ reduce over-fetching

## Schema Overview

### Document Types (3)

| Type | Purpose |
|------|---------|
| `page` | Primary content document with page builder |
| `siteSettings` | Singleton for global site config |
| `sponsor` | Referenced by logo cloud and sponsor card blocks |

### Object Types (3)

| Type | Used By |
|------|---------|
| `seo` | `page` |
| `button` | `heroBanner`, `ctaBanner`, `sponsorSteps` |
| `portableText` | `textWithImage`, `richText` |

### Block Types (11)

All blocks use the `defineBlock` helper which injects `blockBaseFields` (backgroundVariant, spacing, maxWidth).

| Block | Category | Key Fields |
|-------|----------|------------|
| `heroBanner` | Heroes | heading, subheading, backgroundImages, ctaButtons, alignment |
| `richText` | Content | content (portableText) |
| `textWithImage` | Content | heading, content, image, imagePosition |
| `faqSection` | Content | heading, items (question + answer) |
| `statsRow` | Media & Stats | heading, stats (value + label + description) |
| `featureGrid` | Media & Stats | heading, items (icon + image + title + description), columns |
| `sponsorCards` | Social Proof | heading, displayMode, sponsors (references) |
| `logoCloud` | Social Proof | heading, autoPopulate, sponsors (references) |
| `sponsorSteps` | Social Proof | heading, subheading, items (title + description + list), ctaButtons |
| `ctaBanner` | CTAs | heading, description, ctaButtons |
| `contactForm` | CTAs | heading, description, successMessage |

---

## Opportunities by Pattern

### 1. Separation of Content and Presentation

**Principle:** Model content by meaning, not visual appearance. Field names should survive a complete redesign.

#### blockBaseFields use presentation-focused naming

| Current (presentation) | Recommended (semantic) | Rationale |
|---|---|---|
| `backgroundVariant: 'white' \| 'light' \| 'dark' \| 'primary'` | `emphasis: 'minimal' \| 'standard' \| 'strong' \| 'branded'` | Describes intent, not color |
| `spacing: 'none' \| 'small' \| 'default' \| 'large'` | `density: 'compact' \| 'standard' \| 'comfortable' \| 'spacious'` | Describes content density, not pixels |
| `maxWidth: 'narrow' \| 'default' \| 'full'` | `scope: 'focused' \| 'standard' \| 'wide'` | Describes content scope, not CSS |

**Test:** "If we redesigned the site, would these field names still make sense?"
- `backgroundVariant: 'dark'` — fails if the dark theme becomes a gradient
- `emphasis: 'strong'` — works regardless of visual treatment

#### Other presentation-focused fields

- `heroBanner.alignment` (`left | center | right`) — layout concern
- `textWithImage.imagePosition` (`left | right`) — layout concern
- `featureGrid.columns` (`2 | 3 | 4`) — layout concern

Consider whether these need editor control or could be derived from the page `template` field.

### 2. Missed Reuse — Extract Shared Objects

**Principle:** Extract common fields into reusable definitions. Avoid content duplication.

#### siteSettings.ctaButton duplicates `button` type

`siteSettings.ctaButton` is an inline object with `text` + `url`, but the `button` object type already exists. Replace the inline definition with:

```typescript
defineField({ name: 'ctaButton', type: 'button' })
```

#### Inline objects that should be extracted

| Inline Object | Currently In | Proposed Type | Fields |
|---|---|---|---|
| FAQ item | `faqSection` | `faqItem` | question, answer |
| Feature item | `featureGrid` | `featureItem` | icon, image, title, description |
| Stat item | `statsRow` | `statItem` | value, label, description |
| Step item | `sponsorSteps` | `stepItem` | title, description, list |
| Link | siteSettings (4 places) | `link` | label, href, external, children? |

The `link` object alone would consolidate **4 separate inline definitions** in siteSettings:
- `navigationItems`
- `footerLinks`
- `resourceLinks`
- `programLinks`

#### Shared field sets pattern

Consider extracting a `headingFields` helper similar to `blockBaseFields`:

```typescript
export const headingFields = [
  defineField({ name: 'heading', type: 'string' }),
  defineField({ name: 'subheading', type: 'string' }),
]
```

This would standardize the heading pattern used across most blocks.

### 3. Reference vs Embedding Decisions

**Principle:** Reference when content is reusable and needs central management. Embed when content is unique to a document.

#### Currently correct

- **Blocks as embedded objects** in the page builder (correct — blocks are page-specific)
- **`sponsor` as a referenced document** (correct — reused across logoCloud and sponsorCards)
- **`page` referenced in portableText internal links** (correct)

#### Worth reconsidering

| Content | Current | Consider | When |
|---|---|---|---|
| FAQ items | Embedded in `faqSection` | `faq` document with references | If same Q&A appears on multiple pages |
| Feature items | Embedded in `featureGrid` | `feature` document with references | If features are shown on multiple pages |
| Testimonials (future) | N/A | Document type with references | If adding social proof content |

**Decision criteria:**
- Is it reused across pages? → Reference
- Does it have its own lifecycle? → Reference
- Is it always page-specific? → Keep embedded

#### Hybrid approach for overrides

If FAQ items become references, allow per-page overrides:

```typescript
defineField({
  name: 'items',
  type: 'array',
  of: [{
    type: 'object',
    fields: [
      defineField({ name: 'faq', type: 'reference', to: [{ type: 'faq' }] }),
      defineField({ name: 'overrideAnswer', type: 'portableText', description: 'Optional: override answer for this page' }),
    ]
  }]
})
```

Query uses `coalesce(overrideAnswer, faq->answer)`.

### 4. Taxonomy and Classification

**Principle:** Centralize classification for consistent tagging and filtering.

The project currently has **no taxonomy system**. This is appropriate for a purely page-based site, but consider adding taxonomy if expanding to:

- Blog posts or articles
- Resources or downloads
- Events or programs
- Any filterable content listing

**Recommended starter taxonomy:**

```typescript
// Flat taxonomy for tags
defineType({
  name: 'tag',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
  ]
})

// Hierarchical taxonomy for categories
defineType({
  name: 'category',
  type: 'document',
  fields: [
    defineField({ name: 'title', type: 'string' }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'title' } }),
    defineField({ name: 'parent', type: 'reference', to: [{ type: 'category' }] }),
  ]
})
```

### 5. Frontend Gaps Affecting the Content Model

These issues mean editors can configure things in the Studio that have no effect on the frontend.

#### blockBaseFields not implemented in components

All 11 blocks have `backgroundVariant`, `spacing`, and `maxWidth` fields, but most components **ignore them**. Editors can set these values but see no visual change.

**Options:**
- **Implement them** — add CSS class mapping in each block component
- **Remove them** — delete from `defineBlock` helper if unused
- **Implement in wrapper** — handle in `BlockRenderer.astro` so all blocks get the styling automatically

#### faqSection.answer is plain text

`faqSection` items use `text` (plain text) for the answer field, while the rest of the project uses `portableText` for rich content. This prevents formatting (links, bold, lists) in FAQ answers.

**Fix:** Change `answer` field type from `text` to `portableText`.

#### RichText block has naive Portable Text parsing

`RichText.astro` manually maps block types to HTML, losing marks (bold, italic, links). `TextWithImage.astro` correctly uses `astro-portabletext`.

**Fix:** Replace manual parsing in `RichText.astro` with the `PortableText` component.

---

## Prioritized Recommendations

### Quick Wins (Low effort, immediate value)

| # | Change | Files Affected | Impact |
|---|---|---|---|
| 1 | Extract `link` object, reuse across siteSettings | `objects/link.ts`, `documents/site-settings.ts`, `index.ts` | Eliminates 4 inline duplicates |
| 2 | Use `button` type for siteSettings.ctaButton | `documents/site-settings.ts` | Consistency with existing pattern |
| 3 | Change `faqSection.answer` to `portableText` | `blocks/faq-section.ts`, `FaqSection.astro` | Better content capability |
| 4 | Fix RichText.astro to use PortableText component | `blocks/custom/RichText.astro` | Correct rendering |

### Medium Effort (Schema + frontend changes)

| # | Change | Files Affected | Impact |
|---|---|---|---|
| 5 | Rename blockBaseFields to semantic names | `objects/block-base.ts`, GROQ queries, all block components | Future-proofs the model |
| 6 | Implement blockBaseFields in BlockRenderer wrapper | `BlockRenderer.astro`, CSS | Editors see effect of their choices |
| 7 | Extract `faqItem`, `featureItem`, `statItem`, `stepItem` objects | New object files, block schemas, `index.ts` | Cleaner schemas, potential reuse |

### Future Considerations (When scope expands)

| # | Change | When |
|---|---|---|
| 8 | Add `category` and `tag` document types | When adding blog, resources, or filterable content |
| 9 | Promote FAQ items to document type with references | When same FAQs appear on multiple pages |
| 10 | Add `testimonial` document type | When adding social proof beyond sponsors |

---

## Migration Notes

For any schema rename (e.g., blockBaseFields):

1. Update schema files in `studio/src/schemaTypes/`
2. Run `npm run typegen` to regenerate types
3. Update GROQ queries in `astro-app/src/lib/sanity.ts`
4. Update component props and field access
5. Update test fixtures in `__fixtures__/`
6. Deploy schema: `npx sanity schema deploy` from `studio/`
7. Migrate existing content if field names changed (Sanity migration script)

For extracted object types:

1. Create new object type file in `studio/src/schemaTypes/objects/`
2. Register in `studio/src/schemaTypes/index.ts`
3. Replace inline definitions in block/document schemas
4. Run `npm run typegen`
5. Deploy schema
6. Existing content should migrate automatically if field structure matches

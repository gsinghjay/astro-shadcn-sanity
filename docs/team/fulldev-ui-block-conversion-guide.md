# fulldev/ui Block Conversion Guide

A step-by-step guide for converting fulldev/ui Astro components into Sanity-managed blocks. No prior Sanity or GROQ experience required.

## What You Are Doing

The project has **102 fulldev/ui block components** (marketing sections like heroes, CTAs, feature grids) that already render in the browser. Right now, the content inside them can only be changed by editing code. Your job is to make each block **editable from Sanity Studio** (a web-based CMS) so that content editors can add, remove, and configure these blocks on any page without touching code.

For each block, you will create:

1. A **Sanity schema** — tells the CMS what fields the block has (headings, images, links, etc.)
2. A **schema registration** — makes the CMS aware of the new block
3. A **page schema entry** — lets editors add the block to pages
4. A **GROQ projection** — tells the API which fields to return when fetching the block
5. A **TypeScript type** — keeps the frontend type-safe

You do **NOT** modify the Astro component files. They already work.

## Project Layout

```
astro-shadcn-sanity/
├── astro-app/                    # Frontend (Astro)
│   └── src/
│       ├── components/
│       │   ├── blocks/           # fulldev/ui blocks (YOUR components)
│       │   │   ├── hero-1.astro
│       │   │   ├── cta-1.astro
│       │   │   └── ...102 total
│       │   └── BlockRenderer.astro  # Dispatches blocks (DO NOT EDIT)
│       └── lib/
│           ├── sanity.ts         # GROQ queries (YOU ADD projections here)
│           └── types.ts          # TypeScript types (YOU ADD types here)
│
└── studio/                       # Sanity CMS
    └── src/
        └── schemaTypes/
            ├── blocks/           # Block schemas (YOU CREATE files here)
            ├── documents/
            │   └── page.ts       # Page schema (YOU ADD block types here)
            ├── helpers/
            │   └── defineBlock.ts # Helper function (DO NOT EDIT)
            ├── objects/
            │   └── block-base.ts # Shared base fields (DO NOT EDIT)
            └── index.ts          # Schema registry (YOU ADD imports here)
```

## The 7-Step Process

Every block follows the same process. The walkthrough below uses `stats-1` as a worked example.

### Step 1: Read the Component and Extract Its Props

Open the `.astro` file and find the `interface Props` block in the frontmatter (between the `---` fences).

**File:** `astro-app/src/components/blocks/stats-1.astro`

```typescript
interface Props {
  class?: string
  id?: string
  links?: {
    icon?: string
    text?: string
    href?: string
    target?: string
  }[]
  items?: {
    title?: string
    description?: string
  }[]
}
```

**What to note:**

- `class` and `id` are layout props — **skip these**, they are not CMS content
- `links` is an optional array of button/link objects
- `items` is an optional array with `title` and `description`
- Some components have a `<slot />` tag in the template — this renders inline text content. Map this to a `content` field (portable text or string) in your schema

**Write down your field map:**

| Component Prop | Sanity Field | Sanity Type |
|----------------|-------------|-------------|
| `links` | `links` | `array` of objects |
| `items` | `items` | `array` of objects |
| `<slot />` | `content` | `array` of `block` (portable text) |

### Step 2: Create the Sanity Schema File

Create a new file in `studio/src/schemaTypes/blocks/`.

**File naming rule:** The file name matches the component name. `stats-1.astro` becomes `stats-1.ts`.

**File:** `studio/src/schemaTypes/blocks/stats-1.ts`

```typescript
import {defineField} from 'sanity'
import {defineBlock} from '../helpers/defineBlock'

export const stats1 = defineBlock({
  name: 'stats-1',
  title: 'Stats 1',
  preview: {select: {title: 'content'}},
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [{type: 'block'}],
      description: 'Heading and body text displayed above the stats',
    }),
    defineField({
      name: 'links',
      title: 'Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'text', title: 'Text', type: 'string'}),
            defineField({name: 'href', title: 'URL', type: 'url'}),
            defineField({name: 'icon', title: 'Icon', type: 'string'}),
            defineField({
              name: 'target',
              title: 'Target',
              type: 'string',
              options: {list: ['_blank', '_self']},
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'title', title: 'Title', type: 'string'}),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'string',
            }),
          ],
        },
      ],
    }),
  ],
})
```

**Key rules:**

- Always import `defineField` from `'sanity'` and `defineBlock` from `'../helpers/defineBlock'`
- `defineBlock` automatically adds three base fields (`backgroundVariant`, `spacing`, `maxWidth`) — you do not add those yourself
- The `name` value MUST exactly match the key in the `fulldotdevBlocks` map in `BlockRenderer.astro` (e.g., `'stats-1'`)
- The export variable name uses camelCase with no hyphens (e.g., `stats1`)

### Step 3: Register the Schema

Add your import and registration to the schema index file.

**File:** `studio/src/schemaTypes/index.ts`

Add the import at the top with the other block imports:

```typescript
// Block schemas — fulldev/ui (Story 2.8)
import {stats1} from './blocks/stats-1'
```

Add the variable to the `schemaTypes` array:

```typescript
export const schemaTypes: SchemaTypeDefinition[] = [
  // ... existing entries ...
  // Blocks — fulldev/ui
  stats1,
]
```

### Step 4: Add to the Page Schema's blocks[] Array

This lets content editors add your block when building a page.

**File:** `studio/src/schemaTypes/documents/page.ts`

Find the `blocks` field's `of` array and add your type:

```typescript
defineField({
  name: 'blocks',
  title: 'Page Blocks',
  type: 'array',
  of: [
    // ... existing block types ...
    {type: 'stats-1'},
  ],
  // ...
})
```

### Step 5: Add the GROQ Projection

GROQ is the query language Sanity uses. A "projection" tells the API which fields to return for your block.

**File:** `astro-app/src/lib/sanity.ts`

Find the `pageBySlugQuery` and add a type-conditional projection inside the `blocks[]{}` section:

```groq
_type == "stats-1" => {
  content[]{...},
  links[]{ _key, text, href, icon, target },
  items[]{ _key, title, description }
},
```

**GROQ rules:**

- The `_type` string must exactly match your schema `name`
- For arrays of objects, use `[]{ field1, field2 }` to project each item
- For portable text (rich text), use `[]{...}` to return all content
- For images, use `image{ asset->{ _id, url }, alt }` to dereference the asset
- `_key` is automatically generated by Sanity for array items — always include it

### Step 6: Add the TypeScript Type

**File:** `astro-app/src/lib/types.ts`

Add a type interface for your block. Follow the existing pattern:

```typescript
export interface Stats1Block extends BlockBase {
  _type: 'stats-1';
  _key: string;
  content?: PortableTextBlock[];
  links?: {
    _key: string;
    text?: string;
    href?: string;
    icon?: string;
    target?: string;
  }[];
  items?: {
    _key: string;
    title?: string;
    description?: string;
  }[];
}
```

Then add it to the `PageBlock` union at the bottom of the file:

```typescript
export type PageBlock =
  | HeroBannerBlock
  | FeatureGridBlock
  // ... existing types ...
  | Stats1Block;
```

**Type rules:**

- `_type` must be a string literal matching your schema name exactly
- `_key` is always `string`
- Extend `BlockBase` to inherit the base field types
- Make fields optional (`?`) if they are optional in the component's `Props`

### Step 7: Verify

1. **Start Sanity Studio:** `cd studio && npm run dev` — check for schema errors in the terminal
2. **Add the block to a page:** Open Studio in the browser, edit any page, click "Add block", find your block, fill in some test content
3. **Build the frontend:** `cd astro-app && npm run build` — check for TypeScript or build errors
4. **Run integration tests:** `npm run test:integration` from the root — make sure existing tests still pass

## Handling Common Prop Patterns

### The `<slot />` Pattern

Many fulldev/ui components use `<slot />` to render inline content (headings, paragraphs). Example from `hero-1.astro`:

```astro
<SectionProse class="text-center text-balance" size="lg">
  <slot />
</SectionProse>
```

Since Sanity blocks are data-driven (no children), map `<slot />` to a **portable text field** named `content`:

```typescript
defineField({
  name: 'content',
  title: 'Content',
  type: 'array',
  of: [{type: 'block'}],
})
```

In the GROQ projection:

```groq
content[]{...},
```

In the TypeScript type:

```typescript
content?: PortableTextBlock[];
```

### The `links` Pattern (Button Arrays)

Almost every component has a `links` prop for action buttons:

```typescript
links?: {
  icon?: string
  text?: string
  href?: string
  target?: string
}[]
```

Schema:

```typescript
defineField({
  name: 'links',
  title: 'Links',
  type: 'array',
  of: [
    {
      type: 'object',
      fields: [
        defineField({name: 'text', title: 'Text', type: 'string'}),
        defineField({name: 'href', title: 'URL', type: 'url', validation: (Rule) => Rule.uri({allowRelative: true})}),
        defineField({name: 'icon', title: 'Icon', type: 'string'}),
        defineField({name: 'target', title: 'Target', type: 'string', options: {list: ['_blank', '_self']}}),
      ],
    },
  ],
})
```

### The `image` Pattern (Single Image)

```typescript
image?: {
  src: string
  alt: string
}
```

Schema:

```typescript
defineField({
  name: 'image',
  title: 'Image',
  type: 'image',
  options: {hotspot: true},
  fields: [
    defineField({name: 'alt', title: 'Alt Text', type: 'string', validation: (Rule) => Rule.required()}),
  ],
})
```

GROQ projection:

```groq
image{ asset->{ _id, url }, alt }
```

TypeScript:

```typescript
image?: SanityImageWithAlt;
```

### The `logos` Pattern (Image Arrays)

```typescript
logos?: {
  src: string
  alt: string
  text?: string
  href?: string
}[]
```

Schema:

```typescript
defineField({
  name: 'logos',
  title: 'Logos',
  type: 'array',
  of: [
    {
      type: 'object',
      fields: [
        defineField({name: 'src', title: 'Image URL', type: 'url'}),
        defineField({name: 'alt', title: 'Alt Text', type: 'string'}),
        defineField({name: 'text', title: 'Text', type: 'string'}),
        defineField({name: 'href', title: 'Link', type: 'url', validation: (Rule) => Rule.uri({allowRelative: true})}),
      ],
    },
  ],
})
```

### The `items` Pattern (Card/Tile Arrays)

Many components render grids of cards:

```typescript
items?: {
  title?: string
  description?: string
  icon?: string
  image?: { src: string; alt: string }
}[]
```

Schema:

```typescript
defineField({
  name: 'items',
  title: 'Items',
  type: 'array',
  of: [
    {
      type: 'object',
      fields: [
        defineField({name: 'title', title: 'Title', type: 'string'}),
        defineField({name: 'description', title: 'Description', type: 'text'}),
        defineField({name: 'icon', title: 'Icon', type: 'string'}),
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({name: 'alt', title: 'Alt Text', type: 'string'}),
          ],
        }),
      ],
    },
  ],
})
```

### The `link` Pattern (Single Link/Badge)

Some components have a single link (often rendered as a badge):

```typescript
link?: {
  text?: string
  href?: string
  icon?: string
  target?: string
}
```

Schema (single object, NOT an array):

```typescript
defineField({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({name: 'text', title: 'Text', type: 'string'}),
    defineField({name: 'href', title: 'URL', type: 'url', validation: (Rule) => Rule.uri({allowRelative: true})}),
    defineField({name: 'icon', title: 'Icon', type: 'string'}),
    defineField({name: 'target', title: 'Target', type: 'string', options: {list: ['_blank', '_self']}}),
  ],
})
```

### Nested Object Props

Some components have deeply nested props. Example from `cta-1.astro`:

```typescript
item?: {
  images?: {
    src: string
    alt: string
  }[]
  rating?: number
  description?: string
}
```

Schema — use a nested object:

```typescript
defineField({
  name: 'item',
  title: 'Item',
  type: 'object',
  fields: [
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({name: 'src', title: 'Image URL', type: 'url'}),
            defineField({name: 'alt', title: 'Alt Text', type: 'string'}),
          ],
        },
      ],
    }),
    defineField({name: 'rating', title: 'Rating', type: 'number'}),
    defineField({name: 'description', title: 'Description', type: 'string'}),
  ],
})
```

## Sanity Field Type Quick Reference

Use this table to map TypeScript types from component props to Sanity schema types:

| TypeScript Type | Sanity Type | Notes |
|----------------|-------------|-------|
| `string` | `'string'` | Single-line text |
| `string` (long) | `'text'` | Multi-line text (use for descriptions) |
| `number` | `'number'` | |
| `boolean` | `'boolean'` | |
| `string` (url) | `'url'` | Add `validation: (Rule) => Rule.uri({allowRelative: true})` for internal links |
| `string` (enum) | `'string'` with `options: {list: [...]}` | Dropdown in Studio |
| Inline text / `<slot />` | `'array'` of `{type: 'block'}` | Portable text (rich text) |
| Image `{src, alt}` | `'image'` with alt field | Use `options: {hotspot: true}` |
| Array of objects | `'array'` of `{type: 'object', fields: [...]}` | |
| Nested object | `'object'` with `fields: [...]` | |

## Shared Files — Merge Strategy

All 5 developers edit the same 4 files. Follow these rules to avoid painful merge conflicts:

| File | What You Add | Where |
|------|-------------|-------|
| `studio/src/schemaTypes/index.ts` | Import + array entry | Add your imports in a labeled comment block (e.g., `// Story 2.8 blocks`). Add entries at the end of the `schemaTypes` array. |
| `studio/src/schemaTypes/documents/page.ts` | `{type: 'your-block'}` | Add to the end of the `blocks` field's `of` array. |
| `astro-app/src/lib/sanity.ts` | GROQ projection | Add your `_type == "your-block" => {...}` blocks at the end of the `blocks[]{}` section. |
| `astro-app/src/lib/types.ts` | Interface + union entry | Add your interfaces at the end (before the `PageBlock` union). Add to the union at the end. |

**Branch strategy:** Each developer works on their own branch. Merge one at a time. Since all additions are append-only, conflicts resolve by keeping both sides.

## Checklist Per Block

Use this checklist for each of your assigned blocks:

```
[ ] Read the .astro file and document the Props interface
[ ] Create studio/src/schemaTypes/blocks/{block-name}.ts using defineBlock
[ ] Import and add to studio/src/schemaTypes/index.ts
[ ] Add {type: '{block-name}'} to page.ts blocks[] array
[ ] Add GROQ projection to astro-app/src/lib/sanity.ts
[ ] Add TypeScript interface to astro-app/src/lib/types.ts
[ ] Add to PageBlock union type
[ ] Sanity Studio starts without errors
[ ] Block appears in the "Add block" menu in Studio
[ ] Frontend builds without errors
```

## Troubleshooting

**"Schema error: Unknown type"** — You forgot to register the schema in `index.ts` or the `name` in your schema does not match the `type` string in `page.ts`.

**"Duplicate type name"** — Two schemas have the same `name` value. Every block name must be unique.

**"Block renders but shows no content"** — Your GROQ projection is missing fields or the field names in the projection do not match the schema field names.

**"TypeScript error in types.ts"** — Your `_type` literal string does not match the schema name, or you forgot to add the type to the `PageBlock` union.

**"Build succeeds but block shows nothing on the page"** — The `fulldotdevBlocks` map in `BlockRenderer.astro` uses the component name as the key (e.g., `'stats-1'`). Your schema `name` must match this key exactly.

**"Studio starts but block fields are empty"** — The `defineBlock` helper merges base fields automatically. Do not manually add `backgroundVariant`, `spacing`, or `maxWidth` to your fields array, or they will appear twice.

import {defineArrayMember} from 'sanity'

/**
 * Shared block-type member lists and insert-menu groups.
 *
 * Single source of truth — consumed by:
 *   - columns-block.ts (INNER variants, no columnsBlock to prevent recursion)
 *   - page.ts (PAGE variants, includes columnsBlock)
 *   - listing-page.ts (PAGE variants, includes columnsBlock)
 *
 * When adding a new block type, add it here ONCE. All consumers pick it up.
 */

// ---------------------------------------------------------------------------
// Inner block members — every page-builder block EXCEPT columnsBlock.
// Used for columnsBlock sub-arrays (prevents infinite nesting).
// ---------------------------------------------------------------------------
export const INNER_BLOCK_MEMBERS = [
  defineArrayMember({type: 'heroBanner'}),
  defineArrayMember({type: 'featureGrid'}),
  defineArrayMember({type: 'sponsorCards'}),
  defineArrayMember({type: 'richText'}),
  defineArrayMember({type: 'ctaBanner'}),
  defineArrayMember({type: 'faqSection'}),
  defineArrayMember({type: 'contactForm'}),
  defineArrayMember({type: 'logoCloud'}),
  defineArrayMember({type: 'statsRow'}),
  defineArrayMember({type: 'sponsorSteps'}),
  defineArrayMember({type: 'textWithImage'}),
  defineArrayMember({type: 'testimonials'}),
  defineArrayMember({type: 'eventList'}),
  defineArrayMember({type: 'projectCards'}),
  defineArrayMember({type: 'teamGrid'}),
  defineArrayMember({type: 'imageGallery'}),
  defineArrayMember({type: 'articleList'}),
  defineArrayMember({type: 'comparisonTable'}),
  defineArrayMember({type: 'timeline'}),
  defineArrayMember({type: 'pullquote'}),
  defineArrayMember({type: 'divider'}),
  defineArrayMember({type: 'announcementBar'}),
  defineArrayMember({type: 'sponsorshipTiers'}),
  defineArrayMember({type: 'videoEmbed'}),
  defineArrayMember({type: 'pricingTable'}),
  defineArrayMember({type: 'serviceCards'}),
  defineArrayMember({type: 'productShowcase'}),
  defineArrayMember({type: 'linkCards'}),
  defineArrayMember({type: 'newsletter'}),
  defineArrayMember({type: 'accordion'}),
  defineArrayMember({type: 'tabsBlock'}),
  defineArrayMember({type: 'embedBlock'}),
  defineArrayMember({type: 'mapBlock'}),
  defineArrayMember({type: 'countdownTimer'}),
  defineArrayMember({type: 'metricsDashboard'}),
  defineArrayMember({type: 'cardGrid'}),
  defineArrayMember({type: 'beforeAfter'}),
]

// ---------------------------------------------------------------------------
// Page-level block members — all blocks including columnsBlock.
// Used by page.ts and listing-page.ts block arrays.
// ---------------------------------------------------------------------------
export const PAGE_BLOCK_MEMBERS = [
  ...INNER_BLOCK_MEMBERS,
  defineArrayMember({type: 'columnsBlock'}),
]

// ---------------------------------------------------------------------------
// Insert menu groups — shared across all block arrays.
// ---------------------------------------------------------------------------
const BASE_INSERT_MENU_GROUPS = [
  {name: 'heroes', title: 'Heroes', of: ['heroBanner']},
  {
    name: 'content',
    title: 'Content',
    of: [
      'richText',
      'textWithImage',
      'faqSection',
      'articleList',
      'timeline',
      'pullquote',
      'serviceCards',
      'linkCards',
      'accordion',
      'tabsBlock',
    ],
  },
  {
    name: 'media',
    title: 'Media & Stats',
    of: ['statsRow', 'featureGrid', 'videoEmbed', 'embedBlock', 'metricsDashboard'],
  },
  {
    name: 'social',
    title: 'Social Proof',
    of: [
      'sponsorCards',
      'projectCards',
      'logoCloud',
      'sponsorSteps',
      'testimonials',
      'eventList',
      'sponsorshipTiers',
    ],
  },
  {name: 'data', title: 'Data', of: ['comparisonTable', 'pricingTable']},
  {name: 'cta', title: 'Calls to Action', of: ['ctaBanner', 'contactForm', 'newsletter']},
  {name: 'utility', title: 'Utility', of: ['divider', 'announcementBar', 'countdownTimer']},
]

const INNER_DISPLAY_GROUP = {
  name: 'display',
  title: 'Display',
  of: ['teamGrid', 'imageGallery', 'productShowcase', 'mapBlock', 'cardGrid', 'beforeAfter'],
}

const PAGE_DISPLAY_GROUP = {
  name: 'display',
  title: 'Display',
  of: [...INNER_DISPLAY_GROUP.of, 'columnsBlock'],
}

const INSERT_MENU_VIEWS = [
  {name: 'list' as const},
  {name: 'grid' as const, previewImageUrl: (type: string) => `/static/block-previews/${type}.png`},
]

/** Insert menu for inner block arrays (no columnsBlock in display group) */
export const INNER_BLOCK_INSERT_MENU = {
  filter: true,
  groups: [
    BASE_INSERT_MENU_GROUPS[0],
    BASE_INSERT_MENU_GROUPS[1],
    INNER_DISPLAY_GROUP,
    ...BASE_INSERT_MENU_GROUPS.slice(2),
  ],
}

/** Insert menu for page-level block arrays (columnsBlock in display group) */
export const PAGE_BLOCK_INSERT_MENU = {
  filter: true,
  groups: [
    BASE_INSERT_MENU_GROUPS[0],
    BASE_INSERT_MENU_GROUPS[1],
    PAGE_DISPLAY_GROUP,
    ...BASE_INSERT_MENU_GROUPS.slice(2),
  ],
  views: INSERT_MENU_VIEWS,
}

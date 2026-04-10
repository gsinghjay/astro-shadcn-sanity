import {defineField, defineArrayMember} from 'sanity'

/**
 * Returns [heading, description] fields for blocks that share the standard header pattern.
 * Spread into defineBlock's fields array: `fields: [...headerFields(), ...otherFields]`
 */
export function headerFields(opts?: {
  headingRequired?: boolean
  descriptionMax?: number
}): ReturnType<typeof defineField>[] {
  const headingRequired = opts?.headingRequired ?? false
  const descriptionMax = opts?.descriptionMax ?? 500

  return [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => (headingRequired ? Rule.required().max(150) : Rule.max(150)),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: `Supporting text below the heading (max ${descriptionMax} characters)`,
      validation: (Rule) => Rule.max(descriptionMax),
    }),
  ]
}

/**
 * Returns [displayMode, referenceArray] fields for blocks that let editors choose
 * all / featured / manual display with a conditionally-visible reference picker.
 */
export function displayModeBlock(config: {
  referenceType: string
  arrayFieldName: string
  arrayFieldTitle: string
}): ReturnType<typeof defineField>[] {
  return [
    defineField({
      name: 'displayMode',
      title: 'Display Mode',
      type: 'string',
      description: 'Choose how to select items: all, featured only, or manual pick',
      options: {
        list: [
          {title: 'All', value: 'all'},
          {title: 'Featured', value: 'featured'},
          {title: 'Manual', value: 'manual'},
        ],
      },
      initialValue: 'all',
    }),
    defineField({
      name: config.arrayFieldName,
      title: config.arrayFieldTitle,
      type: 'array',
      hidden: ({parent}) => parent?.displayMode !== 'manual',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: config.referenceType}],
        }),
      ],
      validation: (Rule) =>
        Rule.custom((items, context) => {
          const parent = context.parent as {displayMode?: string}
          if (parent?.displayMode === 'manual' && (!items || (items as unknown[]).length === 0)) {
            return `Add at least one ${config.arrayFieldTitle.toLowerCase().slice(0, -1)} in manual mode`
          }
          return true
        }),
    }),
  ]
}

/**
 * Common Lucide icon options for schema fields that accept icon names.
 * The frontend Icon component resolves these via @iconify-json/lucide.
 */
export const LUCIDE_ICON_OPTIONS = [
  // Informational
  {title: 'Info', value: 'info'},
  {title: 'Alert Triangle', value: 'alert-triangle'},
  {title: 'Alert Circle', value: 'alert-circle'},
  {title: 'Check Circle', value: 'check-circle'},
  {title: 'Circle Help', value: 'circle-help'},
  // Notifications
  {title: 'Bell', value: 'bell'},
  {title: 'Megaphone', value: 'megaphone'},
  // Actions
  {title: 'Star', value: 'star'},
  {title: 'Zap', value: 'zap'},
  {title: 'Gift', value: 'gift'},
  {title: 'Heart', value: 'heart'},
  {title: 'Sparkles', value: 'sparkles'},
  {title: 'Flame', value: 'flame'},
  {title: 'Crown', value: 'crown'},
  {title: 'Trophy', value: 'trophy'},
  {title: 'Target', value: 'target'},
  {title: 'Rocket', value: 'rocket'},
  // Security & trust
  {title: 'Shield', value: 'shield'},
  {title: 'Shield Check', value: 'shield-check'},
  {title: 'Lock', value: 'lock'},
  {title: 'Key', value: 'key'},
  // Time & scheduling
  {title: 'Clock', value: 'clock'},
  {title: 'Calendar', value: 'calendar'},
  {title: 'Timer', value: 'timer'},
  // Commerce & finance
  {title: 'Tag', value: 'tag'},
  {title: 'Wallet', value: 'wallet'},
  {title: 'Credit Card', value: 'credit-card'},
  {title: 'Dollar Sign', value: 'dollar-sign'},
  {title: 'Trending Up', value: 'trending-up'},
  {title: 'Trending Down', value: 'trending-down'},
  {title: 'Bar Chart', value: 'bar-chart-3'},
  {title: 'Pie Chart', value: 'pie-chart'},
  // Communication
  {title: 'Mail', value: 'mail'},
  {title: 'Phone', value: 'phone'},
  {title: 'Message Circle', value: 'message-circle'},
  {title: 'Send', value: 'send'},
  // Navigation & links
  {title: 'Globe', value: 'globe'},
  {title: 'Map Pin', value: 'map-pin'},
  {title: 'Compass', value: 'compass'},
  {title: 'External Link', value: 'external-link'},
  {title: 'Link', value: 'link'},
  // Content & media
  {title: 'File Text', value: 'file-text'},
  {title: 'Book Open', value: 'book-open'},
  {title: 'Image', value: 'image'},
  {title: 'Video', value: 'video'},
  {title: 'Music', value: 'music'},
  // Technology
  {title: 'Code', value: 'code'},
  {title: 'Terminal', value: 'terminal'},
  {title: 'Database', value: 'database'},
  {title: 'Cloud', value: 'cloud'},
  {title: 'Server', value: 'server'},
  {title: 'Cpu', value: 'cpu'},
  {title: 'Wifi', value: 'wifi'},
  // People & social
  {title: 'Users', value: 'users'},
  {title: 'User', value: 'user'},
  {title: 'Hand Shake', value: 'handshake'},
  {title: 'Graduation Cap', value: 'graduation-cap'},
  // Objects & tools
  {title: 'Settings', value: 'settings'},
  {title: 'Wrench', value: 'wrench'},
  {title: 'Palette', value: 'palette'},
  {title: 'Layers', value: 'layers'},
  {title: 'Box', value: 'box'},
  {title: 'Package', value: 'package'},
  {title: 'Lightbulb', value: 'lightbulb'},
  // Misc
  {title: 'X', value: 'x'},
  {title: 'Check', value: 'check'},
  {title: 'Plus', value: 'plus'},
  {title: 'Minus', value: 'minus'},
  {title: 'Arrow Right', value: 'arrow-right'},
  {title: 'Arrow Up Right', value: 'arrow-up-right'},
]

/**
 * YouTube URL custom validation — reusable across any URL field that only accepts YouTube links.
 */
export function validateYouTubeUrl(url: string | undefined): true | string {
  if (!url) return true
  const isYouTube =
    /youtube\.com\/watch\?v=/.test(url) ||
    /youtu\.be\//.test(url) ||
    /youtube\.com\/embed\//.test(url) ||
    /youtube\.com\/shorts\//.test(url)
  return isYouTube || 'Only YouTube URLs are supported'
}

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
  {title: 'Activity', value: 'activity'},
  {title: 'Alert Circle', value: 'alert-circle'},
  {title: 'Alert Triangle', value: 'alert-triangle'},
  {title: 'Arrow Right', value: 'arrow-right'},
  {title: 'Arrow Up Right', value: 'arrow-up-right'},
  {title: 'Award', value: 'award'},
  {title: 'Bar Chart', value: 'bar-chart-3'},
  {title: 'Bell', value: 'bell'},
  {title: 'Book', value: 'book'},
  {title: 'Book Open', value: 'book-open'},
  {title: 'Bookmark', value: 'bookmark'},
  {title: 'Bot', value: 'bot'},
  {title: 'Box', value: 'box'},
  {title: 'Brain', value: 'brain'},
  {title: 'Briefcase', value: 'briefcase'},
  {title: 'Building', value: 'building-2'},
  {title: 'Calendar', value: 'calendar'},
  {title: 'Camera', value: 'camera'},
  {title: 'Check', value: 'check'},
  {title: 'Check Circle', value: 'check-circle'},
  {title: 'Circle Help', value: 'circle-help'},
  {title: 'Clipboard', value: 'clipboard'},
  {title: 'Clock', value: 'clock'},
  {title: 'Cloud', value: 'cloud'},
  {title: 'Code', value: 'code'},
  {title: 'Compass', value: 'compass'},
  {title: 'Cpu', value: 'cpu'},
  {title: 'Credit Card', value: 'credit-card'},
  {title: 'Crown', value: 'crown'},
  {title: 'Database', value: 'database'},
  {title: 'Dollar Sign', value: 'dollar-sign'},
  {title: 'Download', value: 'download'},
  {title: 'Edit', value: 'pencil'},
  {title: 'External Link', value: 'external-link'},
  {title: 'Eye', value: 'eye'},
  {title: 'File Text', value: 'file-text'},
  {title: 'Filter', value: 'filter'},
  {title: 'Flag', value: 'flag'},
  {title: 'Flame', value: 'flame'},
  {title: 'Folder', value: 'folder'},
  {title: 'Gift', value: 'gift'},
  {title: 'Github', value: 'simple-icons:github'},
  {title: 'Globe', value: 'globe'},
  {title: 'Graduation Cap', value: 'graduation-cap'},
  {title: 'Grid', value: 'layout-grid'},
  {title: 'Hand Shake', value: 'handshake'},
  {title: 'Heart', value: 'heart'},
  {title: 'Home', value: 'house'},
  {title: 'Image', value: 'image'},
  {title: 'Info', value: 'info'},
  {title: 'Key', value: 'key'},
  {title: 'Laptop', value: 'laptop'},
  {title: 'Layers', value: 'layers'},
  {title: 'Lightbulb', value: 'lightbulb'},
  {title: 'Link', value: 'link'},
  {title: 'Linkedin', value: 'simple-icons:linkedin'},
  {title: 'List', value: 'list'},
  {title: 'Lock', value: 'lock'},
  {title: 'Mail', value: 'mail'},
  {title: 'Map', value: 'map'},
  {title: 'Map Pin', value: 'map-pin'},
  {title: 'Megaphone', value: 'megaphone'},
  {title: 'Menu', value: 'menu'},
  {title: 'Message Circle', value: 'message-circle'},
  {title: 'Mic', value: 'mic'},
  {title: 'Minus', value: 'minus'},
  {title: 'Monitor', value: 'monitor'},
  {title: 'Music', value: 'music'},
  {title: 'Network', value: 'network'},
  {title: 'Package', value: 'package'},
  {title: 'Palette', value: 'palette'},
  {title: 'Phone', value: 'phone'},
  {title: 'Pie Chart', value: 'pie-chart'},
  {title: 'Play', value: 'play'},
  {title: 'Play Circle', value: 'play-circle'},
  {title: 'Plus', value: 'plus'},
  {title: 'Refresh', value: 'refresh-cw'},
  {title: 'Rocket', value: 'rocket'},
  {title: 'Save', value: 'save'},
  {title: 'Search', value: 'search'},
  {title: 'Send', value: 'send'},
  {title: 'Server', value: 'server'},
  {title: 'Settings', value: 'settings'},
  {title: 'Share', value: 'share-2'},
  {title: 'Shield', value: 'shield'},
  {title: 'Shield Check', value: 'shield-check'},
  {title: 'Smartphone', value: 'smartphone'},
  {title: 'Sparkles', value: 'sparkles'},
  {title: 'Star', value: 'star'},
  {title: 'Tag', value: 'tag'},
  {title: 'Target', value: 'target'},
  {title: 'Terminal', value: 'terminal'},
  {title: 'Thumbs Up', value: 'thumbs-up'},
  {title: 'Timer', value: 'timer'},
  {title: 'Trending Down', value: 'trending-down'},
  {title: 'Trending Up', value: 'trending-up'},
  {title: 'Trophy', value: 'trophy'},
  {title: 'Twitter / X', value: 'simple-icons:x'},
  {title: 'Upload', value: 'upload'},
  {title: 'User', value: 'user'},
  {title: 'Users', value: 'users'},
  {title: 'Users Round', value: 'users-round'},
  {title: 'Video', value: 'video'},
  {title: 'Wallet', value: 'wallet'},
  {title: 'Wifi', value: 'wifi'},
  {title: 'Wrench', value: 'wrench'},
  {title: 'X', value: 'x'},
  {title: 'Zap', value: 'zap'},
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

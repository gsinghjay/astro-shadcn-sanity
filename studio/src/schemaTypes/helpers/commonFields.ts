import {defineField, defineArrayMember} from 'sanity'

/**
 * Returns [heading, description] fields for blocks that share the standard header pattern.
 * Spread into defineBlock's fields array: `fields: [...headerFields(), ...otherFields]`
 */
export function headerFields(opts?: {
  headingRequired?: boolean
  descriptionMax?: number
}): ReturnType<typeof defineField>[] {
  const headingRequired = opts?.headingRequired ?? true
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

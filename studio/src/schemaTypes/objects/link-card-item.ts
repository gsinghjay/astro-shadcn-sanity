import {defineType, defineField} from 'sanity'
import {LinkIcon} from '@sanity/icons'
import {LUCIDE_ICON_OPTIONS} from '../helpers/commonFields'

export const linkCardItem = defineType({
  name: 'linkCardItem',
  title: 'Link Card Item',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'string',
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Label',
      type: 'string',
      description:
        "Optional CTA label shown next to the arrow on the grid variant. Defaults to 'Learn more' if blank. Other variants (list, icon-list) ignore this field.",
      validation: (Rule) => Rule.max(50),
    }),
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Optional icon from the Lucide icon set',
      options: {
        list: LUCIDE_ICON_OPTIONS,
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (Rule) => Rule.required().uri({allowRelative: true, scheme: ['http', 'https']}),
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'url'},
  },
})

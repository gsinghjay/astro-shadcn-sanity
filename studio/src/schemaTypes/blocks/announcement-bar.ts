import {defineField} from 'sanity'
import {BellIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {LUCIDE_ICON_OPTIONS} from '../helpers/commonFields'

export const announcementBar = defineBlock({
  name: 'announcementBar',
  title: 'Announcement Bar',
  icon: BellIcon,
  preview: {select: {title: 'text'}},
  variants: [
    {name: 'inline', title: 'Inline'},
    {name: 'floating', title: 'Floating'},
  ],
  hiddenByVariant: {
    dismissible: ['floating'],
  },
  fields: [
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
      name: 'text',
      title: 'Text',
      type: 'string',
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'object',
      fields: [
        defineField({
          name: 'label',
          title: 'Label',
          type: 'string',
          validation: (Rule) => Rule.max(100),
        }),
        defineField({
          name: 'href',
          title: 'URL',
          type: 'url',
          validation: (Rule) =>
            Rule.required().uri({allowRelative: true, scheme: ['http', 'https', 'mailto', 'tel']}),
        }),
      ],
    }),
    defineField({
      name: 'dismissible',
      title: 'Dismissible',
      type: 'boolean',
      description: 'Allow users to dismiss the banner with a close button',
      initialValue: false,
    }),
  ],
})

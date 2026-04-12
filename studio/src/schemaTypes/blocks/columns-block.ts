import {defineField} from 'sanity'
import {InlineIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {INNER_BLOCK_MEMBERS, INNER_BLOCK_INSERT_MENU} from '../helpers/block-members'

export const columnsBlock = defineBlock({
  name: 'columnsBlock',
  title: 'Columns',
  icon: InlineIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'equal', title: 'Equal (50/50)'},
    {name: 'wide-left', title: 'Wide Left (2/3 + 1/3)'},
    {name: 'wide-right', title: 'Wide Right (1/3 + 2/3)'},
    {name: 'sidebar-left', title: 'Sidebar Left'},
    {name: 'sidebar-right', title: 'Sidebar Right'},
  ],
  hiddenByVariant: {
    reverseOnMobile: ['equal'],
  },
  fields: [
    defineField({
      name: 'leftBlocks',
      title: 'Left Column',
      type: 'array',
      of: INNER_BLOCK_MEMBERS,
      validation: (Rule) => Rule.required().min(1),
      options: {insertMenu: INNER_BLOCK_INSERT_MENU},
    }),
    defineField({
      name: 'rightBlocks',
      title: 'Right Column',
      type: 'array',
      of: INNER_BLOCK_MEMBERS,
      validation: (Rule) => Rule.required().min(1),
      options: {insertMenu: INNER_BLOCK_INSERT_MENU},
    }),
    defineField({
      name: 'reverseOnMobile',
      title: 'Reverse on Mobile',
      type: 'boolean',
      description:
        'When enabled, the right column renders first on mobile. Useful when sidebar content should appear above on small screens.',
      initialValue: false,
    }),
    defineField({
      name: 'verticalAlign',
      title: 'Vertical Alignment',
      type: 'string',
      fieldset: 'layout',
      description: 'Controls cross-axis alignment of the two columns',
      options: {
        list: [
          {title: 'Top', value: 'top'},
          {title: 'Center', value: 'center'},
          {title: 'Stretch', value: 'stretch'},
        ],
        layout: 'radio',
      },
      initialValue: 'top',
    }),
  ],
})

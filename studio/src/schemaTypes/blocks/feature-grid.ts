import {defineField, defineArrayMember} from 'sanity'
import {ThLargeIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const featureGrid = defineBlock({
  name: 'featureGrid',
  title: 'Feature Grid',
  icon: ThLargeIcon,
  preview: {select: {title: 'heading'}},
  variants: [
    {name: 'grid', title: 'Grid (Default)'},
    {name: 'grid-centered', title: 'Grid Centered'},
    {name: 'horizontal-cards', title: 'Horizontal Cards'},
    {name: 'sidebar-grid', title: 'Sidebar Grid'},
    {name: 'stacked', title: 'Stacked'},
    {name: 'numbered-brutalist', title: 'Numbered Brutalist'},
  ],
  hiddenByVariant: {
    columns: ['stacked', 'sidebar-grid'],
  },
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'items',
      title: 'Items',
      type: 'array',
      of: [defineArrayMember({type: 'featureItem'})],
      validation: (Rule) => [Rule.min(1).error('Add at least one feature'), Rule.max(20)],
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'number',
      fieldset: 'layout',
      options: {
        list: [2, 3, 4],
      },
      initialValue: 3,
    }),
  ],
})

import {defineField, defineArrayMember} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {headerFields} from '../helpers/commonFields'

export const articleList = defineBlock({
  name: 'articleList',
  title: 'Article List',
  icon: DocumentTextIcon,
  variants: [
    {name: 'grid', title: 'Grid'},
    {name: 'split-featured', title: 'Split Featured'},
    {name: 'list', title: 'List'},
    {name: 'brutalist', title: 'Brutalist'},
    {name: 'magazine', title: 'Magazine'},
  ],
  hiddenByVariant: {
    description: ['list'],
  },
  fields: [
    ...headerFields(),
    defineField({
      name: 'contentType',
      title: 'Content Type',
      type: 'string',
      description: 'Show all articles or filter by specific categories',
      options: {
        list: [
          {title: 'All', value: 'all'},
          {title: 'By Category', value: 'by-category'},
        ],
        layout: 'radio',
      },
      initialValue: 'all',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      type: 'array',
      of: [defineArrayMember({type: 'reference', to: [{type: 'articleCategory'}]})],
      hidden: ({parent}) => parent?.contentType !== 'by-category',
      description: 'Select one or more categories to filter articles',
      validation: (Rule) =>
        Rule.custom((categories, context) => {
          const parent = context.parent as {contentType?: string} | undefined
          if (parent?.contentType === 'by-category' && (!categories || categories.length === 0)) {
            return 'Select at least one category when filtering by category'
          }
          return true
        }),
    }),
    defineField({
      name: 'limit',
      title: 'Max Articles to Display',
      type: 'number',
      initialValue: 6,
      validation: (Rule) => Rule.min(1).max(20),
    }),
    defineField({
      name: 'ctaButtons',
      title: 'CTA Buttons',
      type: 'array',
      of: [defineArrayMember({type: 'button'})],
      validation: (Rule) => Rule.max(5),
    }),
  ],
})

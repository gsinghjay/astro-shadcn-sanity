import {defineField, defineArrayMember} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const articleList = defineBlock({
  name: 'articleList',
  title: 'Article List',
  icon: DocumentTextIcon,
  variants: [
    {name: 'grid', title: 'Grid'},
    {name: 'split-featured', title: 'Split Featured'},
    {name: 'list', title: 'List'},
  ],
  hiddenByVariant: {
    description: ['list'],
  },
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          {title: 'All', value: 'all'},
          {title: 'Blog', value: 'blog'},
          {title: 'News', value: 'news'},
        ],
        layout: 'radio',
      },
      initialValue: 'all',
    }),
    defineField({
      name: 'limit',
      title: 'Max Articles to Display',
      type: 'number',
      initialValue: 6,
      validation: (Rule) => Rule.min(1).max(20),
    }),
    defineField({
      name: 'links',
      title: 'CTA Buttons',
      type: 'array',
      of: [defineArrayMember({type: 'button'})],
    }),
  ],
})

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
      description: 'Content type to display (blog posts, news, etc.)',
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
      name: 'ctaButtons',
      title: 'CTA Buttons',
      type: 'array',
      of: [defineArrayMember({type: 'button'})],
      validation: (Rule) => Rule.max(5),
    }),
  ],
})

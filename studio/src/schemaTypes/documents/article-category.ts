import {defineType, defineField} from 'sanity'
import {TagIcon} from '@sanity/icons'
import {siteField, siteScopedIsUnique} from '../fields/site-field'

export const articleCategory = defineType({
  name: 'articleCategory',
  title: 'Article Category',
  type: 'document',
  icon: TagIcon,
  preview: {
    select: {title: 'title', subtitle: 'slug.current'},
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Category name displayed on the site and in Studio lists',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96, isUnique: siteScopedIsUnique},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Brief category description for editorial reference',
      rows: 3,
      validation: (Rule) => Rule.max(300),
    }),
    siteField,
  ],
})

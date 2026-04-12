import {defineType, defineField} from 'sanity'
import {DocumentIcon} from '@sanity/icons'
import {siteField, siteScopedIsUnique} from '../fields/site-field'
import {PAGE_BLOCK_MEMBERS, PAGE_BLOCK_INSERT_MENU} from '../helpers/block-members'

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  preview: {
    select: {title: 'title', subtitle: 'slug.current'},
  },
  groups: [
    {name: 'layout', title: 'Layout', default: true},
    {name: 'content', title: 'Content'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'layout',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'layout',
      options: {source: 'title', maxLength: 96, isUnique: siteScopedIsUnique},
      validation: (Rule) => Rule.required(),
    }),
    {...siteField, group: 'layout'},
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
    defineField({
      name: 'blocks',
      title: 'Page Blocks',
      type: 'array',
      group: 'content',
      of: PAGE_BLOCK_MEMBERS,
      options: {insertMenu: PAGE_BLOCK_INSERT_MENU},
    }),
  ],
})

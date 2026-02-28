import {defineType, defineField} from 'sanity'
import {CreditCardIcon, SearchIcon} from '@sanity/icons'
import {siteField} from '../fields/site-field'

export const sponsor = defineType({
  name: 'sponsor',
  title: 'Sponsor',
  type: 'document',
  icon: CreditCardIcon,
  groups: [
    {name: 'main', title: 'Main', default: true},
    {name: 'seo', title: 'SEO', icon: SearchIcon},
  ],
  preview: {
    select: {title: 'name', subtitle: 'tier', media: 'logo'},
  },
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'main',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'main',
      options: {source: 'name'},
      validation: (Rule) => Rule.required(),
    }),
    {...siteField, group: 'main'},
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'main',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      group: 'main',
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      group: 'main',
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'string',
      group: 'main',
    }),
    defineField({
      name: 'tier',
      title: 'Tier',
      type: 'string',
      group: 'main',
      options: {
        list: [
          {title: 'Platinum', value: 'platinum'},
          {title: 'Gold', value: 'gold'},
          {title: 'Silver', value: 'silver'},
          {title: 'Bronze', value: 'bronze'},
        ],
      },
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      group: 'main',
      initialValue: false,
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
})

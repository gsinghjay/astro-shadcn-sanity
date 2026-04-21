import {defineType, defineField, defineArrayMember} from 'sanity'
import {CreditCardIcon, SearchIcon} from '@sanity/icons'
import {siteField, siteScopedIsUnique} from '../fields/site-field'

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
      options: {source: 'name', isUnique: siteScopedIsUnique},
      validation: (Rule) => Rule.required(),
    }),
    {...siteField, group: 'main'},
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'main',
      options: {hotspot: true},
      description: 'Primary logo — used as fallback when square or horizontal variants are not provided.',
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
      name: 'logoSquare',
      title: 'Logo (Square)',
      type: 'image',
      group: 'main',
      options: {hotspot: true},
      description: 'Optional square icon version for small contexts like listing cards. Falls back to primary logo if empty.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'logoHorizontal',
      title: 'Logo (Horizontal)',
      type: 'image',
      group: 'main',
      options: {hotspot: true},
      description: 'Optional wide/horizontal version for detail pages and large displays. Falls back to primary logo if empty.',
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
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
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
      group: 'main',
      description: 'Email address for portal authentication matching',
      validation: (Rule) => Rule.email(),
    }),
    defineField({
      name: 'allowedEmails',
      title: 'Allowed Emails',
      type: 'array',
      group: 'main',
      description: 'Additional emails authorized to access this sponsor portal',
      of: [defineArrayMember({type: 'string', validation: (Rule) => Rule.email()})],
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
      name: 'hidden',
      title: 'Hidden',
      type: 'boolean',
      group: 'main',
      description: 'Hide this sponsor from public pages',
      initialValue: false,
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

import {defineType, defineField, defineArrayMember} from 'sanity'
import {UserIcon, LinkIcon} from '@sanity/icons'
import {siteField, siteScopedIsUnique} from '../fields/site-field'

export const author = defineType({
  name: 'author',
  title: 'Author',
  type: 'document',
  icon: UserIcon,
  groups: [
    {name: 'main', title: 'Main', default: true},
    {name: 'links', title: 'Links', icon: LinkIcon},
  ],
  preview: {
    select: {title: 'name', subtitle: 'role', media: 'image'},
  },
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      group: 'main',
      description: 'Author display name shown on cards and detail pages',
      validation: (Rule) => Rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'main',
      options: {source: 'name', maxLength: 96, isUnique: siteScopedIsUnique},
      validation: (Rule) => Rule.required(),
    }),
    {...siteField, group: 'main'},
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      group: 'main',
      description: 'Job title or role, e.g., "Senior Developer". Maps to schema.org jobTitle',
      validation: (Rule) => Rule.max(100),
    }),
    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      group: 'main',
      description: 'Short biography for author cards and detail page',
      rows: 3,
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'credentials',
      title: 'Credentials',
      type: 'array',
      group: 'main',
      description: 'Professional qualifications, e.g., "PhD Computer Science", "PMP Certified"',
      of: [defineArrayMember({type: 'string'})],
      validation: (Rule) => Rule.max(10).unique(),
    }),
    defineField({
      name: 'image',
      title: 'Headshot',
      type: 'image',
      group: 'main',
      description: 'Author headshot photo. Used on author cards and detail page.',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the image for screen readers',
        }),
      ],
    }),
    defineField({
      name: 'sameAs',
      title: 'Same As (Structured Data)',
      type: 'array',
      group: 'links',
      description:
        'Canonical profile URLs (LinkedIn, GitHub, personal site) for schema.org Person sameAs property. Used in structured data, not displayed on the page.',
      of: [
        defineArrayMember({
          type: 'url',
          validation: (Rule) => Rule.uri({scheme: ['https', 'http']}),
        }),
      ],
      validation: (Rule) => Rule.max(10),
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      group: 'links',
      description: 'Social profile links displayed on the author page with platform icons',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              validation: (Rule) => Rule.required(),
              options: {
                list: [
                  {title: 'LinkedIn', value: 'linkedin'},
                  {title: 'GitHub', value: 'github'},
                  {title: 'Twitter/X', value: 'twitter'},
                  {title: 'Website', value: 'website'},
                  {title: 'Other', value: 'other'},
                ],
                layout: 'radio',
              },
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required().uri({scheme: ['https', 'http']}),
            }),
          ],
          preview: {
            select: {title: 'platform', subtitle: 'url'},
          },
        }),
      ],
      validation: (Rule) => Rule.max(10),
    }),
  ],
})

import {defineType, defineField} from 'sanity'
import {SearchIcon} from '@sanity/icons'

export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: SearchIcon,
  fields: [
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
      description: 'Recommended length: 60 characters or fewer (search engines truncate beyond ~60).',
      validation: (Rule) =>
        Rule.max(60).warning('Meta titles longer than 60 characters are usually truncated in search results.'),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      description: 'Recommended length: 160 characters or fewer (search engines truncate beyond ~160).',
      validation: (Rule) =>
        Rule.max(160).warning(
          'Meta descriptions longer than 160 characters are usually truncated in search results.',
        ),
    }),
    defineField({
      name: 'noIndex',
      title: 'No Index',
      type: 'boolean',
      description: 'Hide this page from search engines',
      initialValue: false,
    }),
    defineField({
      name: 'ogImage',
      title: 'Open Graph Image',
      type: 'image',
      description: '1200x630 recommended',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative Text',
          type: 'string',
          description: 'Required for accessibility',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
  ],
})

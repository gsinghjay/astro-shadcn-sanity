import {defineType, defineField} from 'sanity'

// Singleton document — use desk structure to limit to a single instance
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
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
    defineField({
      name: 'navigationItems',
      title: 'Navigation Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'URL',
              type: 'string',
              description: 'Relative path (e.g. /about) or full URL (e.g. https://example.com)',
              validation: (Rule) =>
                Rule.required().custom((value) => {
                  if (!value) return true
                  if (value.startsWith('/') || /^https?:\/\//.test(value)) return true
                  return 'Must be a relative path starting with "/" or a full URL starting with "http(s)://"'
                }),
            }),
            defineField({
              name: 'children',
              title: 'Sub-items',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'label',
                      title: 'Label',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'href',
                      title: 'URL',
                      type: 'string',
                      description:
                        'Relative path (e.g. /about) or full URL (e.g. https://example.com)',
                      validation: (Rule) =>
                        Rule.required().custom((value) => {
                          if (!value) return true
                          if (value.startsWith('/') || /^https?:\/\//.test(value)) return true
                          return 'Must be a relative path starting with "/" or a full URL starting with "http(s)://"'
                        }),
                    }),
                  ],
                },
              ],
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'footerContent',
      title: 'Footer Content',
      type: 'object',
      fields: [
        defineField({
          name: 'text',
          title: 'Footer Text',
          type: 'text',
        }),
        defineField({
          name: 'copyrightText',
          title: 'Copyright Text',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Links',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: ['github', 'linkedin', 'twitter', 'instagram', 'youtube'],
              },
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'currentSemester',
      title: 'Current Semester',
      type: 'string',
      description: 'e.g., "Fall 2026"',
    }),
  ],
})

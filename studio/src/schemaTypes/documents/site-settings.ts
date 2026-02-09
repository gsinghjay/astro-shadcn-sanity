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
      name: 'siteDescription',
      title: 'Site Description',
      type: 'text',
      description: 'Used as the default meta description for the site',
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
      name: 'logoLight',
      title: 'Logo (Light Variant)',
      type: 'image',
      description: 'Light-on-dark variant used in the footer',
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
      name: 'ctaButton',
      title: 'CTA Button',
      type: 'object',
      description: 'Call-to-action button shown in the header',
      fields: [
        defineField({
          name: 'text',
          title: 'Button Text',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'url',
          title: 'Button URL',
          type: 'string',
          validation: (Rule) =>
            Rule.required().custom((value) => {
              if (!value) return true
              if (value.startsWith('/') || /^https?:\/\//.test(value)) return true
              return 'Must be a relative path starting with "/" or a full URL starting with "http(s)://"'
            }),
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
              description: 'Dropdown sub-navigation items (not yet rendered in header — planned for future story)',
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
      name: 'contactInfo',
      title: 'Contact Information',
      type: 'object',
      fields: [
        defineField({
          name: 'address',
          title: 'Address',
          type: 'string',
        }),
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string',
        }),
        defineField({
          name: 'phone',
          title: 'Phone',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'footerLinks',
      title: 'Footer Bottom Bar Links',
      type: 'array',
      description: 'Links shown in the footer bottom bar (e.g., Privacy Policy, Terms)',
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
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'resourceLinks',
      title: 'Resource Links',
      type: 'array',
      description: 'Links shown in the footer Resources section',
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
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'external',
              title: 'External Link',
              type: 'boolean',
              initialValue: false,
            }),
          ],
        },
      ],
    }),
    defineField({
      name: 'programLinks',
      title: 'Program Links',
      type: 'array',
      description: 'Links shown in the footer Programs section',
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

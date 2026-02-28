import {defineType, defineField, defineArrayMember} from 'sanity'
import {CogIcon, ImageIcon, MenuIcon, BlockContentIcon, UsersIcon} from '@sanity/icons'
import {linkFields} from '../objects/link'
import {buttonFields} from '../objects/button'
import {siteField} from '../fields/site-field'

// Singleton document — use desk structure to limit to a single instance
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'branding', title: 'Branding', icon: ImageIcon},
    {name: 'navigation', title: 'Navigation', icon: MenuIcon, default: true},
    {name: 'footer', title: 'Footer', icon: BlockContentIcon},
    {name: 'social', title: 'Social & Contact', icon: UsersIcon},
  ],
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      group: 'branding',
      validation: (Rule) => Rule.required(),
    }),
    {...siteField, group: 'branding'},
    defineField({
      name: 'siteDescription',
      title: 'Site Description',
      type: 'text',
      group: 'branding',
      description: 'Used as the default meta description for the site',
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'image',
      group: 'branding',
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
      group: 'branding',
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
      group: 'navigation',
      description: 'Call-to-action button shown in the header',
      fields: [...buttonFields],
    }),
    defineField({
      name: 'navigationItems',
      title: 'Navigation Items',
      type: 'array',
      group: 'navigation',
      of: [
        defineArrayMember({
          type: 'object',
          preview: {select: {title: 'label'}},
          fields: [
            ...linkFields,
            defineField({
              name: 'children',
              title: 'Sub-items',
              type: 'array',
              description: 'Dropdown sub-navigation items (not yet rendered in header — planned for future story)',
              of: [
                defineArrayMember({
                  type: 'object',
                  preview: {select: {title: 'label'}},
                  fields: [...linkFields],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'footerContent',
      title: 'Footer Content',
      type: 'object',
      group: 'footer',
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
      group: 'social',
      of: [
        defineArrayMember({
          type: 'object',
          preview: {select: {title: 'platform'}},
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: ['github', 'linkedin', 'twitter', 'instagram', 'youtube'],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'contactInfo',
      title: 'Contact Information',
      type: 'object',
      group: 'social',
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
          validation: (Rule) => Rule.email().warning(),
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
      group: 'footer',
      description: 'Links shown in the footer bottom bar (e.g., Privacy Policy, Terms)',
      of: [
        defineArrayMember({
          type: 'object',
          preview: {select: {title: 'label'}},
          fields: [...linkFields],
        }),
      ],
    }),
    defineField({
      name: 'resourceLinks',
      title: 'Resource Links',
      type: 'array',
      group: 'footer',
      description: 'Links shown in the footer Resources section',
      of: [
        defineArrayMember({
          type: 'object',
          preview: {select: {title: 'label'}},
          fields: [...linkFields],
        }),
      ],
    }),
    defineField({
      name: 'programLinks',
      title: 'Program Links',
      type: 'array',
      group: 'footer',
      description: 'Links shown in the footer Programs section',
      of: [
        defineArrayMember({
          type: 'object',
          preview: {select: {title: 'label'}},
          fields: [...linkFields],
        }),
      ],
    }),
    defineField({
      name: 'currentSemester',
      title: 'Current Semester',
      type: 'string',
      group: 'social',
      description: 'e.g., "Fall 2026"',
    }),
  ],
})

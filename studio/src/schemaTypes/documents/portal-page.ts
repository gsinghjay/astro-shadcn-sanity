import {defineType, defineField} from 'sanity'
import {DashboardIcon} from '@sanity/icons'
import {PAGE_BLOCK_MEMBERS, PAGE_BLOCK_INSERT_MENU} from '../helpers/block-members'

export const portalPage = defineType({
  name: 'portalPage',
  title: 'Portal Page',
  type: 'document',
  icon: DashboardIcon,
  preview: {
    select: {title: 'title', subtitle: 'route'},
    prepare({title, subtitle}) {
      const routeLabel = subtitle
        ? `/portal/${subtitle === 'dashboard' ? '' : subtitle} — ${subtitle.charAt(0).toUpperCase() + subtitle.slice(1)}`
        : 'Unconfigured'
      // note: 'form' route added post-22.9 — renders blocks-only at /portal/form, sidebar shows "Agreement"
      return {title: title || routeLabel, subtitle: routeLabel}
    },
  },
  fields: [
    defineField({
      name: 'route',
      title: 'Route',
      type: 'string',
      description:
        'Which portal page this document configures. Set automatically — do not change.',
      options: {
        list: [
          {title: 'Dashboard', value: 'dashboard'},
          {title: 'Events', value: 'events'},
          {title: 'Progress', value: 'progress'},
          {title: 'Agreement', value: 'agreement'},
          {title: 'Form', value: 'form'},
          {title: 'Login', value: 'login'},
          {title: 'Access Denied', value: 'denied'},
        ],
        layout: 'radio',
      },
      readOnly: true,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Page Title',
      type: 'string',
      description: 'Overrides the default H1 heading. Leave blank to use the default.',
      validation: (Rule) => Rule.max(150),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Optional intro paragraph displayed below the heading.',
      rows: 3,
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'headerBlocks',
      title: 'Header Blocks',
      description: 'Optional content blocks rendered ABOVE the page content.',
      type: 'array',
      of: PAGE_BLOCK_MEMBERS,
      options: {insertMenu: PAGE_BLOCK_INSERT_MENU},
    }),
    defineField({
      name: 'footerBlocks',
      title: 'Footer Blocks',
      description: 'Optional content blocks rendered BELOW the page content.',
      type: 'array',
      of: PAGE_BLOCK_MEMBERS,
      options: {insertMenu: PAGE_BLOCK_INSERT_MENU},
    }),
    defineField({
      name: 'dashboardCards',
      title: 'Dashboard Cards',
      description:
        'Configure the feature cards shown on the portal dashboard. Leave empty to use defaults.',
      type: 'array',
      hidden: ({document}) => document?.route !== 'dashboard',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Description',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'iconName',
              title: 'Icon Name',
              type: 'string',
              description: 'Lucide icon name (e.g., "folder", "calendar", "git-pull-request")',
            }),
            defineField({
              name: 'route',
              title: 'Route',
              type: 'string',
              description:
                'Portal sub-route this card links to (e.g., "/portal/events"). Use {sponsorSlug} for dynamic sponsor paths.',
            }),
            defineField({
              name: 'enabled',
              title: 'Enabled',
              type: 'boolean',
              initialValue: true,
            }),
          ],
          preview: {
            select: {title: 'title', enabled: 'enabled'},
            prepare({title, enabled}) {
              return {
                title: title || 'Untitled Card',
                subtitle: enabled === false ? 'Disabled' : 'Enabled',
              }
            },
          },
        },
      ],
    }),
  ],
})

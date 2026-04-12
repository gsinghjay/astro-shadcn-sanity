import {defineType, defineField} from 'sanity'
import {DocumentsIcon} from '@sanity/icons'
import {PAGE_BLOCK_MEMBERS, PAGE_BLOCK_INSERT_MENU} from '../helpers/block-members'

export const listingPage = defineType({
  name: 'listingPage',
  title: 'Listing Page',
  type: 'document',
  icon: DocumentsIcon,
  preview: {
    select: {title: 'title', subtitle: 'route'},
    prepare({title, subtitle}) {
      const routeLabel = subtitle
        ? `/${subtitle} — ${subtitle.charAt(0).toUpperCase() + subtitle.slice(1)}`
        : 'Unconfigured'
      return {title: title || routeLabel, subtitle: routeLabel}
    },
  },
  fields: [
    defineField({
      name: 'route',
      title: 'Route',
      type: 'string',
      description:
        'Which listing page this document configures. Set automatically — do not change.',
      options: {
        list: [
          {title: 'Articles', value: 'articles'},
          {title: 'Authors', value: 'authors'},
          {title: 'Events', value: 'events'},
          {title: 'Projects', value: 'projects'},
          {title: 'Sponsors', value: 'sponsors'},
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
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
    defineField({
      name: 'headerBlocks',
      title: 'Header Blocks',
      description: 'Optional content blocks rendered ABOVE the listing.',
      type: 'array',
      of: PAGE_BLOCK_MEMBERS,
      options: {insertMenu: PAGE_BLOCK_INSERT_MENU},
    }),
    defineField({
      name: 'footerBlocks',
      title: 'Footer Blocks',
      description: 'Optional content blocks rendered BELOW the listing.',
      type: 'array',
      of: PAGE_BLOCK_MEMBERS,
      options: {insertMenu: PAGE_BLOCK_INSERT_MENU},
    }),
  ],
})

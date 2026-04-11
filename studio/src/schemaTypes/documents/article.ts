import {defineType, defineField, defineArrayMember} from 'sanity'
import {DocumentTextIcon, SearchIcon} from '@sanity/icons'
import {siteField, siteScopedIsUnique} from '../fields/site-field'

export const article = defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'main', title: 'Main', default: true},
    {name: 'content', title: 'Content'},
    {name: 'seo', title: 'SEO', icon: SearchIcon},
  ],
  orderings: [
    {
      title: 'Published (newest)',
      name: 'publishedAtDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
    {
      title: 'Published (oldest)',
      name: 'publishedAtAsc',
      by: [{field: 'publishedAt', direction: 'asc'}],
    },
    {
      title: 'Title',
      name: 'titleAsc',
      by: [{field: 'title', direction: 'asc'}],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'publishedAt',
      media: 'featuredImage',
    },
    prepare({title, subtitle, media}) {
      return {
        title,
        subtitle: subtitle
          ? new Date(subtitle).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : 'No publish date',
        media,
      }
    },
  },
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'main',
      description: 'Article headline. Appears in listings, browser tab, and social shares',
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'main',
      options: {source: 'title', maxLength: 96, isUnique: siteScopedIsUnique},
      validation: (Rule) => Rule.required(),
    }),
    {...siteField, group: 'main'},
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      group: 'main',
      rows: 3,
      description: 'Short summary for article cards, RSS feed description, and meta description fallback',
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      group: 'main',
      options: {hotspot: true},
      description: 'Primary article image. Used as hero on detail page and thumbnail on cards',
      validation: (Rule) => Rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Required for accessibility (NFR16)',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'portableText',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'main',
      to: [{type: 'author'}],
      description: 'Article author. Enables byline and EEAT structured data',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      group: 'main',
      description: 'Publication date. Drives sort order, RSS pubDate, and JSON-LD datePublished',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
      group: 'main',
      description:
        'Last significant update. Used for JSON-LD dateModified (SEO freshness signal). Falls back to publishedAt when absent',
      validation: (Rule) =>
        Rule.custom((updatedAt, context) => {
          const publishedAt = (context.document as {publishedAt?: string})?.publishedAt
          if (updatedAt && publishedAt && updatedAt < publishedAt) {
            return 'Updated date must not be earlier than published date'
          }
          return true
        }),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      group: 'main',
      to: [{type: 'articleCategory'}],
      description: 'Primary article category (e.g., Blog, News, Announcements)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'main',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
      description: 'Cross-cutting topics for filtering and discovery. Max 10 tags',
      validation: (Rule) => Rule.max(10).unique(),
    }),
    defineField({
      name: 'relatedArticles',
      title: 'Related Articles',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'article'}],
          options: {
            filter: ({document}) => ({
              filter: '_id != $id',
              params: {id: document._id},
            }),
          },
        }),
      ],
      description: 'Hand-picked related articles for "Read next" section. Max 3',
      validation: (Rule) => Rule.max(3).unique(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      group: 'seo',
    }),
  ],
})

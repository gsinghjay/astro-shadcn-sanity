import {defineType, defineField} from 'sanity'

/** Canonical category options — frontend CATEGORY_LABELS in ImageGallery.astro must stay in sync */
export const GALLERY_CATEGORY_OPTIONS = [
  {title: 'Web Apps', value: 'web-apps'},
  {title: 'Mobile', value: 'mobile'},
  {title: 'AI/ML', value: 'ai-ml'},
  {title: 'Data Viz', value: 'data-viz'},
  {title: 'IoT', value: 'iot'},
  {title: 'Other', value: 'other'},
] as const

export const galleryImage = defineType({
  name: 'galleryImage',
  title: 'Gallery Image',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {hotspot: true},
      validation: (Rule) => Rule.required(),
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
      name: 'caption',
      title: 'Caption',
      type: 'string',
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
      description: 'Featured images appear in a larger hero row',
    }),
    defineField({
      name: 'year',
      title: 'Capstone Year',
      type: 'number',
      description: 'Capstone year this image belongs to',
      validation: (Rule) => Rule.min(2020).max(2099).integer(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [...GALLERY_CATEGORY_OPTIONS],
        layout: 'dropdown',
      },
    }),
  ],
  preview: {
    select: {title: 'caption', subtitle: 'year', media: 'image'},
    prepare({title, subtitle, media}) {
      return {
        title: title || 'Untitled',
        subtitle: subtitle ? String(subtitle) : '',
        media,
      }
    },
  },
})

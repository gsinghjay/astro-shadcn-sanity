import {defineType, defineField} from 'sanity'

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),
    defineField({
      name: 'blocks',
      title: 'Page Blocks',
      type: 'array',
      of: [
        {type: 'heroBanner'},
        {type: 'featureGrid'},
        {type: 'sponsorCards'},
        {type: 'richText'},
        {type: 'ctaBanner'},
        {type: 'faqSection'},
        {type: 'contactForm'},
        {type: 'timeline'},
        {type: 'logoCloud'},
        {type: 'statsRow'},
        {type: 'teamGrid'},
        {type: 'textWithImage'},
      ],
    }),
  ],
})

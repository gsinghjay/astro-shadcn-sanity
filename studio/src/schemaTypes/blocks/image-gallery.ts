import {defineField, defineArrayMember} from 'sanity'
import {ImagesIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'

export const imageGallery = defineBlock({
  name: 'imageGallery',
  title: 'Image Gallery',
  icon: ImagesIcon,
  variants: [
    {name: 'grid', title: 'Grid'},
    {name: 'masonry', title: 'Masonry'},
    {name: 'single', title: 'Single'},
  ],
  hiddenByVariant: {
    columns: ['masonry', 'single'],
  },
  fields: [
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
      validation: (Rule) => Rule.required().max(150),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      validation: (Rule) => Rule.max(500),
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      description: 'Gallery images with optional captions',
      of: [defineArrayMember({type: 'galleryImage'})],
      validation: (Rule) => Rule.required().min(1).max(30),
    }),
    defineField({
      name: 'columns',
      title: 'Columns',
      type: 'string',
      options: {
        list: [
          {title: '2 Columns', value: '2'},
          {title: '3 Columns', value: '3'},
          {title: '4 Columns', value: '4'},
        ],
        layout: 'radio',
      },
      initialValue: '3',
    }),
  ],
})

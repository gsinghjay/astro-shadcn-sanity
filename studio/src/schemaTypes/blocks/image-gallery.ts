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
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [defineArrayMember({type: 'galleryImage'})],
      validation: (Rule) => Rule.required().min(1),
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

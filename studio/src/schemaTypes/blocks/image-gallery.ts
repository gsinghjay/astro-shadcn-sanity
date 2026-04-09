import {defineField, defineArrayMember} from 'sanity'
import {ImagesIcon} from '@sanity/icons'
import {defineBlock} from '../helpers/defineBlock'
import {headerFields} from '../helpers/commonFields'

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
    ...headerFields(),
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

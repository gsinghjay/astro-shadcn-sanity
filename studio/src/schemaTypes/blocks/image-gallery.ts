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
  ],
})

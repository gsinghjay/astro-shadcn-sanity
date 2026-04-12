import ImageGallery from './ImageGallery.astro'

const imageRefs = [
  'image-523d2dda175c24fee4af8f6abc93a3b086ca5e69-3000x2000-jpg',
  'image-117be8afe69ff441c417bb9de6e457e82848aaf4-5712x4284-jpg',
  'image-73cbcec87cb346397bf7617af9b866cd2d827be0-1921x1441-jpg',
  'image-7203ad7a8e72a3bfd66d976594a68fc8ba555efc-1024x576-jpg',
  'image-526748e6980d684ad21fdbd7273c2731ed2f43a0-780x585-webp',
  'image-f0e8060516dbac8e78932f06932a17252b37164b-1920x1006-png',
]

const makeImage = (key: string, caption: string, index = 0) => ({
  _key: key,
  image: {
    _type: 'image' as const,
    asset: {
      _ref: imageRefs[index % imageRefs.length],
      _type: 'reference' as const,
    },
    alt: caption,
  },
  caption,
})

const galleryImages = [
  makeImage('gi-1', 'Architectural detail — concrete and glass', 0),
  makeImage('gi-2', 'Typography specimen wall', 1),
  makeImage('gi-3', 'Grid system in practice', 2),
  makeImage('gi-4', 'Geometric abstraction', 3),
  makeImage('gi-5', 'Negative space study', 4),
  makeImage('gi-6', 'Form follows function', 5),
]

export default {
  title: 'Components/ImageGallery',
  component: ImageGallery,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Image gallery with grid, masonry, and single-image layouts.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['grid', 'masonry', 'single'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary'],
      description: 'Background color theme',
    },
    spacing: {
      control: { type: 'select' },
      options: ['none', 'small', 'default', 'large'],
      description: 'Vertical padding',
    },
    maxWidth: {
      control: { type: 'select' },
      options: ['narrow', 'default', 'full'],
      description: 'Maximum content width',
    },
  },
}

export const Grid = {
  args: {
    _type: 'imageGallery',
    _key: 'story-ig-grid',
    variant: 'grid',
    heading: 'Photography',
    description: 'A curated selection of images exploring Swiss design principles in the built environment.',
    images: galleryImages,
  },
}

export const Masonry = {
  args: {
    _type: 'imageGallery',
    _key: 'story-ig-masonry',
    variant: 'masonry',
    heading: 'Visual Exploration',
    description: 'Images at their natural aspect ratios — photography speaks for itself.',
    images: galleryImages,
  },
}

export const Single = {
  args: {
    _type: 'imageGallery',
    _key: 'story-ig-single',
    variant: 'single',
    heading: 'Featured Image',
    images: [galleryImages[0]],
  },
}

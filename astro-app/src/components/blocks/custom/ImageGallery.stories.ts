import ImageGallery from './ImageGallery.astro'

const imageRefs = [
  'image-523d2dda175c24fee4af8f6abc93a3b086ca5e69-3000x2000-jpg',
  'image-117be8afe69ff441c417bb9de6e457e82848aaf4-5712x4284-jpg',
  'image-73cbcec87cb346397bf7617af9b866cd2d827be0-1921x1441-jpg',
  'image-7203ad7a8e72a3bfd66d976594a68fc8ba555efc-1024x576-jpg',
  'image-526748e6980d684ad21fdbd7273c2731ed2f43a0-780x585-webp',
  'image-f0e8060516dbac8e78932f06932a17252b37164b-1920x1006-png',
]

const makeImage = (
  key: string,
  caption: string,
  index = 0,
  opts?: { featured?: boolean; year?: number; category?: string },
) => ({
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
  featured: opts?.featured ?? null,
  year: opts?.year ?? null,
  category: opts?.category ?? null,
})

const galleryImages = [
  makeImage('gi-1', 'Architectural detail — concrete and glass', 0, { year: 2025, category: 'web-apps' }),
  makeImage('gi-2', 'Typography specimen wall', 1, { year: 2025, category: 'mobile' }),
  makeImage('gi-3', 'Grid system in practice', 2, { year: 2026, category: 'ai-ml' }),
  makeImage('gi-4', 'Geometric abstraction', 3, { year: 2026, category: 'data-viz' }),
  makeImage('gi-5', 'Negative space study', 4, { year: 2024, category: 'web-apps' }),
  makeImage('gi-6', 'Form follows function', 5, { year: 2024, category: 'iot' }),
]

export default {
  title: 'Components/ImageGallery',
  component: ImageGallery,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Image gallery with grid, masonry, and single-image layouts. Supports featured hero row, year/category filtering, PhotoSwipe lightbox with deep linking.',
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

export const FeaturedHero = {
  args: {
    _type: 'imageGallery',
    _key: 'story-ig-featured',
    variant: 'grid',
    heading: 'Capstone Showcase',
    description: 'Featured projects from the annual capstone exhibition — the best of student work across all disciplines.',
    images: [
      makeImage('gi-f1', 'Award-winning AI healthcare platform', 0, { featured: true, year: 2026, category: 'ai-ml' }),
      makeImage('gi-f2', 'Best in Show — real-time collaboration tool', 1, { featured: true, year: 2026, category: 'web-apps' }),
      makeImage('gi-r1', 'Smart campus IoT network', 2, { year: 2026, category: 'iot' }),
      makeImage('gi-r2', 'Mobile fitness tracker', 3, { year: 2025, category: 'mobile' }),
      makeImage('gi-r3', 'Climate data visualization dashboard', 4, { year: 2025, category: 'data-viz' }),
      makeImage('gi-r4', 'E-commerce recommendation engine', 5, { year: 2024, category: 'ai-ml' }),
    ],
  },
}

export const WithFilters = {
  args: {
    _type: 'imageGallery',
    _key: 'story-ig-filters',
    variant: 'grid',
    heading: 'Capstone Projects — Year over Year',
    description: 'Browse projects by year and category. Use the filter pills to narrow your view.',
    images: [
      makeImage('gi-y1', 'Neural network visualizer', 0, { year: 2026, category: 'ai-ml' }),
      makeImage('gi-y2', 'Cross-platform chat app', 1, { year: 2026, category: 'mobile' }),
      makeImage('gi-y3', 'Portfolio builder SaaS', 2, { year: 2025, category: 'web-apps' }),
      makeImage('gi-y4', 'Energy consumption tracker', 3, { year: 2025, category: 'data-viz' }),
      makeImage('gi-y5', 'Smart greenhouse controller', 4, { year: 2024, category: 'iot' }),
      makeImage('gi-y6', 'Legacy migration toolkit', 5, { year: 2024, category: 'other' }),
      makeImage('gi-y7', 'AR campus navigation', 0, { year: 2026, category: 'mobile' }),
      makeImage('gi-y8', 'Sentiment analysis dashboard', 1, { year: 2025, category: 'ai-ml' }),
    ],
  },
}

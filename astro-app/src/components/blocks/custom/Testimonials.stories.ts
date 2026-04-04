import Testimonials from './Testimonials.astro'
import { testimonialsData } from '../../__tests__/__fixtures__/testimonials'

export default {
  title: 'Components/Testimonials',
  component: Testimonials,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Displays sponsor and student testimonials in grid, masonry, split, carousel, or marquee layouts. Supports filtering by source type and grouping by project.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['grid', 'masonry', 'split', 'carousel', 'marquee'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    displayMode: {
      control: { type: 'select' },
      options: ['all', 'industry', 'student', 'byProject', 'manual'],
      description: 'Testimonial filtering mode',
    },
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

const industryTestimonials = testimonialsData.filter(t => t.type === 'industry')
const studentTestimonials = testimonialsData.filter(t => t.type === 'student')

export const Default = {
  args: {
    _type: 'testimonials',
    _key: 'story-tm-1',
    heading: 'What People Say',
    displayMode: 'all',
    testimonials: testimonialsData,
  },
}

export const IndustryOnly = {
  args: {
    _type: 'testimonials',
    _key: 'story-tm-2',
    heading: 'Industry Partners',
    displayMode: 'industry',
    testimonials: industryTestimonials,
  },
}

export const StudentOnly = {
  args: {
    _type: 'testimonials',
    _key: 'story-tm-3',
    heading: 'Student Voices',
    displayMode: 'student',
    testimonials: studentTestimonials,
  },
}

export const ByProject = {
  args: {
    _type: 'testimonials',
    _key: 'story-tm-4',
    heading: 'Impact Case Studies',
    displayMode: 'byProject',
    testimonials: testimonialsData.filter(t => t.project != null),
  },
}

export const Manual = {
  args: {
    _type: 'testimonials',
    _key: 'story-tm-5',
    heading: 'Featured Testimonials',
    displayMode: 'manual',
    testimonials: [testimonialsData[0]],
  },
}

export const Empty = {
  args: {
    _type: 'testimonials',
    _key: 'story-tm-6',
    heading: 'Testimonials',
    displayMode: 'all',
    testimonials: [],
  },
}

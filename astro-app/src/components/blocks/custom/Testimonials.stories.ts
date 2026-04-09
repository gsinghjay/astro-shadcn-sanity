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
      options: ['grid', 'masonry', 'split', 'carousel', 'marquee', 'brutalist-quote', 'spotlight'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    testimonialSource: {
      control: { type: 'select' },
      options: ['all', 'industry', 'student', 'byProject', 'manual'],
      description: 'Testimonial filtering mode',
    },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary', 'hatched', 'hatched-light'],
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
    testimonialSource: 'all',
    testimonials: testimonialsData,
  },
}

export const IndustryOnly = {
  args: {
    _type: 'testimonials',
    _key: 'story-tm-2',
    heading: 'Industry Partners',
    testimonialSource: 'industry',
    testimonials: industryTestimonials,
  },
}

export const StudentOnly = {
  args: {
    _type: 'testimonials',
    _key: 'story-tm-3',
    heading: 'Student Voices',
    testimonialSource: 'student',
    testimonials: studentTestimonials,
  },
}

export const ByProject = {
  args: {
    _type: 'testimonials',
    _key: 'story-tm-4',
    heading: 'Impact Case Studies',
    testimonialSource: 'byProject',
    testimonials: testimonialsData.filter(t => t.project != null),
  },
}

export const Manual = {
  args: {
    _type: 'testimonials',
    _key: 'story-tm-5',
    heading: 'Featured Testimonials',
    testimonialSource: 'manual',
    testimonials: [testimonialsData[0]],
  },
}

export const Empty = {
  args: {
    _type: 'testimonials',
    _key: 'story-tm-6',
    heading: 'Testimonials',
    testimonialSource: 'all',
    testimonials: [],
  },
}

export const BrutalistQuote = {
  args: {
    _type: 'testimonials',
    _key: 'story-test-brutalist',
    variant: 'brutalist-quote',
    heading: 'What Partners Say',
    backgroundVariant: 'hatched',
    testimonialSource: 'industry',
    testimonials: testimonialsData.filter((t) => t.type === 'industry'),
  },
}

export const Spotlight = {
  args: {
    _type: 'testimonials',
    _key: 'story-test-spotlight',
    variant: 'spotlight',
    heading: 'Partner Spotlight',
    testimonialSource: 'manual',
    testimonials: [testimonialsData[0]],
  },
}

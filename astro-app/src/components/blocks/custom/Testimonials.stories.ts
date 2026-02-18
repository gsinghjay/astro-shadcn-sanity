import Testimonials from './Testimonials.astro'
import { testimonialsData } from '../../__tests__/__fixtures__/testimonials'

export default {
  title: 'Blocks/Testimonials',
  component: Testimonials,
  tags: ['autodocs'],
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

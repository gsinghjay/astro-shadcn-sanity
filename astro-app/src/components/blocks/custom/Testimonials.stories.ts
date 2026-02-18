import Testimonials from './Testimonials.astro'

export default {
  title: 'Blocks/Testimonials',
  component: Testimonials,
  tags: ['autodocs'],
}

const industryTestimonials = [
  {
    _id: 't1',
    name: 'Jane Smith',
    quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    role: 'CTO',
    organization: 'Acme Corp',
    type: 'industry',
    photo: {
      asset: { _id: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-200x200-png', url: 'https://cdn.sanity.io/images/test/test/Tb9Ew8CXIwaY6R1kjMvI0uRR-200x200.png', metadata: null },
      alt: 'Jane Smith photo',
      hotspot: null,
      crop: null,
    },
    project: { _id: 'p1', title: 'AI Dashboard', slug: 'ai-dashboard' },
  },
  {
    _id: 't2',
    name: 'Maria Garcia',
    quote: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.',
    role: 'VP of Engineering',
    organization: 'Beta Inc',
    type: 'industry',
  },
]

const studentTestimonials = [
  {
    _id: 't3',
    name: 'John Doe',
    quote: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    role: 'Student',
    organization: 'NJIT',
    type: 'student',
    project: { _id: 'p1', title: 'AI Dashboard', slug: 'ai-dashboard' },
  },
  {
    _id: 't4',
    name: 'Alex Chen',
    quote: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.',
    type: 'student',
    project: { _id: 'p2', title: 'Mobile App', slug: 'mobile-app' },
  },
]

const allTestimonials = [...industryTestimonials, ...studentTestimonials]

export const Default = {
  args: {
    _type: 'testimonials',
    _key: 'story-tm-1',
    heading: 'What People Say',
    displayMode: 'all',
    testimonials: allTestimonials,
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
    testimonials: allTestimonials.filter(t => t.project),
  },
}

export const Manual = {
  args: {
    _type: 'testimonials',
    _key: 'story-tm-5',
    heading: 'Featured Testimonials',
    displayMode: 'manual',
    testimonials: [allTestimonials[0]],
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

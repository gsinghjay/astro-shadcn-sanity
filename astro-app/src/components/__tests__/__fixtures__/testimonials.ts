import type { Testimonial } from '@/lib/sanity';

export const testimonialsData: Testimonial[] = [
  {
    _id: 'testimonial-1',
    name: 'Jane Smith',
    quote: 'This project transformed our workflow and saved us hundreds of hours.',
    role: 'CTO',
    organization: 'Acme Corp',
    type: 'industry',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    photo: {
      asset: { _id: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-200x200-png', url: 'https://cdn.sanity.io/images/test-project/test-dataset/Tb9Ew8CXIwaY6R1kjMvI0uRR-200x200.png', metadata: null },
      alt: 'Jane Smith photo',
      hotspot: null,
      crop: null,
    },
    project: { _id: 'project-1', title: 'AI Dashboard', slug: 'ai-dashboard' },
  },
  {
    _id: 'testimonial-2',
    name: 'John Doe',
    quote: 'Working on this capstone project was the highlight of my academic career.',
    role: 'Student',
    organization: 'NJIT',
    type: 'student',
    videoUrl: null,
    photo: null,
    project: { _id: 'project-1', title: 'AI Dashboard', slug: 'ai-dashboard' },
  },
  {
    _id: 'testimonial-3',
    name: 'Maria Garcia',
    quote: 'The team delivered exactly what we needed on time and on budget.',
    role: 'VP of Engineering',
    organization: 'Beta Inc',
    type: 'industry',
    videoUrl: 'https://youtu.be/jNQXAC9IVRw',
    photo: null,
    project: null,
  },
  {
    _id: 'testimonial-4',
    name: 'Alex Chen',
    quote: 'I gained real-world experience that prepared me for my first job.',
    role: null,
    organization: null,
    type: 'student',
    videoUrl: null,
    photo: null,
    project: { _id: 'project-2', title: 'Mobile App', slug: 'mobile-app' },
  },
];

export const testimonialEmbedUrl: Testimonial = {
  _id: 'testimonial-5',
  name: 'Pat Rivera',
  quote: 'Embedding videos made our presentations stand out.',
  role: 'Designer',
  organization: 'Gamma LLC',
  type: 'industry',
  videoUrl: 'https://www.youtube.com/embed/L_jWHffIx5E',
  photo: null,
  project: null,
};

export const testimonialInvalidUrl: Testimonial = {
  _id: 'testimonial-6',
  name: 'Sam Taylor',
  quote: 'Great experience overall.',
  role: 'Manager',
  organization: 'Delta Co',
  type: 'industry',
  videoUrl: 'https://vimeo.com/12345',
  photo: null,
  project: null,
};

export const testimonialsFull = {
  _type: 'testimonials' as const,
  _key: 'test-tm-1',
  backgroundVariant: null,
  spacing: 'default' as const,
  maxWidth: 'default' as const,
  heading: 'What People Say',
  testimonialSource: 'all' as const,
  testimonials: testimonialsData,
};

export const testimonialsMinimal = {
  _type: 'testimonials' as const,
  _key: 'test-tm-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: null,
  testimonialSource: null,
  testimonials: undefined as Testimonial[] | undefined,
};

export const testimonialsByProject = {
  _type: 'testimonials' as const,
  _key: 'test-tm-3',
  backgroundVariant: null,
  spacing: 'default' as const,
  maxWidth: 'default' as const,
  heading: 'Impact Case Studies',
  testimonialSource: 'byProject' as const,
  testimonials: testimonialsData.filter(t => t.project != null),
};

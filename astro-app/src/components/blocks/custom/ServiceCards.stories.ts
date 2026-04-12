import ServiceCards from './ServiceCards.astro'

const sharedServices = [
  {
    _key: 'svc-1',
    title: 'Strategy & Consulting',
    description: 'Expert guidance to align technology with business objectives and drive measurable outcomes.',
    icon: '🎯',
  },
  {
    _key: 'svc-2',
    title: 'Design & Experience',
    description: 'User-centered design that creates intuitive, engaging digital experiences across platforms.',
    icon: '🎨',
  },
  {
    _key: 'svc-3',
    title: 'Development & Engineering',
    description: 'Full-stack development with modern frameworks, built for scalability and performance.',
    icon: '⚡',
  },
  {
    _key: 'svc-4',
    title: 'Cloud & Infrastructure',
    description: 'Reliable cloud architecture with automated deployment pipelines and monitoring.',
    icon: '☁️',
  },
  {
    _key: 'svc-5',
    title: 'Data & Analytics',
    description: 'Turn raw data into actionable insights with dashboards and predictive modeling.',
    icon: '📊',
  },
  {
    _key: 'svc-6',
    title: 'Support & Maintenance',
    description: 'Ongoing support with SLA-backed response times and proactive system monitoring.',
    icon: '🛠️',
  },
]

export default {
  title: 'Components/ServiceCards',
  component: ServiceCards,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Service offering cards with grid, list, alternating, and icon-grid layouts for showcasing capabilities.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['grid', 'list', 'alternating', 'icon-grid', 'specification'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    description: { control: 'text', description: 'Section description' },
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

export const Grid = {
  args: {
    _type: 'serviceCards',
    _key: 'story-services-grid',
    variant: 'grid',
    heading: 'What We Offer',
    description: 'Comprehensive solutions tailored to your needs.',
    services: sharedServices,
  },
}

export const List = {
  args: {
    _type: 'serviceCards',
    _key: 'story-services-list',
    variant: 'list',
    heading: 'Our Services',
    description: 'End-to-end capabilities to accelerate your digital transformation.',
    services: sharedServices,
  },
}

export const Alternating = {
  args: {
    _type: 'serviceCards',
    _key: 'story-services-alternating',
    variant: 'alternating',
    heading: 'How We Work',
    description: 'A proven approach to delivering exceptional results.',
    services: sharedServices.slice(0, 4),
  },
}

export const IconGrid = {
  args: {
    _type: 'serviceCards',
    _key: 'story-services-icon-grid',
    variant: 'icon-grid',
    heading: 'Capabilities',
    description: 'Everything you need under one roof.',
    services: sharedServices,
  },
}

export const Specification = {
  args: {
    _type: 'serviceCards',
    _key: 'story-services-spec',
    variant: 'specification',
    heading: 'Capabilities',
    description: 'What our capstone teams deliver.',
    backgroundVariant: 'hatched-light',
    services: [
      { _key: 'spec1', title: 'Full-Stack Development', description: 'React, Next.js, Astro, Node.js — modern frameworks, production deployments.', icon: '⚡' },
      { _key: 'spec2', title: 'Machine Learning', description: 'Predictive models, NLP pipelines, computer vision — from prototype to production.', icon: '🧠' },
      { _key: 'spec3', title: 'Cloud Architecture', description: 'AWS, Azure, GCP — scalable infrastructure with CI/CD and monitoring.', icon: '☁️' },
      { _key: 'spec4', title: 'Cybersecurity', description: 'Zero trust, microsegmentation, blockchain DNS — enterprise security solutions.', icon: '🔒' },
      { _key: 'spec5', title: 'Data Engineering', description: 'ETL pipelines, real-time analytics, data lake architecture.', icon: '📊' },
      { _key: 'spec6', title: 'Mobile & IoT', description: '5G-enabled applications, cross-platform mobile, embedded systems.', icon: '📱' },
    ],
  },
}

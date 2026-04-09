import ProjectCards from './ProjectCards.astro'

export default {
  title: 'Components/ProjectCards',
  component: ProjectCards,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Grid display of capstone project cards with status, sponsor, and technology metadata. Supports default, case-study, and blueprint layout variants.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'case-study', 'blueprint'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    displayMode: {
      control: { type: 'select' },
      options: ['all', 'featured', 'manual'],
      description: 'Project filtering mode',
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

const sharedProjects = [
  {
    _id: 'proj-1',
    title: 'Zero Trust Microsegmentation Network',
    status: 'completed',
    description: 'Enterprise network security architecture with granular access controls and real-time threat monitoring.',
    sponsor: { name: 'Cisco', tier: 'platinum' },
    tags: ['Cybersecurity', 'Networking', 'Zero Trust'],
  },
  {
    _id: 'proj-2',
    title: '5G-Enabled Alzheimer\'s Care Application',
    status: 'completed',
    description: 'Telemedicine platform leveraging 5G for real-time patient monitoring and caregiver coordination.',
    sponsor: { name: 'Verizon', tier: 'platinum' },
    tags: ['Healthcare', '5G', 'Mobile'],
  },
  {
    _id: 'proj-3',
    title: 'ML Article Appeal Prediction',
    status: 'completed',
    description: 'Machine learning pipeline for predicting content engagement and editorial prioritization.',
    sponsor: { name: 'Forbes', tier: 'gold' },
    tags: ['Machine Learning', 'NLP', 'Analytics'],
  },
  {
    _id: 'proj-4',
    title: 'Azure ML Resource Optimization',
    status: 'completed',
    description: 'Cloud cost optimization using ML-driven resource allocation and predictive scaling.',
    sponsor: { name: 'Bank of America', tier: 'gold' },
    tags: ['Cloud', 'Azure', 'ML'],
  },
]

export const Default = {
  args: {
    _type: 'projectCards',
    _key: 'story-projects-default',
    heading: 'Capstone Projects',
    displayMode: 'all',
    projects: sharedProjects,
  },
}

export const CaseStudy = {
  args: {
    _type: 'projectCards',
    _key: 'story-projects-case-study',
    variant: 'case-study',
    heading: 'Impact Case Studies',
    displayMode: 'featured',
    projects: sharedProjects,
  },
}

export const Blueprint = {
  args: {
    _type: 'projectCards',
    _key: 'story-projects-blueprint',
    variant: 'blueprint',
    heading: 'Technical Portfolio',
    displayMode: 'all',
    backgroundVariant: 'dark',
    projects: sharedProjects,
  },
}

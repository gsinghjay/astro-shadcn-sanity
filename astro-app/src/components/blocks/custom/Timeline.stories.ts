import Timeline from './Timeline.astro'

const timelineEntries = [
  { _key: 'te-1', date: '2020', title: 'Foundation', description: 'The project was conceived during a university hackathon focused on community technology.', image: null },
  { _key: 'te-2', date: 'March 2021', title: 'First Prototype', description: 'A working MVP was built using Astro and Sanity, serving as the proof of concept for sponsors.', image: null },
  { _key: 'te-3', date: 'Q3 2022', title: 'Official Launch', description: 'Public launch with 12 founding sponsors and 50 active community members.', image: null },
  { _key: 'te-4', date: 'January 2023', title: 'Growth Phase', description: 'Expanded to three campuses with dedicated mentorship programs and industry partnerships.', image: null },
  { _key: 'te-5', date: '2024', title: 'National Recognition', description: 'Awarded top community technology initiative by the National Tech Council.', image: null },
]

const ctaButtons = [
  { _key: 'btn-1', text: 'Join Our Story', url: '/about', variant: 'default' },
]

export default {
  title: 'Components/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Chronological timeline of events or milestones. Supports vertical, split (alternating), and horizontal layouts.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['vertical', 'split', 'horizontal', 'engineering'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
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

export const Vertical = {
  args: {
    _type: 'timeline',
    _key: 'story-tl-vertical',
    backgroundVariant: 'white',
    spacing: 'default',
    maxWidth: 'default',
    variant: 'vertical',
    heading: 'Our Journey',
    description: 'Key milestones from founding to national recognition.',
    items: timelineEntries,
    links: ctaButtons,
  },
}

export const Split = {
  args: {
    _type: 'timeline',
    _key: 'story-tl-split',
    backgroundVariant: 'white',
    spacing: 'default',
    maxWidth: 'default',
    variant: 'split',
    heading: 'Project Timeline',
    description: 'Alternating left and right for a balanced composition.',
    items: timelineEntries,
    links: ctaButtons,
  },
}

export const Horizontal = {
  args: {
    _type: 'timeline',
    _key: 'story-tl-horizontal',
    backgroundVariant: 'white',
    spacing: 'default',
    maxWidth: 'default',
    variant: 'horizontal',
    heading: 'Milestones',
    items: timelineEntries,
  },
}

export const Short = {
  args: {
    _type: 'timeline',
    _key: 'story-tl-short',
    backgroundVariant: 'white',
    spacing: 'default',
    maxWidth: 'default',
    variant: 'vertical',
    heading: 'Recent Updates',
    items: timelineEntries.slice(0, 3),
  },
}

export const Engineering = {
  args: {
    _type: 'timeline',
    _key: 'story-timeline-engineering',
    variant: 'engineering',
    heading: 'Program Milestones',
    description: 'A decade of industry-academic partnership.',
    items: [
      { _key: 'te-e1', date: '2016', title: 'Program Founded', description: 'Ying Wu College of Computing launches the Capstone Program with 3 industry partners.' },
      { _key: 'te-e2', date: '2018', title: 'First Fortune 500 Partner', description: 'Cisco joins as the first platinum-tier sponsor, funding network security projects.' },
      { _key: 'te-e3', date: '2020', title: '50 Projects Milestone', description: 'Program reaches 50 completed capstone projects across 12 technology domains.' },
      { _key: 'te-e4', date: '2023', title: 'Verizon Partnership', description: '5G healthcare and workforce optimization projects expand the program\'s scope.' },
      { _key: 'te-e5', date: '2025', title: '94% Placement Rate', description: 'Program achieves record graduate placement at Fortune 500 companies.' },
      { _key: 'te-e6', date: '2026', title: 'Top 40 Recognition', description: 'NJIT ranked in top 40 public universities nationally for STEM outcomes.' },
    ],
  },
}

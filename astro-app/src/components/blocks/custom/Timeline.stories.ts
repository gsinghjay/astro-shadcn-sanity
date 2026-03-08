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
  title: 'Blocks/Timeline',
  component: Timeline,
  tags: ['autodocs'],
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

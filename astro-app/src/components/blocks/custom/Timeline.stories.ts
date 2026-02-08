import Timeline from './Timeline.astro'

export default {
  title: 'Blocks/Timeline',
  component: Timeline,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
}

export const Default = {
  args: {
    block: {
      _type: 'timeline',
      _key: 'story-timeline-1',
      label: 'Timeline',
      headline: 'Program Schedule',
      events: [
        {
          _key: 'e1',
          date: 'January 2025',
          title: 'Lorem Ipsum Kickoff',
          description: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
        },
        {
          _key: 'e2',
          date: 'March 2025',
          title: 'Dolor Sit Review',
          description: 'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit sed quia.',
        },
        {
          _key: 'e3',
          date: 'May 2025',
          title: 'Amet Design Phase',
          description: 'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam.',
        },
        {
          _key: 'e4',
          date: 'July 2025',
          title: 'Consectetur Review',
          description: 'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil.',
        },
        {
          _key: 'e5',
          date: 'September 2025',
          title: 'Adipiscing Demo',
          description: 'At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium.',
        },
        {
          _key: 'e6',
          date: 'November 2025',
          title: 'Elit Showcase',
          description: 'Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus.',
        },
      ],
    },
  },
}

export const ShortTimeline = {
  args: {
    block: {
      _type: 'timeline',
      _key: 'story-timeline-2',
      headline: 'Key Dates',
      events: [
        {
          _key: 'e1',
          date: 'Jan 1',
          title: 'Lorem Opens',
        },
        {
          _key: 'e2',
          date: 'Feb 15',
          title: 'Ipsum Closes',
        },
        {
          _key: 'e3',
          date: 'Mar 15',
          title: 'Dolor Announced',
        },
      ],
    },
  },
}

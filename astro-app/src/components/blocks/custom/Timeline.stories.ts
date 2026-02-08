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
      label: 'Program Timeline',
      headline: 'Spring 2027 Semester',
      events: [
        {
          _key: 'e1',
          date: 'September 2026',
          title: 'Sponsor Proposals Due',
          description: 'Industry partners submit project proposals describing their business challenges and technical requirements.',
        },
        {
          _key: 'e2',
          date: 'October 2026',
          title: 'Project Scoping',
          description: 'Faculty review proposals, refine scope, and match projects to student skill profiles.',
        },
        {
          _key: 'e3',
          date: 'January 2027',
          title: 'Kickoff Week',
          description: 'Teams meet their sponsors, establish communication channels, and define sprint cadence.',
        },
        {
          _key: 'e4',
          date: 'February 2027',
          title: 'Milestone 1: Architecture Review',
          description: 'Teams present system architecture and technology decisions to faculty and sponsors.',
        },
        {
          _key: 'e5',
          date: 'March 2027',
          title: 'Milestone 2: MVP Demo',
          description: 'Working minimum viable product demonstrated to sponsors with feedback incorporated.',
        },
        {
          _key: 'e6',
          date: 'May 2027',
          title: 'Demo Day',
          description: 'Final presentations to sponsors, faculty, and industry guests. Awards for outstanding projects.',
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
          date: 'Nov 1',
          title: 'Applications Open',
        },
        {
          _key: 'e2',
          date: 'Dec 15',
          title: 'Applications Close',
        },
        {
          _key: 'e3',
          date: 'Jan 15',
          title: 'Teams Announced',
        },
      ],
    },
  },
}

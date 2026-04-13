import EventList from './EventList.astro'
import { eventsData } from '../../__tests__/__fixtures__/events'

export default {
  title: 'Components/EventList',
  component: EventList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Renders a list of program events with status badges, dates, and descriptions. Supports filtering by event status (upcoming, past, all) and three layout variants: grid (cards), list (compact), and timeline (chronological).',
      },
    },
  },
  argTypes: {
    heading: { control: 'text', description: 'Section heading' },
    variant: {
      control: { type: 'select' },
      options: ['grid', 'list', 'timeline'],
      description: 'Layout variant',
    },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary'],
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

const upcomingEvents = eventsData.filter(e => e.status === 'upcoming')
const pastEvents = eventsData.filter(e => e.status === 'past')

export const Grid = {
  args: {
    _type: 'eventList',
    _key: 'story-ev-grid',
    heading: 'Upcoming Events',
    variant: 'grid',
    eventStatus: 'upcoming',
    limit: 10,
    events: upcomingEvents,
  },
}

export const List = {
  args: {
    _type: 'eventList',
    _key: 'story-ev-list',
    heading: 'All Events',
    variant: 'list',
    eventStatus: 'all',
    limit: 10,
    events: eventsData,
  },
}

export const Timeline = {
  args: {
    _type: 'eventList',
    _key: 'story-ev-timeline',
    heading: 'Event Timeline',
    variant: 'timeline',
    eventStatus: 'all',
    events: eventsData,
  },
}

export const GridAllEvents = {
  args: {
    _type: 'eventList',
    _key: 'story-ev-2',
    heading: 'All Events',
    variant: 'grid',
    eventStatus: 'all',
    limit: 10,
    events: eventsData,
  },
}

export const ListPastEvents = {
  args: {
    _type: 'eventList',
    _key: 'story-ev-3',
    heading: 'Past Events',
    variant: 'list',
    eventStatus: 'past',
    limit: 10,
    events: pastEvents,
  },
}

export const Empty = {
  args: {
    _type: 'eventList',
    _key: 'story-ev-4',
    heading: 'Events',
    variant: 'grid',
    eventStatus: 'all',
    limit: 10,
    events: [],
  },
}

export const SingleEvent = {
  args: {
    _type: 'eventList',
    _key: 'story-ev-5',
    heading: 'Featured Event',
    variant: 'grid',
    eventStatus: 'upcoming',
    limit: 1,
    events: [upcomingEvents[0]],
  },
}

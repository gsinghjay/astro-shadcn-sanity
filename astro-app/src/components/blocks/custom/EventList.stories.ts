import EventList from './EventList.astro'
import { eventsData } from '../../__tests__/__fixtures__/events'

export default {
  title: 'Blocks/EventList',
  component: EventList,
  tags: ['autodocs'],
}

const upcomingEvents = eventsData.filter(e => e.status === 'upcoming')
const pastEvents = eventsData.filter(e => e.status === 'past')

export const Default = {
  args: {
    _type: 'eventList',
    _key: 'story-ev-1',
    heading: 'Upcoming Events',
    filterBy: 'upcoming',
    limit: 10,
    events: upcomingEvents,
  },
}

export const AllEvents = {
  args: {
    _type: 'eventList',
    _key: 'story-ev-2',
    heading: 'All Events',
    filterBy: 'all',
    limit: 10,
    events: eventsData,
  },
}

export const PastEvents = {
  args: {
    _type: 'eventList',
    _key: 'story-ev-3',
    heading: 'Past Events',
    filterBy: 'past',
    limit: 10,
    events: pastEvents,
  },
}

export const Empty = {
  args: {
    _type: 'eventList',
    _key: 'story-ev-4',
    heading: 'Events',
    filterBy: 'all',
    limit: 10,
    events: [],
  },
}

export const SingleEvent = {
  args: {
    _type: 'eventList',
    _key: 'story-ev-5',
    heading: 'Featured Event',
    filterBy: 'upcoming',
    limit: 1,
    events: [upcomingEvents[0]],
  },
}

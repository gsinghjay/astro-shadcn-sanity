import EventList from './EventList.astro'

export default {
  title: 'Blocks/EventList',
  component: EventList,
  tags: ['autodocs'],
}

const upcomingEvents = [
  {
    _id: 'event-1',
    title: 'Spring Showcase 2026',
    slug: 'spring-showcase-2026',
    date: '2026-04-15T14:00:00Z',
    endDate: '2026-04-15T18:00:00Z',
    location: 'NJIT Campus Center Ballroom',
    description: 'Join us for our Spring 2026 Capstone Showcase where student teams present their projects to industry sponsors and faculty.',
    eventType: 'showcase',
    status: 'upcoming',
  },
  {
    _id: 'event-2',
    title: 'Sponsor Networking Mixer',
    slug: 'sponsor-networking-mixer',
    date: '2026-03-20T17:30:00Z',
    endDate: '2026-03-20T19:30:00Z',
    location: 'Ying Wu College of Computing',
    description: 'An evening networking event connecting industry sponsors with student development teams.',
    eventType: 'networking',
    status: 'upcoming',
  },
  {
    _id: 'event-5',
    title: 'Agile Methods Workshop',
    slug: 'agile-methods-workshop',
    date: '2026-02-28T13:00:00Z',
    endDate: null,
    location: 'Virtual (Zoom)',
    description: 'Learn agile development methodologies including Scrum and Kanban. Perfect for teams starting their capstone projects.',
    eventType: 'workshop',
    status: 'upcoming',
  },
]

const pastEvents = [
  {
    _id: 'event-3',
    title: 'Git & CI/CD Workshop',
    slug: 'git-cicd-workshop',
    date: '2025-11-10T10:00:00Z',
    endDate: '2025-11-10T12:00:00Z',
    location: 'GITC Room 3700',
    description: 'Hands-on workshop covering Git branching strategies, pull request workflows, and CI/CD pipeline setup.',
    eventType: 'workshop',
    status: 'past',
  },
  {
    _id: 'event-4',
    title: 'Fall 2025 Showcase',
    slug: 'fall-2025-showcase',
    date: '2025-12-05T14:00:00Z',
    endDate: null,
    location: null,
    description: null,
    eventType: 'showcase',
    status: 'past',
  },
]

const allEvents = [...upcomingEvents, ...pastEvents]

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
    events: allEvents,
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

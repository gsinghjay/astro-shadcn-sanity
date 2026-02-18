import type { SanityEvent } from '@/lib/sanity';

export const eventsData: SanityEvent[] = [
  {
    _id: 'event-1',
    title: 'Spring Showcase 2026',
    slug: 'spring-showcase-2026',
    date: '2026-04-15T14:00:00Z',
    endDate: '2026-04-15T18:00:00Z',
    location: 'NJIT Campus Center Ballroom',
    description: 'Join us for our Spring 2026 Capstone Showcase where student teams present their projects to industry sponsors and faculty. Light refreshments provided.',
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
    description: 'An evening networking event connecting industry sponsors with student development teams. Discuss project progress, share insights, and build connections.',
    eventType: 'networking',
    status: 'upcoming',
  },
  {
    _id: 'event-3',
    title: 'Git & CI/CD Workshop',
    slug: 'git-cicd-workshop',
    date: '2025-11-10T10:00:00Z',
    endDate: '2025-11-10T12:00:00Z',
    location: 'GITC Room 3700',
    description: 'Hands-on workshop covering Git branching strategies, pull request workflows, and CI/CD pipeline setup with GitHub Actions.',
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
  {
    _id: 'event-5',
    title: 'Agile Methods Workshop',
    slug: 'agile-methods-workshop',
    date: '2026-02-28T13:00:00Z',
    endDate: null,
    location: 'Virtual (Zoom)',
    description: 'Learn agile development methodologies including Scrum and Kanban. Perfect for teams starting their capstone projects this semester. This workshop covers sprint planning, daily standups, retrospectives, and more practical techniques.',
    eventType: 'workshop',
    status: 'upcoming',
  },
];

export const eventsFull = {
  _type: 'eventList' as const,
  _key: 'test-ev-1',
  backgroundVariant: null,
  spacing: 'default' as const,
  maxWidth: 'default' as const,
  heading: 'Upcoming Events',
  filterBy: 'upcoming' as const,
  limit: 10,
  events: eventsData.filter(e => e.status === 'upcoming'),
};

export const eventsMinimal = {
  _type: 'eventList' as const,
  _key: 'test-ev-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: null,
  filterBy: null,
  limit: null,
  events: undefined as SanityEvent[] | undefined,
};

export const eventsAll = {
  _type: 'eventList' as const,
  _key: 'test-ev-3',
  backgroundVariant: null,
  spacing: 'default' as const,
  maxWidth: 'default' as const,
  heading: 'All Events',
  filterBy: 'all' as const,
  limit: 10,
  events: eventsData,
};

export const eventsPast = {
  _type: 'eventList' as const,
  _key: 'test-ev-4',
  backgroundVariant: null,
  spacing: 'default' as const,
  maxWidth: 'default' as const,
  heading: 'Past Events',
  filterBy: 'past' as const,
  limit: 10,
  events: eventsData.filter(e => e.status === 'past'),
};

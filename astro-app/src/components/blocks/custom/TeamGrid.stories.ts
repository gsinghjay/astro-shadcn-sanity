import TeamGrid from './TeamGrid.astro'

export default {
  title: 'Blocks/TeamGrid',
  component: TeamGrid,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    block: {
      _type: 'teamGrid',
      _key: 'story-team-1',
      label: 'Our Teams',
      headline: 'Lorem Ipsum Teams',
      subtitle: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      teams: [
        {
          _key: 't1',
          teamName: 'Team Alpha',
          sponsor: 'Acme Corp',
          project: 'Lorem Ipsum Dashboard',
          members: [
            { _key: 'm1', name: 'Jane Doe', role: 'Team Lead', major: 'Computer Science' },
            { _key: 'm2', name: 'John Smith', role: 'Frontend Dev', major: 'Information Technology' },
            { _key: 'm3', name: 'Alex Johnson', role: 'Backend Dev', major: 'Computer Science' },
            { _key: 'm4', name: 'Sam Wilson', role: 'UX Designer', major: 'Human-Computer Interaction' },
            { _key: 'm5', name: 'Taylor Brown', role: 'Data Engineer', major: 'Data Science' },
          ],
        },
        {
          _key: 't2',
          teamName: 'Team Beta',
          sponsor: 'Ipsum Solutions',
          project: 'Dolor Sit Portal',
          members: [
            { _key: 'm1', name: 'Chris Park', role: 'Team Lead', major: 'Software Engineering' },
            { _key: 'm2', name: 'Casey Davis', role: 'Full Stack Dev', major: 'Computer Science' },
            { _key: 'm3', name: 'Jordan Miller', role: 'Mobile Dev', major: 'Information Technology' },
            { _key: 'm4', name: 'Riley Garcia', role: 'QA Lead', major: 'Computer Science' },
          ],
        },
      ],
    },
  },
}

export const SingleTeam = {
  args: {
    block: {
      _type: 'teamGrid',
      _key: 'story-team-2',
      headline: 'Leadership Team',
      teams: [
        {
          _key: 't1',
          teamName: 'Program Leadership',
          members: [
            { _key: 'm1', name: 'Jane Doe', role: 'Director', imageUrl: 'https://placehold.co/80x80/e2e8f0/475569?text=JD' },
            { _key: 'm2', name: 'John Smith', role: 'Technical Advisor', imageUrl: 'https://placehold.co/80x80/e2e8f0/475569?text=JS' },
            { _key: 'm3', name: 'Alex Johnson', role: 'Liaison', imageUrl: 'https://placehold.co/80x80/e2e8f0/475569?text=AJ' },
          ],
        },
      ],
    },
  },
}

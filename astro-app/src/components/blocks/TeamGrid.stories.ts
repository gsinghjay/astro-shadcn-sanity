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
      headline: 'Spring 2027 Capstone Teams',
      subtitle: 'Meet the students building real-world solutions for our industry partners.',
      teams: [
        {
          _key: 't1',
          teamName: 'Team Alpha',
          sponsor: 'Prudential',
          project: 'Customer Analytics Dashboard',
          members: [
            { _key: 'm1', name: 'Alex Rivera', role: 'Team Lead', major: 'Computer Science' },
            { _key: 'm2', name: 'Jordan Chen', role: 'Frontend Dev', major: 'Information Technology' },
            { _key: 'm3', name: 'Sam Patel', role: 'Backend Dev', major: 'Computer Science' },
            { _key: 'm4', name: 'Morgan Lee', role: 'UX Designer', major: 'Human-Computer Interaction' },
            { _key: 'm5', name: 'Taylor Kim', role: 'Data Engineer', major: 'Data Science' },
          ],
        },
        {
          _key: 't2',
          teamName: 'Team Beta',
          sponsor: 'ADP',
          project: 'Employee Onboarding Portal',
          members: [
            { _key: 'm1', name: 'Casey Wright', role: 'Team Lead', major: 'Software Engineering' },
            { _key: 'm2', name: 'Dana Okafor', role: 'Full Stack Dev', major: 'Computer Science' },
            { _key: 'm3', name: 'Ellis Park', role: 'Mobile Dev', major: 'Information Technology' },
            { _key: 'm4', name: 'Frankie Diaz', role: 'QA Lead', major: 'Computer Science' },
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
      headline: 'Faculty Advisors',
      teams: [
        {
          _key: 't1',
          teamName: 'Program Leadership',
          members: [
            { _key: 'm1', name: 'Dr. Sarah Johnson', role: 'Program Director', imageUrl: 'https://placehold.co/80x80/e2e8f0/475569?text=SJ' },
            { _key: 'm2', name: 'Prof. Michael Torres', role: 'Technical Advisor', imageUrl: 'https://placehold.co/80x80/e2e8f0/475569?text=MT' },
            { _key: 'm3', name: 'Dr. Lisa Wang', role: 'Industry Liaison', imageUrl: 'https://placehold.co/80x80/e2e8f0/475569?text=LW' },
          ],
        },
      ],
    },
  },
}

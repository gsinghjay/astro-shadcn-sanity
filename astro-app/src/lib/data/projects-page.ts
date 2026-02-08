import type { Page } from '../types';

export const projectsPage: Page = {
  _id: 'projects',
  title: 'Projects & Teams',
  slug: '/projects',
  description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
  blocks: [
    {
      _type: 'heroBanner',
      _key: 'hero-1',
      headline: 'Projects & Teams',
      subheadline: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      layout: 'centered',
    },
    {
      _type: 'teamGrid',
      _key: 'teams-1',
      label: 'Current Cohort',
      headline: 'Active Projects',
      subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod.',
      teams: [
        {
          _key: 'team1',
          teamName: 'Team Alpha',
          project: 'Lorem Ipsum Dashboard',
          sponsor: 'Acme Corp',
          members: [
            { _key: 'm1', name: 'Jane Doe', role: 'Team Lead', major: 'Computer Science', imageUrl: 'https://placehold.co/200x200' },
            { _key: 'm2', name: 'John Smith', role: 'Backend Developer', major: 'Computer Science', imageUrl: 'https://placehold.co/200x200' },
            { _key: 'm3', name: 'Alex Johnson', role: 'ML Engineer', major: 'Data Science', imageUrl: 'https://placehold.co/200x200' },
            { _key: 'm4', name: 'Sam Wilson', role: 'Frontend Developer', major: 'Information Technology', imageUrl: 'https://placehold.co/200x200' },
            { _key: 'm5', name: 'Taylor Brown', role: 'QA & DevOps', major: 'Information Systems', imageUrl: 'https://placehold.co/200x200' },
          ],
        },
        {
          _key: 'team2',
          teamName: 'Team Beta',
          project: 'Dolor Sit Analytics Platform',
          sponsor: 'Ipsum Solutions',
          members: [
            { _key: 'm6', name: 'Chris Park', role: 'Team Lead', major: 'Computer Science', imageUrl: 'https://placehold.co/200x200' },
            { _key: 'm7', name: 'Casey Davis', role: 'Full Stack Developer', major: 'Computer Science', imageUrl: 'https://placehold.co/200x200' },
            { _key: 'm8', name: 'Jordan Miller', role: 'Data Engineer', major: 'Data Science', imageUrl: 'https://placehold.co/200x200' },
            { _key: 'm9', name: 'Riley Garcia', role: 'UX Designer', major: 'Information Technology', imageUrl: 'https://placehold.co/200x200' },
          ],
        },
        {
          _key: 'team3',
          teamName: 'Team Gamma',
          project: 'Amet Management System',
          sponsor: 'Dolor Tech',
          members: [
            { _key: 'm10', name: 'Avery Thomas', role: 'Team Lead', major: 'Computer Science', imageUrl: 'https://placehold.co/200x200' },
            { _key: 'm11', name: 'Quinn Martinez', role: 'IoT Developer', major: 'Computer Engineering', imageUrl: 'https://placehold.co/200x200' },
            { _key: 'm12', name: 'Drew Anderson', role: 'Backend Developer', major: 'Computer Science', imageUrl: 'https://placehold.co/200x200' },
            { _key: 'm13', name: 'Robin Taylor', role: 'Frontend Developer', major: 'Information Systems', imageUrl: 'https://placehold.co/200x200' },
            { _key: 'm14', name: 'Jamie Moore', role: 'DevOps Engineer', major: 'Information Technology', imageUrl: 'https://placehold.co/200x200' },
          ],
        },
        {
          _key: 'team4',
          teamName: 'Team Delta',
          project: 'Consectetur Integration Platform',
          sponsor: 'Magna Global',
          members: [
            { _key: 'm15', name: 'Skyler White', role: 'Team Lead', major: 'Computer Science', imageUrl: 'https://placehold.co/200x200' },
            { _key: 'm16', name: 'Parker Jones', role: 'Backend Developer', major: 'Computer Science', imageUrl: 'https://placehold.co/200x200' },
            { _key: 'm17', name: 'Reese Clark', role: 'Data Analyst', major: 'Data Science', imageUrl: 'https://placehold.co/200x200' },
            { _key: 'm18', name: 'Blair Lewis', role: 'Frontend Developer', major: 'Information Technology', imageUrl: 'https://placehold.co/200x200' },
          ],
        },
      ],
    },
    {
      _type: 'ctaBanner',
      _key: 'cta-1',
      headline: 'Lorem Ipsum Dolor Sit Amet?',
      body: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam.',
      ctaText: 'Get Started',
      ctaUrl: '/contact',
      variant: 'dark',
    },
  ],
};

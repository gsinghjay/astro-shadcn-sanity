import type { Page } from '../types';

export const projectsPage: Page = {
  _id: 'projects',
  title: 'Projects & Teams',
  slug: '/projects',
  description: 'Current capstone projects and team assignments',
  blocks: [
    {
      _type: 'heroBanner',
      _key: 'hero-1',
      headline: 'Projects & Teams',
      subheadline: 'Current capstone projects for the 2025-2026 academic year. Each team works directly with an industry sponsor to build production-quality software.',
      layout: 'centered',
    },
    {
      _type: 'teamGrid',
      _key: 'teams-1',
      label: 'Fall 2025 - Spring 2026',
      headline: 'Active Projects',
      subtitle: 'Teams are listed with their assigned sponsor and project focus area.',
      teams: [
        {
          _key: 'team1',
          teamName: 'Team Alpha',
          project: 'Real-Time Fraud Detection Dashboard',
          sponsor: 'JPMorgan Chase',
          members: [
            { _key: 'm1', name: 'Sarah Chen', role: 'Team Lead', major: 'Computer Science', imageUrl: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=200' },
            { _key: 'm2', name: 'Marcus Williams', role: 'Backend Developer', major: 'Computer Science', imageUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200' },
            { _key: 'm3', name: 'Priya Patel', role: 'ML Engineer', major: 'Data Science', imageUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200' },
            { _key: 'm4', name: 'James Rodriguez', role: 'Frontend Developer', major: 'Information Technology', imageUrl: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200' },
            { _key: 'm5', name: 'Emily Zhang', role: 'QA & DevOps', major: 'Information Systems', imageUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200' },
          ],
        },
        {
          _key: 'team2',
          teamName: 'Team Beta',
          project: 'Employee Wellness Analytics Platform',
          sponsor: 'ADP',
          members: [
            { _key: 'm6', name: 'David Kim', role: 'Team Lead', major: 'Computer Science', imageUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=200' },
            { _key: 'm7', name: 'Aisha Johnson', role: 'Full Stack Developer', major: 'Computer Science', imageUrl: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=200' },
            { _key: 'm8', name: 'Tom Nguyen', role: 'Data Engineer', major: 'Data Science', imageUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=200' },
            { _key: 'm9', name: 'Maria Garcia', role: 'UX Designer', major: 'Information Technology', imageUrl: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=200' },
          ],
        },
        {
          _key: 'team3',
          teamName: 'Team Gamma',
          project: 'IoT Fleet Management System',
          sponsor: 'Verizon',
          members: [
            { _key: 'm10', name: 'Alex Thompson', role: 'Team Lead', major: 'Computer Science', imageUrl: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=200' },
            { _key: 'm11', name: 'Rachel Park', role: 'IoT Developer', major: 'Computer Engineering', imageUrl: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=200' },
            { _key: 'm12', name: 'Omar Hassan', role: 'Backend Developer', major: 'Computer Science', imageUrl: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=200' },
            { _key: 'm13', name: 'Lisa Wang', role: 'Frontend Developer', major: 'Information Systems', imageUrl: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=200' },
            { _key: 'm14', name: 'Chris Butler', role: 'DevOps Engineer', major: 'Information Technology', imageUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200' },
          ],
        },
        {
          _key: 'team4',
          teamName: 'Team Delta',
          project: 'Clinical Data Integration Platform',
          sponsor: 'BD (Becton Dickinson)',
          members: [
            { _key: 'm15', name: 'Jessica Liu', role: 'Team Lead', major: 'Computer Science', imageUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200' },
            { _key: 'm16', name: 'Ryan Murphy', role: 'Backend Developer', major: 'Computer Science', imageUrl: 'https://images.pexels.com/photos/846741/pexels-photo-846741.jpeg?auto=compress&cs=tinysrgb&w=200' },
            { _key: 'm17', name: 'Fatima Ali', role: 'Data Analyst', major: 'Data Science', imageUrl: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=200' },
            { _key: 'm18', name: 'Kevin Tran', role: 'Frontend Developer', major: 'Information Technology', imageUrl: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=200' },
          ],
        },
      ],
    },
    {
      _type: 'ctaBanner',
      _key: 'cta-1',
      headline: 'Want Your Project Here?',
      body: 'Sponsor a capstone team and get a dedicated student development squad working on your business challenge.',
      ctaText: 'Propose a Project',
      ctaUrl: '/contact',
      variant: 'dark',
    },
  ],
};

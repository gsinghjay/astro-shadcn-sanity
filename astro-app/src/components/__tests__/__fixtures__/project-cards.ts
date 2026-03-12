import type { Project } from '@/lib/sanity';
import { projectFull, projectMinimal } from './projects';

export const projectCardsProjects: Project[] = [
  projectFull,
  {
    ...projectMinimal,
    _id: 'project-2',
    title: 'Blockchain Voting',
    slug: 'blockchain-voting',
    technologyTags: ['Blockchain', 'Ethereum'],
    status: 'active',
    featured: false,
  },
];

export const projectCardsFull = {
  _type: 'projectCards' as const,
  _key: 'test-pc-1',
  backgroundVariant: null,
  spacing: 'default' as const,
  maxWidth: 'default' as const,
  heading: 'Our Projects',
  displayMode: 'all' as const,
  projects: projectCardsProjects,
};

export const projectCardsMinimal = {
  _type: 'projectCards' as const,
  _key: 'test-pc-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: null,
  displayMode: null,
  projects: undefined as Project[] | undefined,
};

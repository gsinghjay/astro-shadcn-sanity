import ProjectPageHeader from './ProjectPageHeader.story-wrapper.astro';

export default {
  title: 'Concepts/Projects/ProjectPageHeader',
  component: ProjectPageHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

export const HeaderWithStats = {
  args: {
    title: 'Projects',
    description: 'Explore our portfolio of research and development projects across multiple industries and technologies.',
    totalProjects: 10,
    activeCount: 3,
    completedCount: 7,
    industryCount: 5,
  },
};

export const HeaderWithSort = {
  args: {
    title: 'Projects',
    description: 'Explore our portfolio of research and development projects across multiple industries and technologies.',
    totalProjects: 10,
    activeCount: 3,
    completedCount: 7,
    industryCount: 5,
    sortOptions: ['Newest', 'A-Z', 'Status'],
  },
};

import ProjectEmptyState from './ProjectEmptyState.story-wrapper.astro';

export default {
  title: 'Concepts/Projects/ProjectEmptyState',
  component: ProjectEmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export const NoResults = {
  args: {
    variant: 'filtered',
    activeFilterCount: 3,
  },
};

export const NoProjects = {
  args: {
    variant: 'empty',
  },
};

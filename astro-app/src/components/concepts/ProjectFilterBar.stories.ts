import ProjectFilterBar from './ProjectFilterBar.story-wrapper.astro';

const techFilters = [
  { label: 'Cybersecurity', count: 3 },
  { label: 'AI/ML', count: 4 },
  { label: 'Cloud Computing', count: 2 },
  { label: '5G', count: 1 },
  { label: 'Blockchain', count: 2 },
  { label: 'Healthcare IoT', count: 1 },
  { label: 'React', count: 3 },
  { label: 'Python', count: 5 },
];

const industryFilters = [
  { label: 'Technology', count: 4 },
  { label: 'Healthcare', count: 2 },
  { label: 'Finance', count: 2 },
  { label: 'Higher Education', count: 3 },
];

export default {
  title: 'Concepts/Projects/ProjectFilterBar',
  component: ProjectFilterBar,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export const FiltersCollapsed = {
  args: {
    techFilters,
    industryFilters,
    activeTechCount: 0,
    activeIndustryCount: 0,
  },
};

export const FiltersExpanded = {
  args: {
    techFilters,
    industryFilters,
    activeTechCount: 0,
    activeIndustryCount: 0,
  },
};

export const FiltersManyActive = {
  args: {
    techFilters,
    industryFilters,
    activeTechCount: 3,
    activeIndustryCount: 1,
  },
};

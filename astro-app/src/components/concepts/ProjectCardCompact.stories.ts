import ProjectCardCompact from './ProjectCardCompact.story-wrapper.astro';

export default {
  title: 'Concepts/Projects/ProjectCardCompact',
  component: ProjectCardCompact,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export const CompactRow = {
  args: {
    title: 'Zero Trust Microsegmentation Network',
    slug: 'zero-trust-microsegmentation',
    status: 'completed',
    sponsorName: 'Cisco',
    semester: 'Fall 2025',
    tagCount: 6,
  },
};

export const CompactRowActive = {
  args: {
    title: "5G-Enabled Alzheimer's Care Application",
    slug: '5g-alzheimers',
    status: 'active',
    sponsorName: 'Verizon',
    semester: 'Spring 2026',
    tagCount: 8,
  },
};

export const CompactRowNoSponsor = {
  args: {
    title: 'Independent ML Research Project',
    slug: 'independent-ml',
    status: 'active',
    sponsorName: null,
    semester: 'Spring 2026',
    tagCount: 2,
  },
};

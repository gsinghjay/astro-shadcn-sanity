import ProjectCardCompactList from './ProjectCardCompactList.astro';

export default {
  title: 'Concepts/Projects/ProjectCardCompactList',
  component: ProjectCardCompactList,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export const SixProjects = {
  args: {
    projects: [
      {
        title: 'Zero Trust Microsegmentation Network',
        slug: 'zero-trust-microsegmentation',
        status: 'completed' as const,
        sponsorName: 'Cisco',
        semester: 'Fall 2025',
        tagCount: 6,
      },
      {
        title: "5G-Enabled Alzheimer's Care Application",
        slug: '5g-alzheimers',
        status: 'active' as const,
        sponsorName: 'Verizon',
        semester: 'Spring 2026',
        tagCount: 8,
      },
      {
        title: 'Blockchain Supply Chain Tracker',
        slug: 'blockchain-supply-chain',
        status: 'active' as const,
        sponsorName: 'IBM',
        semester: 'Spring 2026',
        tagCount: 4,
      },
      {
        title: 'Autonomous Drone Mapping System',
        slug: 'autonomous-drone',
        status: 'completed' as const,
        sponsorName: 'DJI',
        semester: 'Fall 2025',
        tagCount: 5,
      },
      {
        title: 'Independent ML Research Project',
        slug: 'independent-ml',
        status: 'active' as const,
        sponsorName: null,
        semester: 'Spring 2026',
        tagCount: 2,
      },
      {
        title: 'Legacy System Migration Tool',
        slug: 'legacy-migration',
        status: 'archived' as const,
        sponsorName: 'JP Morgan',
        semester: 'Spring 2025',
        tagCount: 3,
      },
    ],
  },
};

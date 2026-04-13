import ProjectGridDense from './ProjectGridDense.story-wrapper.astro';

export default {
  title: 'Concepts/Projects/ProjectGridDense',
  component: ProjectGridDense,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
};

const nineProjects = [
  {
    title: 'Zero Trust Microsegmentation Network',
    slug: 'zero-trust-microsegmentation',
    status: 'completed' as const,
    sponsorName: 'Cisco',
    tags: ['Cybersecurity', 'Networking', 'Zero Trust', 'Firewalls'],
  },
  {
    title: "5G-Enabled Alzheimer's Care Application",
    slug: '5g-alzheimers',
    status: 'active' as const,
    sponsorName: 'Verizon',
    tags: ['5G', 'Healthcare IoT', 'AI/ML', 'Edge Computing'],
  },
  {
    title: 'Blockchain Supply Chain Tracker',
    slug: 'blockchain-supply-chain',
    status: 'active' as const,
    sponsorName: 'IBM',
    tags: ['Blockchain', 'Smart Contracts', 'React', 'Node.js'],
  },
  {
    title: 'Autonomous Drone Mapping System',
    slug: 'autonomous-drone',
    status: 'completed' as const,
    sponsorName: 'DJI',
    tags: ['Computer Vision', 'ROS', 'Python', 'SLAM'],
  },
  {
    title: 'Independent ML Research Project',
    slug: 'independent-ml',
    status: 'active' as const,
    sponsorName: null,
    tags: ['Python', 'PyTorch'],
  },
  {
    title: 'Legacy System Migration Tool',
    slug: 'legacy-migration',
    status: 'archived' as const,
    sponsorName: 'JP Morgan',
    tags: ['Java', 'Spring Boot', 'PostgreSQL'],
  },
  {
    title: 'Smart Campus Energy Dashboard',
    slug: 'smart-campus-energy',
    status: 'active' as const,
    sponsorName: 'Siemens',
    tags: ['IoT', 'React', 'Time Series DB', 'Grafana'],
  },
  {
    title: 'AR-Enhanced Maintenance Training',
    slug: 'ar-maintenance',
    status: 'completed' as const,
    sponsorName: 'Lockheed Martin',
    tags: ['Unity', 'ARCore', 'C#'],
  },
  {
    title: 'Federated Learning Healthcare Platform',
    slug: 'federated-learning',
    status: 'active' as const,
    sponsorName: 'Mayo Clinic',
    tags: ['Federated Learning', 'TensorFlow', 'Docker', 'gRPC'],
  },
];

export const ThreeColumnGrid = {
  args: {
    projects: nineProjects,
  },
};

export const TwoColumnNarrow = {
  args: {
    projects: nineProjects.slice(0, 4),
  },
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

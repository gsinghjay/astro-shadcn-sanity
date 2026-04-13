import ProjectCardEnhanced from './ProjectCardEnhanced.story-wrapper.astro';

export default {
  title: 'Concepts/Projects/ProjectCardEnhanced',
  component: ProjectCardEnhanced,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export const EnhancedFull = {
  args: {
    title: 'Zero Trust Microsegmentation Network',
    slug: 'zero-trust-microsegmentation',
    status: 'completed',
    sponsor: {
      name: 'Cisco',
      logoUrl: 'https://placehold.co/64x64/e2e8f0/475569?text=C',
      industry: 'Technology',
    },
    excerpt:
      'Enterprise network security architecture with granular access controls and real-time threat monitoring across distributed systems.',
    semester: 'Fall 2025',
    tags: [
      'Cybersecurity',
      'Networking',
      'Zero Trust',
      'Firewalls',
      'SIEM',
      'Cloud Security',
    ],
  },
};

export const EnhancedManyTags = {
  args: {
    title: "5G-Enabled Alzheimer's Care Application",
    slug: '5g-alzheimers',
    status: 'active',
    sponsor: {
      name: 'Verizon',
      logoUrl: 'https://placehold.co/64x64/e2e8f0/475569?text=V',
      industry: 'Telecom',
    },
    excerpt:
      'Telemedicine platform leveraging 5G for real-time patient monitoring.',
    semester: 'Spring 2026',
    tags: [
      '5G',
      'Healthcare IoT',
      'Video Processing',
      'AI/ML',
      'Edge Computing',
      'Computer Vision',
      'React Native',
      'WebRTC',
    ],
  },
};

export const EnhancedNoSponsor = {
  args: {
    title: 'Independent ML Research Project',
    slug: 'independent-ml',
    status: 'active',
    sponsor: null,
    excerpt:
      'Self-directed research on transformer architectures for code generation.',
    semester: 'Spring 2026',
    tags: ['Python', 'PyTorch'],
  },
};

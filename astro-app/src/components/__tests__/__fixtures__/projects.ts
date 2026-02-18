import type { Project } from '@/lib/sanity';

export const projectFull: Project = {
  _id: 'project-1',
  title: 'Smart Campus Navigation',
  slug: 'smart-campus-navigation',
  content: [
    {
      _type: 'block',
      _key: 'b1',
      style: 'normal',
      markDefs: [],
      children: [
        { _type: 'span', _key: 's1', text: 'An innovative wayfinding solution for the NJIT campus using IoT sensors and mobile integration.', marks: [] },
      ],
    },
  ] as Project['content'],
  sponsor: {
    _id: 'sponsor-1',
    name: 'Acme Corp',
    slug: 'acme-corp',
    logo: {
      asset: {
        _id: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-200x200-png',
        url: 'https://cdn.sanity.io/images/test-project/test-dataset/Tb9Ew8CXIwaY6R1kjMvI0uRR-200x200.png',
        metadata: null,
      },
      alt: 'Acme logo',
      hotspot: null,
      crop: null,
    },
    industry: 'Technology',
  },
  technologyTags: ['React', 'TypeScript', 'IoT'],
  semester: 'Fall 2025',
  status: 'completed',
  outcome: 'Reduced campus navigation time by 40% for new students.',
};

export const projectMinimal: Project = {
  _id: 'project-2',
  title: 'Minimal Project',
  slug: 'minimal-project',
  content: null,
  sponsor: null,
  technologyTags: null,
  semester: null,
  status: null,
  outcome: null,
};

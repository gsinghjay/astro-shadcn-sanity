import ProjectCard from './ProjectCard.astro';

export default {
  title: 'Components/ProjectCard',
  component: ProjectCard,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};

export const Full = {
  args: {
    project: {
      _id: 'project-1',
      title: 'Smart Campus Navigation',
      slug: 'smart-campus-navigation',
      content: [
        {
          _type: 'block',
          _key: 'b1',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: 's1', text: 'An innovative wayfinding solution for the NJIT campus using IoT sensors and mobile integration.', marks: [] }],
        },
      ],
      sponsor: {
        _id: 'sponsor-1',
        name: 'Acme Corp',
        slug: 'acme-corp',
        logo: {
          asset: {
            _id: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-200x200-png',
            url: 'https://cdn.sanity.io/images/test/test/Tb9Ew8CXIwaY6R1kjMvI0uRR-200x200.png',
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
      outcome: 'Reduced campus navigation time by 40%.',
    },
  },
};

export const Minimal = {
  args: {
    project: {
      _id: 'project-2',
      title: 'Minimal Project',
      slug: 'minimal-project',
      content: null,
      sponsor: null,
      technologyTags: null,
      semester: null,
      status: null,
      outcome: null,
    },
  },
};

export const NoSponsor = {
  args: {
    project: {
      _id: 'project-3',
      title: 'Independent Research',
      slug: 'independent-research',
      content: [
        {
          _type: 'block',
          _key: 'b1',
          style: 'normal',
          markDefs: [],
          children: [{ _type: 'span', _key: 's1', text: 'A self-directed research project on machine learning applications.', marks: [] }],
        },
      ],
      sponsor: null,
      technologyTags: ['Python', 'TensorFlow'],
      semester: 'Spring 2026',
      status: 'active',
      outcome: null,
    },
  },
};

import type { TeamGridBlock } from '@/lib/types';

const testImage = {
  _type: 'image' as const,
  asset: {
    _id: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-400x400-jpg',
    url: 'https://cdn.sanity.io/images/test/test/Tb9Ew8CXIwaY6R1kjMvI0uRR-400x400.jpg',
    metadata: {
      lqip: 'data:image/jpeg;base64,/9j/2wBDAAYEBQY',
      dimensions: { width: 400, height: 400, aspectRatio: 1 },
    },
  },
  alt: 'Test portrait',
  hotspot: { x: 0.5, y: 0.5, width: 1, height: 1 },
  crop: { top: 0, bottom: 0, left: 0, right: 0 },
};

export const teamGridFull: TeamGridBlock = {
  _type: 'teamGrid',
  _key: 'test-tg-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'grid',
  heading: 'Our Team',
  description: 'Meet the people behind our work',
  items: [
    {
      _key: 'tm-1',
      name: 'Alice Johnson',
      role: 'Lead Developer',
      image: testImage,
      links: [
        { _key: 'l1', label: 'GitHub', href: 'https://github.com/alice' },
        { _key: 'l2', label: 'LinkedIn', href: 'https://linkedin.com/in/alice' },
      ],
    },
    {
      _key: 'tm-2',
      name: 'Bob Smith',
      role: 'Designer',
      image: testImage,
      links: [{ _key: 'l3', label: 'Portfolio', href: 'https://bob.design' }],
    },
  ],
};

export const teamGridCompact: TeamGridBlock = {
  _type: 'teamGrid',
  _key: 'test-tg-2',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'grid-compact',
  heading: 'Team',
  description: null,
  items: [
    {
      _key: 'tm-3',
      name: 'Carol White',
      role: 'Engineer',
      image: testImage,
      links: null,
    },
  ],
};

export const teamGridSplit: TeamGridBlock = {
  _type: 'teamGrid',
  _key: 'test-tg-3',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: 'split',
  heading: 'Meet Our Team',
  description: 'We are a diverse group of professionals',
  items: [
    {
      _key: 'tm-4',
      name: 'Dave Brown',
      role: 'PM',
      image: testImage,
      links: null,
    },
  ],
};

export const teamGridMinimal: TeamGridBlock = {
  _type: 'teamGrid',
  _key: 'test-tg-4',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  variant: null,
  heading: null,
  description: null,
  items: null,
};

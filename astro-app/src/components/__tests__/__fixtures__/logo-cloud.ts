import type { Sponsor } from '@/lib/sanity';

export const logoCloudSponsors: Sponsor[] = [
  {
    _id: 'sp-1',
    name: 'TechCorp',
    slug: 'techcorp',
    logo: {
      asset: { _id: 'image-Xk7mDaTH2sjqfOBf9pgYrQ-300x300-png', url: 'https://cdn.sanity.io/images/test-project/test-dataset/Xk7mDaTH2sjqfOBf9pgYrQ-300x300.png', metadata: null },
      alt: 'TechCorp logo',
      hotspot: null,
      crop: null,
    },
    tier: 'gold',
    description: 'Technology company',
    website: 'https://techcorp.example.com',
    featured: true,
  },
  {
    _id: 'sp-2',
    name: 'DataLabs',
    slug: 'datalabs',
    logo: null,
    tier: 'silver',
    description: null,
    website: null,
    featured: false,
  },
];

export const logoCloudFull = {
  _type: 'logoCloud' as const,
  _key: 'test-lc-1',
  backgroundVariant: null,
  spacing: 'default' as const,
  maxWidth: 'default' as const,
  heading: 'Trusted By',
  autoPopulate: false,
  sponsors: logoCloudSponsors,
};

export const logoCloudMinimal = {
  _type: 'logoCloud' as const,
  _key: 'test-lc-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: null,
  autoPopulate: null,
  sponsors: undefined as Sponsor[] | undefined,
};

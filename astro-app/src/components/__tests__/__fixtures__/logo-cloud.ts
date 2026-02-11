import type { LogoCloudBlock } from '@/lib/types';

export const logoCloudFull: LogoCloudBlock = {
  _type: 'logoCloud',
  _key: 'test-lc-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  heading: 'Trusted By',
  autoPopulate: false,
  sponsors: [
    {
      _id: 'sp-1',
      name: 'TechCorp',
      slug: 'techcorp',
      logo: {
        asset: { _id: 'img-tc', url: 'https://cdn.sanity.io/test/techcorp.png', metadata: null },
        alt: 'TechCorp logo',
      },
      website: 'https://techcorp.example.com',
    },
    {
      _id: 'sp-2',
      name: 'DataLabs',
      slug: 'datalabs',
      logo: null,
      website: null,
    },
  ],
};

export const logoCloudMinimal: LogoCloudBlock = {
  _type: 'logoCloud',
  _key: 'test-lc-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: null,
  autoPopulate: null,
  sponsors: null,
};

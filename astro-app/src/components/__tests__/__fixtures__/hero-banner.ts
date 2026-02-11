import type { HeroBannerBlock } from '@/lib/types';

export const heroFull: HeroBannerBlock = {
  _type: 'heroBanner',
  _key: 'test-hero-1',
  backgroundVariant: 'dark',
  spacing: 'default',
  maxWidth: 'default',
  heading: 'Welcome to YWCC',
  subheading: 'Building community through technology',
  ctaButtons: [
    { _key: 'cta-1', text: 'Get Started', url: '/about', variant: 'default' },
    { _key: 'cta-2', text: 'Learn More', url: '/projects', variant: 'outline' },
  ],
  backgroundImages: [
    {
      _key: 'img-1',
      asset: {
        _id: 'image-test-1',
        url: 'https://cdn.sanity.io/images/test/test/test.jpg',
        metadata: { lqip: null, dimensions: null },
      },
      alt: 'Test background',
    },
  ],
  alignment: 'center',
};

export const heroMinimal: HeroBannerBlock = {
  _type: 'heroBanner',
  _key: 'test-hero-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: 'Minimal Hero',
  subheading: null,
  ctaButtons: null,
  backgroundImages: null,
  alignment: null,
};

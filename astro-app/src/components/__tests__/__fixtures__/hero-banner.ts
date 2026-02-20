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
        _id: 'image-test1-1920x1080-jpg',
        url: 'https://cdn.sanity.io/images/test/test/test1-1920x1080.jpg',
        metadata: {
          lqip: 'data:image/jpeg;base64,/9j/2wBDAAYEBQY',
          dimensions: { width: 1920, height: 1080, aspectRatio: 1.7778 },
        },
      },
      alt: 'Test background',
    },
    {
      _key: 'img-2',
      asset: {
        _id: 'image-test2-1920x1080-jpg',
        url: 'https://cdn.sanity.io/images/test/test/test2-1920x1080.jpg',
        metadata: {
          lqip: 'data:image/jpeg;base64,/9j/4AAQSkZJRg',
          dimensions: { width: 1920, height: 1080, aspectRatio: 1.7778 },
        },
      },
      alt: 'Second slide',
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

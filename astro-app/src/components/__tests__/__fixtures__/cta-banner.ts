import type { CtaBannerBlock } from '@/lib/types';

const sharedImage: NonNullable<CtaBannerBlock['backgroundImages']>[number] = {
  _key: 'img-1',
  _type: 'image',
  asset: {
    _id: 'image-test1-960x1080-jpg',
    url: 'https://cdn.sanity.io/images/test/test/test1-960x1080.jpg',
    metadata: {
      lqip: 'data:image/jpeg;base64,/9j/2wBDAAYEBQY',
      dimensions: { width: 960, height: 1080, aspectRatio: 0.8889 },
    },
  },
  alt: 'Test image',
};

const sharedButtons: NonNullable<CtaBannerBlock['ctaButtons']> = [
  { _key: 'btn-1', text: 'Sign Up', url: '/contact', variant: 'default' },
  { _key: 'btn-2', text: 'Learn More', url: '/about', variant: 'outline' },
];

export const ctaFull: CtaBannerBlock = {
  _type: 'ctaBanner',
  _key: 'test-cta-1',
  backgroundVariant: 'primary',
  spacing: 'default',
  maxWidth: 'default',
  variant: 'centered',
  heading: 'Ready to Get Started?',
  description: 'Join our community today and start building.',
  backgroundImages: [sharedImage],
  ctaButtons: sharedButtons,
};

export const ctaMinimal: CtaBannerBlock = {
  _type: 'ctaBanner',
  _key: 'test-cta-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  variant: null,
  heading: 'Simple CTA',
  description: null,
  backgroundImages: null,
  ctaButtons: null,
};

export const ctaSplit: CtaBannerBlock = {
  ...ctaFull,
  _key: 'test-cta-split',
  variant: 'split',
  heading: 'Split CTA',
  backgroundImages: [sharedImage],
  ctaButtons: sharedButtons,
};

export const ctaSpread: CtaBannerBlock = {
  ...ctaFull,
  _key: 'test-cta-spread',
  variant: 'spread',
  heading: 'Spread CTA',
  backgroundImages: null,
  ctaButtons: sharedButtons,
};

export const ctaOverlay: CtaBannerBlock = {
  ...ctaFull,
  _key: 'test-cta-overlay',
  variant: 'overlay',
  heading: 'Overlay CTA',
  backgroundImages: [sharedImage],
  ctaButtons: sharedButtons,
};

import type { CtaBannerBlock } from '@/lib/types';

export const ctaFull: CtaBannerBlock = {
  _type: 'ctaBanner',
  _key: 'test-cta-1',
  backgroundVariant: 'primary',
  spacing: 'default',
  maxWidth: 'default',
  heading: 'Ready to Get Started?',
  description: 'Join our community today and start building.',
  ctaButtons: [
    { _key: 'btn-1', text: 'Sign Up', url: '/contact', variant: 'default' },
    { _key: 'btn-2', text: 'Learn More', url: '/about', variant: 'outline' },
  ],
};

export const ctaMinimal: CtaBannerBlock = {
  _type: 'ctaBanner',
  _key: 'test-cta-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: 'Simple CTA',
  description: null,
  ctaButtons: null,
};

import type { ContactFormBlock } from '@/lib/types';

export const contactFormFull: ContactFormBlock = {
  _type: 'contactForm',
  _key: 'test-cf-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  heading: 'Get In Touch',
  description: 'We would love to hear from you.',
  successMessage: 'Thanks! We will be in touch soon.',
};

export const contactFormMinimal: ContactFormBlock = {
  _type: 'contactForm',
  _key: 'test-cf-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  heading: null,
  description: null,
  successMessage: null,
};

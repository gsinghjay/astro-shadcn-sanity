import type { ContactFormBlock } from '@/lib/types';

const baseForm: ContactFormBlock['form'] = {
  _id: 'form-test-1',
  title: 'Contact Form',
  fields: [
    {
      _key: 'f1',
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      choices: null,
      options: { placeholder: 'Your full name', defaultValue: null },
    },
    {
      _key: 'f2',
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      choices: null,
      options: { placeholder: 'you@example.com', defaultValue: null },
    },
    {
      _key: 'f3',
      name: 'message',
      label: 'Message',
      type: 'textarea',
      required: true,
      choices: null,
      options: { placeholder: 'Tell us about your project', defaultValue: null },
    },
  ],
  submitButton: { text: 'Submit Inquiry' },
};

export const contactFormFull: ContactFormBlock = {
  _type: 'contactForm',
  _key: 'test-cf-1',
  backgroundVariant: null,
  spacing: 'default',
  maxWidth: 'default',
  variant: null,
  backgroundImages: null,
  heading: 'Get In Touch',
  description: 'We would love to hear from you.',
  successMessage: 'Thanks! We will be in touch soon.',
  form: baseForm,
};

export const contactFormMinimal: ContactFormBlock = {
  _type: 'contactForm',
  _key: 'test-cf-2',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
  variant: null,
  backgroundImages: null,
  heading: null,
  description: null,
  successMessage: null,
  form: null,
};

export const contactFormSplit: ContactFormBlock = {
  ...contactFormFull,
  _key: 'test-cf-3',
  variant: 'split',
};

export const contactFormSplitImage: ContactFormBlock = {
  ...contactFormFull,
  _key: 'test-cf-4',
  variant: 'split-image',
  backgroundImages: [
    {
      _key: 'img-1',
      asset: {
        _id: 'image-Xk7mDaTH2sjqfOBf9pgYrQ-1920x1080-jpg',
        url: 'https://cdn.sanity.io/images/test/test/Xk7mDaTH2sjqfOBf9pgYrQ-1920x1080.jpg',
        metadata: {
          lqip: 'data:image/jpeg;base64,/9j/2wBDAAYEBQY',
          dimensions: { width: 1920, height: 1080, aspectRatio: 1.7778 },
        },
      },
      alt: 'Contact office',
    },
  ],
};

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
  form: {
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
  },
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
  form: null,
};

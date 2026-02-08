import type { Page } from '../types';

export const contactPage: Page = {
  _id: 'contact',
  title: 'Contact',
  slug: '/contact',
  description: 'Lorem ipsum dolor sit amet consectetur adipiscing elit',
  blocks: [
    {
      _type: 'heroBanner',
      _key: 'hero-1',
      headline: 'Get in Touch',
      subheadline: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore.',
      layout: 'centered',
    },
    {
      _type: 'contactForm',
      _key: 'form-1',
      headline: 'Contact Us',
      subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor.',
      fields: [
        { _key: 'f1', name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Your full name' },
        { _key: 'f2', name: 'email', label: 'Work Email', type: 'email', required: true, placeholder: 'you@example.com' },
        { _key: 'f3', name: 'organization', label: 'Organization', type: 'text', required: true, placeholder: 'Your organization' },
        { _key: 'f4', name: 'role', label: 'Your Role', type: 'text', required: false, placeholder: 'Your role' },
        {
          _key: 'f5',
          name: 'interest',
          label: 'Area of Interest',
          type: 'select',
          required: true,
          options: ['Option A', 'Option B', 'Option C', 'Option D', 'Option E'],
        },
        { _key: 'f6', name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Your message here...' },
      ],
    },
    {
      _type: 'featureGrid',
      _key: 'contact-info',
      label: 'Other Ways to Reach Us',
      columns: 3,
      features: [
        {
          _key: 'c1',
          title: 'Office',
          description: '123 Main Street, Suite 400\nAnytown, ST 12345',
          icon: 'location',
        },
        {
          _key: 'c2',
          title: 'Email',
          description: 'hello@example.com\nLorem ipsum dolor sit amet',
          icon: 'email',
        },
        {
          _key: 'c3',
          title: 'Phone',
          description: '(555) 123-4567\nMonday-Friday, 9am-5pm',
          icon: 'phone',
        },
      ],
    },
  ],
};

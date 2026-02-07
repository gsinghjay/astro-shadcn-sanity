import type { Page } from '../types';

export const contactPage: Page = {
  _id: 'contact',
  title: 'Contact',
  slug: '/contact',
  description: 'Get in touch about sponsoring a YWCC capstone team',
  blocks: [
    {
      _type: 'heroBanner',
      _key: 'hero-1',
      headline: 'Get in Touch',
      subheadline: 'Interested in sponsoring a capstone team or have questions about the program? We would like to hear from you.',
      layout: 'centered',
    },
    {
      _type: 'contactForm',
      _key: 'form-1',
      headline: 'Sponsor Inquiry',
      subtitle: 'Fill out the form below and a program coordinator will respond within two business days.',
      fields: [
        { _key: 'f1', name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'Jane Smith' },
        { _key: 'f2', name: 'email', label: 'Work Email', type: 'email', required: true, placeholder: 'jane@company.com' },
        { _key: 'f3', name: 'organization', label: 'Organization', type: 'text', required: true, placeholder: 'Acme Corp' },
        { _key: 'f4', name: 'role', label: 'Your Role', type: 'text', required: false, placeholder: 'Engineering Manager' },
        {
          _key: 'f5',
          name: 'interest',
          label: 'Area of Interest',
          type: 'select',
          required: true,
          options: ['Sponsoring a Team', 'Renewing Sponsorship', 'General Inquiry', 'Student Inquiry', 'Media / Press'],
        },
        { _key: 'f6', name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Tell us about your project idea or question...' },
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
          title: 'Program Office',
          description: 'GITC Building, Room 4400\nNew Jersey Institute of Technology\nNewark, NJ 07102',
          icon: 'location',
        },
        {
          _key: 'c2',
          title: 'Email',
          description: 'capstone@njit.edu\nWe respond within 2 business days',
          icon: 'email',
        },
        {
          _key: 'c3',
          title: 'Phone',
          description: '(973) 596-3366\nMonday-Friday, 9am-5pm ET',
          icon: 'phone',
        },
      ],
    },
  ],
};

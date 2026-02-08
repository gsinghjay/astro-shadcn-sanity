import ContactForm from './ContactForm.astro'

export default {
  title: 'Blocks/ContactForm',
  component: ContactForm,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    block: {
      _type: 'contactForm',
      _key: 'story-contact-1',
      headline: 'Get In Touch',
      subtitle: 'Interested in sponsoring a capstone team? Fill out the form below and a program coordinator will respond within two business days.',
    },
  },
}

export const WithCustomFields = {
  args: {
    block: {
      _type: 'contactForm',
      _key: 'story-contact-2',
      headline: 'Sponsor Inquiry',
      subtitle: 'Tell us about your organization and the kind of project you have in mind.',
      fields: [
        { _key: 'f1', name: 'name', label: 'Full Name', type: 'text', required: true },
        { _key: 'f2', name: 'email', label: 'Work Email', type: 'email', required: true, placeholder: 'you@company.com' },
        { _key: 'f3', name: 'company', label: 'Company Name', type: 'text', required: true },
        { _key: 'f4', name: 'tier', label: 'Sponsorship Tier', type: 'select', required: true, options: ['Platinum', 'Gold', 'Silver'] },
        { _key: 'f5', name: 'message', label: 'Project Description', type: 'textarea', required: false, placeholder: 'Describe the business challenge you\'d like students to work on...' },
      ],
    },
  },
}

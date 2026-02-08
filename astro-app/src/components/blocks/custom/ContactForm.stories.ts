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
      headline: 'Contact Us',
      subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.',
    },
  },
}

export const WithCustomFields = {
  args: {
    block: {
      _type: 'contactForm',
      _key: 'story-contact-2',
      headline: 'Lorem Ipsum Inquiry',
      subtitle: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      fields: [
        { _key: 'f1', name: 'name', label: 'Full Name', type: 'text', required: true },
        { _key: 'f2', name: 'email', label: 'Work Email', type: 'email', required: true, placeholder: 'you@example.com' },
        { _key: 'f3', name: 'company', label: 'Organization', type: 'text', required: true },
        { _key: 'f4', name: 'tier', label: 'Category', type: 'select', required: true, options: ['Option A', 'Option B', 'Option C'] },
        { _key: 'f5', name: 'message', label: 'Message', type: 'textarea', required: false, placeholder: 'Your message here...' },
      ],
    },
  },
}

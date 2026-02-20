import ContactForm from './ContactForm.astro'

export default {
  title: 'Blocks/ContactForm',
  component: ContactForm,
  tags: ['autodocs'],
}

export const Default = {
  args: {
    _type: 'contactForm',
    _key: 'story-contact-1',
    heading: 'Contact Us',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.',
    form: {
      _id: 'form-story-1',
      title: 'Contact Form',
      fields: [
        { _key: 'f1', name: 'name', label: 'Full Name', type: 'text', required: true, choices: null, options: { placeholder: 'Your name', defaultValue: null } },
        { _key: 'f2', name: 'email', label: 'Email', type: 'email', required: true, choices: null, options: { placeholder: 'you@example.com', defaultValue: null } },
        { _key: 'f3', name: 'organization', label: 'Organization', type: 'text', required: false, choices: null, options: { placeholder: 'Company name', defaultValue: null } },
        { _key: 'f4', name: 'message', label: 'Message', type: 'textarea', required: true, choices: null, options: { placeholder: 'Tell us about your project', defaultValue: null } },
      ],
      submitButton: { text: 'Submit Inquiry' },
    },
  },
}

export const WithSuccessMessage = {
  args: {
    _type: 'contactForm',
    _key: 'story-contact-2',
    heading: 'Lorem Ipsum Inquiry',
    description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    successMessage: 'Your inquiry has been submitted successfully. We will respond within 48 hours.',
    form: {
      _id: 'form-story-2',
      title: 'Inquiry Form',
      fields: [
        { _key: 'f1', name: 'name', label: 'Name', type: 'text', required: true, choices: null, options: null },
        { _key: 'f2', name: 'email', label: 'Email', type: 'email', required: true, choices: null, options: null },
        { _key: 'f3', name: 'message', label: 'Message', type: 'textarea', required: true, choices: null, options: null },
      ],
      submitButton: { text: 'Send Message' },
    },
  },
}

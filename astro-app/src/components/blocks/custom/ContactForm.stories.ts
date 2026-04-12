import ContactForm from './ContactForm.astro'

export default {
  title: 'Components/ContactForm',
  component: ContactForm,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Split-layout contact form with heading, description, and Turnstile CAPTCHA. Renders AutoForm fields from schema.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['stacked', 'split', 'split-image'],
      description: 'Layout variant',
    },
    heading: { control: 'text', description: 'Section heading' },
    description: { control: 'text', description: 'Description text' },
    backgroundVariant: {
      control: { type: 'select' },
      options: ['white', 'light', 'dark', 'primary'],
      description: 'Background color theme',
    },
    spacing: {
      control: { type: 'select' },
      options: ['none', 'small', 'default', 'large'],
      description: 'Vertical padding',
    },
    maxWidth: {
      control: { type: 'select' },
      options: ['narrow', 'default', 'full'],
      description: 'Maximum content width',
    },
  },
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

const sharedForm = {
  _id: 'form-story-shared',
  title: 'Contact Form',
  fields: [
    { _key: 'f1', name: 'name', label: 'Full Name', type: 'text', required: true, choices: null, options: { placeholder: 'Your name', defaultValue: null } },
    { _key: 'f2', name: 'email', label: 'Email', type: 'email', required: true, choices: null, options: { placeholder: 'you@example.com', defaultValue: null } },
    { _key: 'f3', name: 'message', label: 'Message', type: 'textarea', required: true, choices: null, options: { placeholder: 'Tell us about your project', defaultValue: null } },
  ],
  submitButton: { text: 'Submit Inquiry' },
}

export const Split = {
  args: {
    _type: 'contactForm',
    _key: 'story-contact-split',
    variant: 'split',
    heading: 'Get in Touch',
    description: 'Have a question or want to work together? Fill out the form and we will get back to you within 24 hours.',
    form: sharedForm,
  },
}

export const SplitImage = {
  args: {
    _type: 'contactForm',
    _key: 'story-contact-split-image',
    variant: 'split-image',
    heading: 'Start a Conversation',
    description: 'We would love to hear from you. Reach out and let us know how we can help.',
    form: sharedForm,
    backgroundImages: [
      {
        _key: 'bg-1',
        asset: { url: 'https://placehold.co/800x1000/1a1a2e/e2e8f0?text=Contact+Us' },
        alt: 'Contact background image',
      },
    ],
  },
}

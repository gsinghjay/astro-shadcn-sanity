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
      heading: 'Contact Us',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.',
    },
  },
}

export const WithSuccessMessage = {
  args: {
    block: {
      _type: 'contactForm',
      _key: 'story-contact-2',
      heading: 'Lorem Ipsum Inquiry',
      description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      successMessage: 'Your inquiry has been submitted successfully. We will respond within 48 hours.',
    },
  },
}

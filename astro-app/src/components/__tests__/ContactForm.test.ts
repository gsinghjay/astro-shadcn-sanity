import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ContactForm from '../blocks/custom/ContactForm.astro';
import { contactFormFull, contactFormMinimal } from './__fixtures__/contact-form';

describe('ContactForm', () => {
  test('renders heading and description', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormFull,
    });

    expect(html).toContain('Get In Touch');
    expect(html).toContain('We would love to hear from you.');
  });

  test('renders form fields', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormFull,
    });

    expect(html).toContain('Full Name');
    expect(html).toContain('Email');
    expect(html).toContain('Message');
    expect(html).toContain('Submit Inquiry');
  });

  test('renders custom success message', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormFull,
    });

    expect(html).toContain('Thanks! We will be in touch soon.');
  });

  test('renders default success message when none provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormMinimal,
    });

    expect(html).toContain('Thank you for your inquiry');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormMinimal,
    });

    expect(html).toContain('data-contact-form');
  });

  test('renders GTM form tracking attribute', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormFull,
    });

    expect(html).toContain('data-gtm-form="contact"');
  });
});

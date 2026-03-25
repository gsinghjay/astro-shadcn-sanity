import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ContactForm from '../blocks/custom/ContactForm.astro';
import { contactFormFull, contactFormMinimal, contactFormSplit, contactFormSplitImage } from './__fixtures__/contact-form';

describe('ContactForm', () => {
  test('renders heading and description', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormFull,
    });

    expect(html).toContain('Get In Touch');
    expect(html).toContain('We would love to hear from you.');
  });

  test('renders form fields from CMS data', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormFull,
    });

    expect(html).toContain('Full Name');
    expect(html).toContain('Email');
    expect(html).toContain('Message');
  });

  test('renders submit button with CMS text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormFull,
    });

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

  test('handles minimal data (no form) without crashing', async () => {
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

  test('renders hidden form_id input', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormFull,
    });

    expect(html).toContain('name="form_id"');
    expect(html).toContain('value="form-test-1"');
  });

  test('renders Turnstile widget container', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormFull,
    });

    expect(html).toContain('cf-turnstile');
  });

  test('renders state-toggle CSS', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormFull,
    });

    expect(html).toContain('data-form-success');
    expect(html).toContain('data-form-error');
    expect(html).toContain('data-form-fields');
  });

  // Variant tests
  test('defaults to stacked layout when no variant provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormFull,
    });

    expect(html).toContain('data-contact-form');
    expect(html).toContain('Get In Touch');
  });

  test('stacked variant renders same output as default (no variant)', async () => {
    const container = await AstroContainer.create();
    const [htmlDefault, htmlStacked] = await Promise.all([
      container.renderToString(ContactForm, { props: contactFormFull }),
      container.renderToString(ContactForm, { props: { ...contactFormFull, variant: 'stacked' } }),
    ]);

    expect(htmlStacked).toContain('data-contact-form');
    expect(htmlStacked).toContain('Get In Touch');
    // Both should produce the same structure
    expect(htmlDefault).toContain('data-animate');
    expect(htmlStacked).toContain('data-animate');
  });

  test('split variant renders SectionSplit with heading on left and form on right', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormSplit,
    });

    expect(html).toContain('Get In Touch');
    expect(html).toContain('data-contact-form');
    expect(html).toContain('3fr');
  });

  test('split-image variant renders image from backgroundImages', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: contactFormSplitImage,
    });

    expect(html).toContain('Contact office');
    expect(html).toContain('data-contact-form');
    expect(html).toContain('Get In Touch');
  });

  test('split-image variant without backgroundImages does not crash', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ContactForm, {
      props: { ...contactFormSplitImage, backgroundImages: null },
    });

    expect(html).toContain('data-contact-form');
  });
});

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import FaqSection from '../blocks/custom/FaqSection.astro';
import { faqFull, faqLegacyString, faqMinimal } from './__fixtures__/faq-section';

describe('FaqSection', () => {
  test('renders heading and FAQ items', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqSection, {
      props: faqFull,
    });

    expect(html).toContain('Frequently Asked Questions');
    expect(html).toContain('What is YWCC?');
    expect(html).toContain('How do I join?');
  });

  test('renders Portable Text answer with bold marks', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqSection, {
      props: faqFull,
    });

    expect(html).toMatch(/<strong[^>]*>women in computing<\/strong>/);
  });

  test('renders numbered items', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqSection, {
      props: faqFull,
    });

    expect(html).toContain('01');
    expect(html).toContain('02');
  });

  test('renders legacy string answers as plain <p>', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqSection, {
      props: faqLegacyString,
    });

    expect(html).toContain('Plain text answer.');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqSection, {
      props: faqMinimal,
    });
    expect(html).toBeDefined();
  });
});

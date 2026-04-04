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

  test('split variant keeps sticky heading layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqSection, {
      props: { ...faqFull, variant: 'split' },
    });

    expect(html).toContain('sticky top-24');
  });

  test('stacked variant does not apply sticky heading layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqSection, {
      props: { ...faqFull, variant: 'stacked' },
    });

    expect(html).not.toContain('sticky top-24');
    expect(html).not.toContain('--section-width: 672px;');
  });

  test('spread-header variant renders spread container classes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqSection, {
      props: { ...faqFull, variant: 'spread-header' },
    });

    expect(html).toContain('@5xl:justify-between');
  });

  test('narrow variant applies constrained section width', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqSection, {
      props: { ...faqFull, variant: 'narrow' },
    });

    expect(html).toContain('--section-width: 672px;');
  });

  test('unknown variant falls back to split layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqSection, {
      props: { ...faqFull, variant: 'legacy-variant' },
    });

    expect(html).toContain('sticky top-24');
  });
});

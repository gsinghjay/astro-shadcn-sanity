import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import LinkCards from '../blocks/custom/LinkCards.astro';

const baseLink = {
  _key: 'l1',
  title: 'Resource',
  description: 'Resource blurb.',
  icon: 'book-open',
  url: '/resource',
};

function makeProps(overrides: Record<string, unknown>) {
  return {
    _type: 'linkCards',
    _key: 'block-1',
    backgroundVariant: 'white',
    spacing: 'default',
    maxWidth: 'default',
    alignment: 'left',
    heading: 'Resources',
    description: 'A list of resources.',
    variant: 'grid',
    links: [baseLink],
    ...overrides,
  };
}

describe('LinkCards (Story 18.9 — editable per-card CTA label)', () => {
  test('grid variant: card with custom ctaLabel renders that label + arrow', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LinkCards, {
      props: makeProps({
        variant: 'grid',
        links: [{ ...baseLink, ctaLabel: 'View pricing' }],
      }),
    });
    expect(html).toContain('View pricing &rarr;');
    expect(html).not.toMatch(/Learn more\s*&rarr;/);
  });

  test('grid variant: card with undefined ctaLabel falls back to "Learn more"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LinkCards, {
      props: makeProps({
        variant: 'grid',
        links: [{ ...baseLink }],
      }),
    });
    expect(html).toContain('Learn more &rarr;');
  });

  test('grid variant: card with empty-string ctaLabel falls back to "Learn more"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LinkCards, {
      props: makeProps({
        variant: 'grid',
        links: [{ ...baseLink, ctaLabel: '' }],
      }),
    });
    expect(html).toContain('Learn more &rarr;');
  });

  test('grid variant: whitespace-only ctaLabel falls back to "Learn more"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LinkCards, {
      props: makeProps({
        variant: 'grid',
        links: [{ ...baseLink, ctaLabel: '   ' }],
      }),
    });
    expect(html).toContain('Learn more &rarr;');
  });

  test('list variant: ignores ctaLabel and renders standalone arrow only', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LinkCards, {
      props: makeProps({
        variant: 'list',
        links: [{ ...baseLink, ctaLabel: 'Should not appear' }],
      }),
    });
    expect(html).not.toContain('Should not appear');
    expect(html).not.toContain('Learn more');
    expect(html).toContain('&rarr;');
  });

  test('icon-list variant: ignores ctaLabel and renders no arrow', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LinkCards, {
      props: makeProps({
        variant: 'icon-list',
        links: [{ ...baseLink, ctaLabel: 'Should not appear' }],
      }),
    });
    expect(html).not.toContain('Should not appear');
    expect(html).not.toContain('Learn more');
    expect(html).not.toContain('&rarr;');
  });
});

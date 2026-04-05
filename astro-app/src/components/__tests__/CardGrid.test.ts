import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import CardGrid from '../blocks/custom/CardGrid.astro';

const sharedCards = [
  { _key: 'c1', title: 'Card One', description: 'Desc one', badge: 'New' },
  { _key: 'c2', title: 'Card Two', description: 'Desc two' },
  { _key: 'c3', title: 'Card Three', description: 'Desc three' },
];

const baseProps = {
  _type: 'cardGrid' as const,
  _key: 'test-cardgrid',
  backgroundVariant: null,
  spacing: 'default' as const,
  maxWidth: 'default' as const,
  heading: 'Test Grid',
  description: 'Test description',
  cards: sharedCards,
};

describe('CardGrid', () => {
  test('grid-3 variant renders heading and cards', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CardGrid, {
      props: { ...baseProps, variant: 'grid-3' },
    });

    expect(html).toContain('Test Grid');
    expect(html).toContain('Card One');
    expect(html).toContain('Card Two');
  });

  test('unknown variant falls back to grid-3', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CardGrid, {
      props: { ...baseProps, variant: 'unknown' },
    });

    expect(html).toContain('Test Grid');
    expect(html).toContain('Card One');
  });

  test('brutalist variant renders thick 2px bordered cards', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CardGrid, {
      props: { ...baseProps, variant: 'brutalist' },
    });

    expect(html).toContain('border-2');
    expect(html).toContain('border-border');
  });

  test('brutalist variant renders red border on hover', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CardGrid, {
      props: { ...baseProps, variant: 'brutalist' },
    });

    expect(html).toContain('hover:border-primary');
  });

  test('brutalist variant renders red top accent bar', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CardGrid, {
      props: { ...baseProps, variant: 'brutalist' },
    });

    expect(html).toContain('h-1');
    expect(html).toContain('bg-primary');
  });

  test('brutalist variant does not use Tile component', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CardGrid, {
      props: { ...baseProps, variant: 'brutalist' },
    });

    // Brutalist cards use raw divs, not Tile component
    expect(html).not.toContain('data-slot="tile"');
  });

  test('brutalist variant renders card titles and descriptions', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CardGrid, {
      props: { ...baseProps, variant: 'brutalist' },
    });

    expect(html).toContain('Card One');
    expect(html).toContain('Desc one');
    expect(html).toContain('Card Three');
  });
});

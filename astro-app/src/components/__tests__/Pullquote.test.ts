import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import Pullquote from '../blocks/custom/Pullquote.astro';
import { pullquoteFull, pullquoteSplit, pullquoteSidebar, pullquoteMinimal } from './__fixtures__/pullquote';

describe('Pullquote', () => {
  test('renders centered variant with quote and attribution', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Pullquote, {
      props: pullquoteFull,
    });

    expect(html).toContain('Design is not just what it looks like');
    expect(html).toContain('Steve Jobs');
    expect(html).toContain('Co-founder, Apple');
  });

  test('renders decorative quotation mark in centered variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Pullquote, {
      props: pullquoteFull,
    });

    expect(html).toContain('text-8xl');
    expect(html).toContain('font-serif');
  });

  test('renders split variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Pullquote, {
      props: pullquoteSplit,
    });

    expect(html).toContain('Design is not just what it looks like');
    expect(html).toContain('Steve Jobs');
  });

  test('renders sidebar variant with border-l-4', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Pullquote, {
      props: pullquoteSidebar,
    });

    expect(html).toContain('border-l-4');
    expect(html).toContain('border-primary');
    expect(html).toContain('Design is not just what it looks like');
  });

  test('centered variant does not render split or sidebar markup', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Pullquote, {
      props: pullquoteFull,
    });

    expect(html).not.toContain('border-l-4');
    expect(html).not.toContain('SectionSplit');
  });

  test('sidebar variant does not render decorative quotation mark', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Pullquote, {
      props: pullquoteSidebar,
    });

    expect(html).not.toContain('text-8xl');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Pullquote, {
      props: pullquoteMinimal,
    });
    expect(html).toBeDefined();
    expect(html).toContain('Less is more');
  });
});

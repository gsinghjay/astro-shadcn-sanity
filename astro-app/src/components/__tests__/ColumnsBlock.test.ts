import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ColumnsBlock from '../blocks/custom/ColumnsBlock.astro';
import { richTextFull } from './__fixtures__/rich-text';
import { statsFull } from './__fixtures__/stats-row';
import type { ColumnsBlockBlock } from '@/lib/types';

const baseProps: ColumnsBlockBlock = {
  _type: 'columnsBlock',
  _key: 'test-cols-1',
  variant: 'equal',
  leftBlocks: [richTextFull],
  rightBlocks: [statsFull],
  reverseOnMobile: false,
  verticalAlign: 'top',
  backgroundVariant: null,
  spacing: null,
  maxWidth: null,
};

describe('ColumnsBlock', () => {
  test('renders left and right column content', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ColumnsBlock, {
      props: baseProps,
    });

    // Left column: richText content
    expect(html).toContain('About Our Mission');
    expect(html).toContain('We empower women in technology.');
    // Right column: statsRow content
    expect(html).toContain('Our Impact');
    expect(html).toContain('500+');
  });

  test('applies equal variant grid classes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ColumnsBlock, {
      props: baseProps,
    });

    expect(html).toContain('lg:grid-cols-2');
    expect(html).toContain('items-start');
  });

  test('applies wide-left variant grid classes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ColumnsBlock, {
      props: { ...baseProps, _key: 'test-cols-wl', variant: 'wide-left' },
    });

    expect(html).toContain('lg:grid-cols-[2fr_1fr]');
  });

  test('applies wide-right variant grid classes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ColumnsBlock, {
      props: { ...baseProps, _key: 'test-cols-wr', variant: 'wide-right' },
    });

    expect(html).toContain('lg:grid-cols-[1fr_2fr]');
  });

  test('applies sidebar-left variant grid classes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ColumnsBlock, {
      props: { ...baseProps, _key: 'test-cols-sl', variant: 'sidebar-left' },
    });

    expect(html).toContain('lg:grid-cols-[minmax(280px,1fr)_3fr]');
  });

  test('applies sidebar-right variant grid classes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ColumnsBlock, {
      props: { ...baseProps, _key: 'test-cols-sr', variant: 'sidebar-right' },
    });

    expect(html).toContain('lg:grid-cols-[3fr_minmax(280px,1fr)]');
  });

  test('applies center vertical alignment', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ColumnsBlock, {
      props: { ...baseProps, _key: 'test-cols-vc', verticalAlign: 'center' },
    });

    expect(html).toContain('items-center');
  });

  test('applies stretch vertical alignment', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ColumnsBlock, {
      props: { ...baseProps, _key: 'test-cols-vs', verticalAlign: 'stretch' },
    });

    expect(html).toContain('items-stretch');
  });

  test('applies mobile reverse ordering', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ColumnsBlock, {
      props: { ...baseProps, _key: 'test-cols-rev', reverseOnMobile: true },
    });

    expect(html).toContain('order-2');
    expect(html).toContain('lg:order-1');
    expect(html).toContain('order-1');
    expect(html).toContain('lg:order-2');
  });

  test('does not apply order classes when reverseOnMobile is false', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ColumnsBlock, {
      props: baseProps,
    });

    expect(html).not.toContain('order-2');
    expect(html).not.toContain('lg:order-1');
  });

  test('defaults to equal variant when variant is undefined', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ColumnsBlock, {
      props: { ...baseProps, _key: 'test-cols-def', variant: undefined },
    });

    expect(html).toContain('lg:grid-cols-2');
    expect(html).toContain('items-start');
  });

  test('renders gap classes for column spacing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ColumnsBlock, {
      props: baseProps,
    });

    expect(html).toContain('gap-8');
    expect(html).toContain('lg:gap-16');
  });
});

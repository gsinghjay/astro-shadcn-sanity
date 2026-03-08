import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import Timeline from '../blocks/custom/Timeline.astro';
import { timelineFull, timelineSplit, timelineHorizontal, timelineMinimal } from './__fixtures__/timeline';

describe('Timeline', () => {
  test('renders vertical variant with heading and entries', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Timeline, {
      props: timelineFull,
    });

    expect(html).toContain('Our Journey');
    expect(html).toContain('Founded');
    expect(html).toContain('2020');
    expect(html).toContain('Series A');
  });

  test('renders description in vertical variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Timeline, {
      props: timelineFull,
    });

    expect(html).toContain('Key milestones in our history');
  });

  test('renders entry descriptions', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Timeline, {
      props: timelineFull,
    });

    expect(html).toContain('We started with a small team');
  });

  test('renders connecting line via before pseudo-element', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Timeline, {
      props: timelineFull,
    });

    expect(html).toContain('before:');
  });

  test('renders links/CTA buttons', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Timeline, {
      props: timelineFull,
    });

    expect(html).toContain('Learn More');
    expect(html).toContain('/about');
  });

  test('renders split variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Timeline, {
      props: timelineSplit,
    });

    expect(html).toContain('Founded');
    expect(html).toContain('Series A');
    expect(html).toContain('grid');
  });

  test('renders horizontal variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Timeline, {
      props: timelineHorizontal,
    });

    expect(html).toContain('Founded');
    expect(html).toContain('overflow-x-auto');
  });

  test('vertical variant does not render split or horizontal markup', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Timeline, {
      props: timelineFull,
    });

    expect(html).not.toContain('overflow-x-auto');
    expect(html).not.toContain('grid-cols-[1fr_auto_1fr]');
  });

  test('horizontal variant does not render vertical connecting line', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Timeline, {
      props: timelineHorizontal,
    });

    expect(html).not.toContain('before:h-full');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Timeline, {
      props: timelineMinimal,
    });
    expect(html).toBeDefined();
    expect(html).toContain('Event');
  });
});

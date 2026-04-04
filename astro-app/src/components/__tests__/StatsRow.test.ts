import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import StatsRow from '../blocks/custom/StatsRow.astro';
import { statsFull, statsMinimal } from './__fixtures__/stats-row';

describe('StatsRow', () => {
  test('renders stats values and labels', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatsRow, {
      props: statsFull,
    });

    expect(html).toContain('500+');
    expect(html).toContain('Members');
    expect(html).toContain('50');
    expect(html).toContain('Events');
    expect(html).toContain('20');
    expect(html).toContain('Projects');
  });

  test('renders heading when present', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatsRow, {
      props: statsFull,
    });

    expect(html).toContain('Our Impact');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatsRow, {
      props: statsMinimal,
    });
    expect(html).toBeDefined();
  });

  test('grid variant uses the existing manual 2x4 grid classes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatsRow, {
      props: { ...statsFull, variant: 'grid' },
    });

    expect(html).toContain('grid-cols-2 md:grid-cols-4');
  });

  test('split variant renders a single-column stat stack', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatsRow, {
      props: { ...statsFull, variant: 'split' },
    });

    expect(html).toContain('grid-cols-1');
    expect(html).not.toContain('grid-cols-2 md:grid-cols-4');
  });

  test('spread variant renders spread container classes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatsRow, {
      props: { ...statsFull, variant: 'spread' },
    });

    expect(html).toContain('@5xl:justify-between');
  });

  test('grid variant uses 1px border (border-y, not border-y-2)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatsRow, {
      props: { ...statsFull, variant: 'grid' },
    });

    expect(html).toContain('border-y');
    expect(html).not.toContain('border-y-2');
  });

  test('unknown variant falls back to grid layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatsRow, {
      props: { ...statsFull, variant: 'legacy-variant' },
    });

    expect(html).toContain('grid-cols-2 md:grid-cols-4');
  });
});

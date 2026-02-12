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
});

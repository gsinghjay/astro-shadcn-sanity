import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ComparisonTable from '../blocks/custom/ComparisonTable.astro';
import { comparisonTableFull, comparisonTableStacked, comparisonTableMinimal } from './__fixtures__/comparison-table';

describe('ComparisonTable', () => {
  test('renders table variant with heading and column headers', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ComparisonTable, {
      props: comparisonTableFull,
    });

    expect(html).toContain('Plan Comparison');
    expect(html).toContain('Free');
    expect(html).toContain('Pro');
    expect(html).toContain('Enterprise');
  });

  test('renders row data in table variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ComparisonTable, {
      props: comparisonTableFull,
    });

    expect(html).toContain('Storage');
    expect(html).toContain('5 GB');
    expect(html).toContain('50 GB');
    expect(html).toContain('Unlimited');
  });

  test('renders header rows in table variant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ComparisonTable, {
      props: comparisonTableFull,
    });

    expect(html).toContain('Advanced Features');
  });

  test('renders highlighted column with bg-muted', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ComparisonTable, {
      props: comparisonTableFull,
    });

    expect(html).toContain('bg-muted');
  });

  test('renders links/CTA buttons', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ComparisonTable, {
      props: comparisonTableFull,
    });

    expect(html).toContain('Get Started');
    expect(html).toContain('/signup');
  });

  test('renders stacked variant with column cards', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ComparisonTable, {
      props: comparisonTableStacked,
    });

    expect(html).toContain('Free');
    expect(html).toContain('Pro');
    expect(html).toContain('Storage');
    expect(html).toContain('5 GB');
  });

  test('table variant does not render stacked markup', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ComparisonTable, {
      props: comparisonTableFull,
    });

    // Table variant should not contain Tile components from stacked variant
    expect(html).not.toContain('tile');
  });

  test('stacked variant does not render table markup', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ComparisonTable, {
      props: comparisonTableStacked,
    });

    // Stacked variant should not contain thead from table variant
    expect(html).not.toContain('thead');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ComparisonTable, {
      props: comparisonTableMinimal,
    });
    expect(html).toBeDefined();
    expect(html).toContain('Item');
  });
});

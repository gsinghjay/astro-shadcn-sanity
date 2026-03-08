import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import Divider from '../blocks/custom/Divider.astro';
import { dividerLine, dividerShort, dividerLabeled, dividerMinimal } from './__fixtures__/divider';

describe('Divider', () => {
  test('renders line variant as hr element', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Divider, {
      props: dividerLine,
    });

    expect(html).toContain('<hr');
    expect(html).toContain('border-t');
    expect(html).toContain('border-border');
  });

  test('renders short variant with fixed width', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Divider, {
      props: dividerShort,
    });

    expect(html).toContain('w-16');
    expect(html).toContain('mx-auto');
    expect(html).not.toContain('<hr');
  });

  test('renders labeled variant with label text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Divider, {
      props: dividerLabeled,
    });

    expect(html).toContain('Section 1');
    expect(html).toContain('label-caps');
    expect(html).toContain('flex-grow');
  });

  test('handles minimal data without crashing (defaults to line)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Divider, {
      props: dividerMinimal,
    });

    expect(html).toBeDefined();
    expect(html).toContain('<hr');
  });
});

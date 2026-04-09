import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import TabsBlock from '../blocks/custom/TabsBlock.astro';

const sharedTabs = [
  { _key: 'tab-1', label: 'Tab One', content: 'Content one' },
  { _key: 'tab-2', label: 'Tab Two', content: 'Content two' },
  { _key: 'tab-3', label: 'Tab Three', content: 'Content three' },
];

const baseProps = {
  _type: 'tabsBlock' as const,
  _key: 'test-tabs',
  backgroundVariant: null,
  spacing: 'default' as const,
  maxWidth: 'default' as const,
  heading: 'Test Tabs',
  tabs: sharedTabs,
};

describe('TabsBlock', () => {
  test('default variant renders heading and tabs', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TabsBlock, {
      props: { ...baseProps, variant: 'default' },
    });

    expect(html).toContain('Test Tabs');
    expect(html).toContain('Tab One');
    expect(html).toContain('Content one');
  });

  test('unknown variant falls back to default', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TabsBlock, {
      props: { ...baseProps, variant: 'unknown' },
    });

    expect(html).toContain('Test Tabs');
    expect(html).toContain('Tab One');
  });

  test('brutalist variant renders bordered tab triggers', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TabsBlock, {
      props: { ...baseProps, variant: 'brutalist' },
    });

    expect(html).toContain('border-2');
    expect(html).toContain('border-border');
  });

  test('brutalist variant renders active tab with red bg and white text', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TabsBlock, {
      props: { ...baseProps, variant: 'brutalist' },
    });

    expect(html).toContain('data-[state=active]:bg-primary');
    expect(html).toContain('data-[state=active]:text-primary-foreground');
  });

  test('brutalist variant renders thick top-border connecting to content', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TabsBlock, {
      props: { ...baseProps, variant: 'brutalist' },
    });

    expect(html).toContain('border-t-4');
    expect(html).toContain('border-primary');
  });

  test('brutalist variant renders heading with left border accent', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TabsBlock, {
      props: { ...baseProps, variant: 'brutalist' },
    });

    expect(html).toContain('border-l-4');
    expect(html).toContain('pl-6');
  });
});

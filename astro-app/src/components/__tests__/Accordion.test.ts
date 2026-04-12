import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import Accordion from '../blocks/custom/Accordion.astro';

const sharedItems = [
  { _key: 'acc-1', title: 'Question one', content: 'Answer one' },
  { _key: 'acc-2', title: 'Question two', content: 'Answer two' },
  { _key: 'acc-3', title: 'Question three', content: 'Answer three' },
];

const baseProps = {
  _type: 'accordion' as const,
  _key: 'test-accordion',
  backgroundVariant: null,
  spacing: 'default' as const,
  maxWidth: 'default' as const,
  heading: 'Test Accordion',
  description: 'Test description',
  items: sharedItems,
};

describe('Accordion', () => {
  test('default variant renders heading and items', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Accordion, {
      props: { ...baseProps, variant: 'default' },
    });

    expect(html).toContain('Test Accordion');
    expect(html).toContain('Question one');
    expect(html).toContain('Answer one');
  });

  test('unknown variant falls back to default', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Accordion, {
      props: { ...baseProps, variant: 'unknown-variant' },
    });

    expect(html).toContain('Test Accordion');
    expect(html).toContain('divide-y');
  });

  test('technical variant renders thick left-border on heading', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Accordion, {
      props: { ...baseProps, variant: 'technical' },
    });

    expect(html).toContain('border-l-4');
    expect(html).toContain('border-primary');
    expect(html).toContain('pl-6');
  });

  test('technical variant renders monospace question numbers', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Accordion, {
      props: { ...baseProps, variant: 'technical' },
    });

    expect(html).toContain('font-mono');
    expect(html).toContain('01');
    expect(html).toContain('02');
    expect(html).toContain('03');
  });

  test('technical variant renders left-border that turns red on open', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Accordion, {
      props: { ...baseProps, variant: 'technical' },
    });

    expect(html).toContain('border-l-4');
    expect(html).toContain('open:border-primary');
  });

  test('technical variant renders vertical rule on answer content', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Accordion, {
      props: { ...baseProps, variant: 'technical' },
    });

    expect(html).toContain('border-l');
    expect(html).toContain('border-border');
    expect(html).toContain('Answer one');
  });
});

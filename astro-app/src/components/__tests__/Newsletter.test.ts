import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import Newsletter from '../blocks/custom/Newsletter.astro';

const baseProps = {
  _type: 'newsletter' as const,
  _key: 'test-newsletter',
  backgroundVariant: null,
  spacing: 'default' as const,
  maxWidth: 'default' as const,
  heading: 'Stay Connected',
  description: 'Get updates delivered to your inbox.',
  inputPlaceholder: 'you@company.com',
  submitButtonLabel: 'Subscribe',
  privacyDisclaimerText: 'No spam ever.',
};

describe('Newsletter', () => {
  test('inline variant renders heading and form', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Newsletter, {
      props: { ...baseProps, variant: 'inline' },
    });

    expect(html).toContain('Stay Connected');
    expect(html).toContain('you@company.com');
    expect(html).toContain('Subscribe');
  });

  test('unknown variant falls back to inline', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Newsletter, {
      props: { ...baseProps, variant: 'unknown' },
    });

    expect(html).toContain('Stay Connected');
  });

  test('brutalist variant renders thick border input', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Newsletter, {
      props: { ...baseProps, variant: 'brutalist' },
    });

    expect(html).toContain('border-2');
  });

  test('brutalist variant renders monospace placeholder', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Newsletter, {
      props: { ...baseProps, variant: 'brutalist' },
    });

    expect(html).toContain('font-mono');
    expect(html).toContain('placeholder:font-mono');
  });

  test('brutalist variant renders uppercase outlined button', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Newsletter, {
      props: { ...baseProps, variant: 'brutalist' },
    });

    expect(html).toContain('uppercase');
    expect(html).toContain('tracking-wider');
  });

  test('brutalist variant renders disclaimer when provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Newsletter, {
      props: { ...baseProps, variant: 'brutalist' },
    });

    expect(html).toContain('No spam ever.');
  });

  test('banner variant renders disclaimer when provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Newsletter, {
      props: { ...baseProps, variant: 'banner' },
    });

    expect(html).toContain('No spam ever.');
  });

  test('split variant renders disclaimer when provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Newsletter, {
      props: { ...baseProps, variant: 'split' },
    });

    expect(html).toContain('No spam ever.');
  });

  test('inline variant renders disclaimer when provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Newsletter, {
      props: { ...baseProps, variant: 'inline' },
    });

    expect(html).toContain('No spam ever.');
  });
});

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import CtaBanner from '../blocks/custom/CtaBanner.astro';
import { ctaFull, ctaMinimal } from './__fixtures__/cta-banner';

describe('CtaBanner', () => {
  test('renders heading, description, and CTA buttons', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CtaBanner, {
      props: ctaFull,
    });

    expect(html).toContain('Ready to Get Started?');
    expect(html).toContain('Join our community today and start building.');
    expect(html).toContain('Sign Up');
    expect(html).toContain('/contact');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CtaBanner, {
      props: ctaMinimal,
    });

    expect(html).toContain('Simple CTA');
  });

  test('omits description when null', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CtaBanner, {
      props: ctaMinimal,
    });

    expect(html).not.toContain('opacity-80');
  });

  test('does not apply background classes on Section (wrapper handles background)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CtaBanner, {
      props: ctaFull,
    });

    // Section element should not have bg-primary (BlockWrapper handles backgrounds now)
    const sectionMatch = html.match(/<section[^>]*class="([^"]*)"/);
    expect(sectionMatch).toBeTruthy();
    expect(sectionMatch![1]).not.toContain('bg-primary');
  });

  test('retains button color mapping per backgroundVariant', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CtaBanner, {
      props: ctaFull,
    });

    // Primary button should get variant-specific classes (primaryBtnMap['primary'])
    expect(html).toContain('bg-background');
  });

  test('renders GTM tracking attributes on CTA buttons', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CtaBanner, {
      props: ctaFull,
    });

    expect(html).toContain('data-gtm-category="cta"');
    expect(html).toContain('data-gtm-action="click"');
    expect(html).toContain('data-gtm-label="Sign Up"');
  });
});

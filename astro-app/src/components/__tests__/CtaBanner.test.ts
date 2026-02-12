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
});

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import HeroBanner from '../blocks/custom/HeroBanner.astro';
import { heroFull, heroMinimal } from './__fixtures__/hero-banner';

describe('HeroBanner', () => {
  test('renders heading and subheading', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HeroBanner, {
      props: heroFull,
    });

    expect(html).toContain('Welcome to YWCC');
    expect(html).toContain('Building community through technology');
  });

  test('renders CTA buttons with links', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HeroBanner, {
      props: heroFull,
    });

    expect(html).toContain('Get Started');
    expect(html).toContain('/about');
    expect(html).toContain('Learn More');
    expect(html).toContain('/projects');
  });

  test('renders background images in carousel', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HeroBanner, {
      props: heroFull,
    });

    expect(html).toContain('data-carousel');
    expect(html).toContain('Test background');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HeroBanner, {
      props: heroMinimal,
    });

    expect(html).toContain('Minimal Hero');
    expect(html).not.toContain('data-carousel');
  });

  test('omits subheading when null', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HeroBanner, {
      props: heroMinimal,
    });

    // Subheading paragraph should not render
    expect(html).not.toContain('text-background/60');
  });

  test('omits CTA section when no buttons', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HeroBanner, {
      props: heroMinimal,
    });

    expect(html).not.toContain('Get Started');
  });
});

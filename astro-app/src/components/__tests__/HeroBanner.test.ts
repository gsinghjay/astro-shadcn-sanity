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

  test('first slide has fetchpriority="high" and loading="eager"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HeroBanner, {
      props: heroFull,
    });

    // First slide should be eager-loaded with high priority
    expect(html).toContain('fetchpriority="high"');
    expect(html).toContain('loading="eager"');
  });

  test('carousel images use urlFor() with dimensions and auto=format', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HeroBanner, {
      props: heroFull,
    });

    expect(html).toContain('auto=format');
    expect(html).toContain('w=1920');
    expect(html).toContain('h=1080');
  });

  test('renders LQIP blur placeholder on slides', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HeroBanner, {
      props: heroFull,
    });

    expect(html).toContain('data:image/jpeg;base64,/9j/2wBDAAYEBQY');
    expect(html).toContain('background-image');
    expect(html).toContain('background-size: cover');
  });

  test('subsequent slides have loading="lazy"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HeroBanner, {
      props: heroFull,
    });

    // Should have at least one lazy-loaded slide (slide 2+)
    expect(html).toContain('loading="lazy"');
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

  test('renders GTM tracking attributes on CTA buttons', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(HeroBanner, {
      props: heroFull,
    });

    expect(html).toContain('data-gtm-category="cta"');
    expect(html).toContain('data-gtm-action="click"');
    expect(html).toContain('data-gtm-label="Get Started"');
    expect(html).toContain('data-gtm-label="Learn More"');
  });
});

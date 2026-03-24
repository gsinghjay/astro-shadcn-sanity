import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import LogoCloud from '../blocks/custom/LogoCloud.astro';
import { logoCloudFull, logoCloudMinimal, logoCloudMarquee, logoCloudFlexWrap } from './__fixtures__/logo-cloud';

describe('LogoCloud', () => {
  test('renders heading and sponsor logos', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: logoCloudFull,
    });

    expect(html).toContain('Trusted By');
    expect(html).toContain('TechCorp');
  });

  test('renders logo image with sponsor name as alt', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: logoCloudFull,
    });

    // LogoCloud uses sponsor.name as alt text
    expect(html).toContain('alt="TechCorp"');
  });

  test('renders sponsor name as fallback when no logo', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: logoCloudFull,
    });

    expect(html).toContain('DataLabs');
  });

  test('wraps sponsor in link when website is present', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: logoCloudFull,
    });

    expect(html).toContain('https://techcorp.example.com');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: logoCloudMinimal,
    });
    expect(html).toBeDefined();
  });

  test('grid variant renders grid layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: { ...logoCloudFull, variant: 'grid' },
    });

    expect(html).toContain('grid-cols-2');
    expect(html).not.toContain('group/marquee');
    expect(html).not.toContain('flex-wrap');
  });

  test('null variant defaults to grid layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: logoCloudFull, // variant: null
    });

    expect(html).toContain('grid-cols-2');
    expect(html).not.toContain('group/marquee');
  });

  test('marquee variant renders marquee scroll container', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: logoCloudMarquee,
    });

    expect(html).toContain('group/marquee');
    expect(html).toContain('TechCorp');
    expect(html).toContain('DataLabs');
    expect(html).not.toContain('grid-cols-2');
  });

  test('marquee variant renders heading', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: logoCloudMarquee,
    });

    expect(html).toContain('Trusted By');
  });

  test('flex-wrap variant renders flex-wrap layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: logoCloudFlexWrap,
    });

    expect(html).toContain('flex-wrap');
    expect(html).toContain('TechCorp');
    expect(html).toContain('DataLabs');
    expect(html).not.toContain('grid-cols-2');
    expect(html).not.toContain('group/marquee');
  });

  test('flex-wrap variant renders heading', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: logoCloudFlexWrap,
    });

    expect(html).toContain('Trusted By');
  });
});

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import LogoCloud from '../blocks/custom/LogoCloud.astro';
import { logoCloudFull, logoCloudMinimal } from './__fixtures__/logo-cloud';

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

  test('logo cells use opacity-only hover (no hover:bg-background)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: logoCloudFull,
    });

    expect(html).not.toContain('hover:bg-background');
    expect(html).not.toContain('transition-colors');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: logoCloudMinimal,
    });
    expect(html).toBeDefined();
  });

  test('marquee variant renders two marquee lanes with larger logos', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: { ...logoCloudFull, variant: 'marquee' },
    });

    const marqueeLaneCount = (html.match(/group\/marquee/g) ?? []).length;
    expect(marqueeLaneCount).toBe(2);
    expect(html).toContain('bg-foreground');
  });

  test('tiered variant renders tier headers', async () => {
    const platinumSponsor = { ...logoCloudFull.sponsors![0], tier: 'platinum' };
    const goldSponsor = { ...logoCloudFull.sponsors![1], tier: 'gold' };
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: { ...logoCloudFull, variant: 'tiered', sponsors: [platinumSponsor, goldSponsor] },
    });

    expect(html).toContain('PLATINUM PARTNERS');
    expect(html).toContain('GOLD PARTNERS');
  });

  test('grid-prominent variant renders platinum sponsors with col-span-2', async () => {
    const platinumSponsor = { ...logoCloudFull.sponsors![0], tier: 'platinum' };
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: { ...logoCloudFull, variant: 'grid-prominent', sponsors: [platinumSponsor] },
    });

    expect(html).toContain('col-span-2');
  });

  test('unknown variant falls back to default grid layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: { ...logoCloudFull, variant: 'nonexistent' },
    });

    expect(html).toContain('grid-cols-2');
    expect(html).toContain('lg:grid-cols-8');
  });
});

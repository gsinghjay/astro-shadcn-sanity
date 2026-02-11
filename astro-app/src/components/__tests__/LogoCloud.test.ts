import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import LogoCloud from '../blocks/custom/LogoCloud.astro';
import { logoCloudFull, logoCloudMinimal } from './__fixtures__/logo-cloud';

describe('LogoCloud', () => {
  test('renders heading and sponsor logos', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: { block: logoCloudFull },
    });

    expect(html).toContain('Trusted By');
    expect(html).toContain('TechCorp');
  });

  test('renders logo image with sponsor name as alt', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: { block: logoCloudFull },
    });

    // LogoCloud uses sponsor.name as alt text
    expect(html).toContain('alt="TechCorp"');
  });

  test('renders sponsor name as fallback when no logo', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: { block: logoCloudFull },
    });

    expect(html).toContain('DataLabs');
  });

  test('wraps sponsor in link when website is present', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: { block: logoCloudFull },
    });

    expect(html).toContain('https://techcorp.example.com');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(LogoCloud, {
      props: { block: logoCloudMinimal },
    });
    expect(html).toBeDefined();
  });
});

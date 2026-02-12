import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import SponsorSteps from '../blocks/custom/SponsorSteps.astro';
import { sponsorStepsFull, sponsorStepsMinimal } from './__fixtures__/sponsor-steps';

describe('SponsorSteps', () => {
  test('renders heading and subheading', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorSteps, {
      props: sponsorStepsFull,
    });

    expect(html).toContain('How to Become a Sponsor');
    expect(html).toContain('Follow these simple steps');
  });

  test('renders step items with titles and descriptions', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorSteps, {
      props: sponsorStepsFull,
    });

    expect(html).toContain('Choose a Tier');
    expect(html).toContain('Select the sponsorship level that works for you.');
    expect(html).toContain('Contact Us');
  });

  test('renders list items within steps', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorSteps, {
      props: sponsorStepsFull,
    });

    expect(html).toContain('Platinum');
    expect(html).toContain('Gold');
    expect(html).toContain('Silver');
    expect(html).toContain('Bronze');
  });

  test('renders CTA buttons', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorSteps, {
      props: sponsorStepsFull,
    });

    expect(html).toContain('Get Started');
    expect(html).toContain('/contact');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorSteps, {
      props: sponsorStepsMinimal,
    });
    expect(html).toBeDefined();
  });
});

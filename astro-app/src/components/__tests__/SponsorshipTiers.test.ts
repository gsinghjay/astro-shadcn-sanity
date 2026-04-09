import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import SponsorshipTiers from '../blocks/custom/SponsorshipTiers.astro';
import { tiersFull, tiersMinimal } from './__fixtures__/sponsorship-tiers';

describe('SponsorshipTiers', () => {
  test('renders heading and description', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: tiersFull,
    });

    expect(html).toContain('Sponsorship Tiers');
    expect(html).toContain('Choose the sponsorship level that fits your organization.');
  });

  test('renders tier names and prices', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: tiersFull,
    });

    expect(html).toContain('Bronze');
    expect(html).toContain('$0');
    expect(html).toContain('Gold');
    expect(html).toContain('$5,000');
    expect(html).toContain('Platinum');
    expect(html).toContain('Custom');
  });

  test('renders benefits list', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: tiersFull,
    });

    expect(html).toContain('Logo on website');
    expect(html).toContain('Newsletter mention');
    expect(html).toContain('Dedicated project team');
    expect(html).toContain('Executive briefings');
  });

  test('renders CTA buttons', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: tiersFull,
    });

    expect(html).toContain('Get Started');
    expect(html).toContain('Contact Us');
    expect(html).toContain('Talk to Us');
    expect(html).toContain('href="/contact"');
  });

  test('highlighted tier gets ring-primary class', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: tiersFull,
    });

    expect(html).toContain('ring-primary');
    expect(html).toContain('Recommended');
  });

  test('GTM tracking attributes rendered on CTA buttons', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: tiersFull,
    });

    expect(html).toContain('data-gtm-category="sponsorship"');
    expect(html).toContain('data-gtm-action="click"');
    expect(html).toContain('data-gtm-label="Bronze"');
    expect(html).toContain('data-gtm-label="Gold"');
    expect(html).toContain('data-gtm-label="Platinum"');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: tiersMinimal,
    });

    expect(html).toBeDefined();
    expect(html).toContain('Free');
    expect(html).toContain('$0');
    expect(html).toContain('Basic access');
  });

  test('minimal data does not render heading or description', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: tiersMinimal,
    });

    expect(html).not.toContain('<h2');
  });

  test('non-highlighted tiers get border styling', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: tiersFull,
    });

    expect(html).toContain('border-border');
    expect(html).toContain('shadow-sm');
  });

  test('highlighted tier button uses default variant, non-highlighted uses outline', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: tiersFull,
    });

    // outline variant includes shadow-xs; default variant includes bg-primary
    expect(html).toContain('bg-primary');
    expect(html).toContain('shadow-xs');
  });

  test('renders without crashing when tiers is null', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: { ...tiersMinimal, tiers: null } as any,
    });

    expect(html).toBeDefined();
    expect(html).not.toContain('<h3');
  });

  test('tier cards have no rounded-lg class', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: tiersFull,
    });

    expect(html).not.toContain('rounded-lg');
  });

  test('highlighted tier uses shadow-sm not shadow-lg', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: tiersFull,
    });

    expect(html).not.toContain('shadow-lg');
  });

  test('root section has data-animate attribute', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: tiersFull,
    });

    expect(html).toContain('data-animate');
  });

  test('brutalist variant renders tier color bars and monospace pricing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: { ...tiersFull, variant: 'brutalist' },
    });

    expect(html).toContain('border-2 border-foreground');
    expect(html).toContain('font-mono');
    expect(html).toContain('h-2');
  });

  test('brutalist variant renders square bullet points', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: { ...tiersFull, variant: 'brutalist' },
    });

    expect(html).toContain('&#9632;');
  });

  test('brutalist variant preserves GTM tracking attributes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: { ...tiersFull, variant: 'brutalist' },
    });

    expect(html).toContain('data-gtm-category="sponsorship"');
    expect(html).toContain('data-gtm-action="click"');
  });
});

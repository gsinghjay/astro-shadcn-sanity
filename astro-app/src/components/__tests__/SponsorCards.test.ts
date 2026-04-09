import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import SponsorCards from '../blocks/custom/SponsorCards.astro';
import { sponsorCardsFull, sponsorCardsMinimal } from './__fixtures__/sponsor-cards';

describe('SponsorCards', () => {
  test('renders heading and sponsor names', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorCards, {
      props: sponsorCardsFull,
    });

    expect(html).toContain('Our Sponsors');
    expect(html).toContain('Acme Corp');
    expect(html).toContain('Beta Inc');
  });

  test('renders tier badges', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorCards, {
      props: sponsorCardsFull,
    });

    expect(html).toContain('gold');
    expect(html).toContain('silver');
  });

  test('renders sponsor description and website link', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorCards, {
      props: sponsorCardsFull,
    });

    expect(html).toContain('Leading technology partner');
    expect(html).toContain('https://acme.example.com');
    expect(html).toContain('Visit Website');
  });

  test('renders logo image with urlFor responsive dimensions', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorCards, {
      props: sponsorCardsFull,
    });

    expect(html).toContain('Acme logo');
    // urlFor outputs CDN URL with w= and h= params
    expect(html).toMatch(/src="[^"]*w=112[^"]*h=112/);
  });

  test('renders initials fallback when no logo', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorCards, {
      props: sponsorCardsFull,
    });

    // Beta Inc has no logo — should show initials "BI"
    expect(html).toContain('BI');
  });

  test('renders detail page links to /sponsors/{slug}', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorCards, {
      props: sponsorCardsFull,
    });

    expect(html).toContain('href="/sponsors/acme-corp"');
    expect(html).toContain('href="/sponsors/beta-inc"');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorCards, {
      props: sponsorCardsMinimal,
    });
    expect(html).toBeDefined();
  });

  test('renders GTM tracking attributes on sponsor links', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorCards, {
      props: sponsorCardsFull,
    });

    expect(html).toContain('data-gtm-category="sponsor"');
    expect(html).toContain('data-gtm-label="Acme Corp"');
    expect(html).toContain('data-gtm-action="external"');
    expect(html).toContain('data-gtm-action="detail"');
  });

  test('showcase variant renders horizontal card layout', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorCards, {
      props: { ...sponsorCardsFull, variant: 'showcase' },
    });

    expect(html).toContain('md:flex-row');
    expect(html).toContain('Acme Corp');
    expect(html).toContain('Leading technology partner');
  });

  test('brutalist-tier variant renders tier color bar and monospace label', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorCards, {
      props: { ...sponsorCardsFull, variant: 'brutalist-tier' },
    });

    expect(html).toContain('border-2 border-foreground');
    expect(html).toContain('font-mono');
    expect(html).toContain('h-2');
  });

  test('unknown variant falls back to default card grid', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorCards, {
      props: { ...sponsorCardsFull, variant: 'nonexistent' },
    });

    expect(html).toContain('data-gtm-category="sponsor"');
    expect(html).toContain('data-gtm-action="detail"');
  });
});

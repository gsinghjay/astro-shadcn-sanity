import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import BlockRenderer from '../BlockRenderer.astro';
import type { PageBlock } from '@/lib/types';
import { heroFull } from './__fixtures__/hero-banner';
import { featureGridFull } from './__fixtures__/feature-grid';
import { ctaFull } from './__fixtures__/cta-banner';
import { statsFull } from './__fixtures__/stats-row';
import { faqFull } from './__fixtures__/faq-section';
import { richTextFull } from './__fixtures__/rich-text';
import { sponsorCardsFull, sponsorCardsSponsors } from './__fixtures__/sponsor-cards';
import { sponsorStepsFull } from './__fixtures__/sponsor-steps';
import { logoCloudFull, logoCloudSponsors } from './__fixtures__/logo-cloud';
import { textWithImageFull } from './__fixtures__/text-with-image';
import { contactFormFull } from './__fixtures__/contact-form';

describe('BlockRenderer', () => {
  test('dispatches heroBanner to HeroBanner component', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockRenderer, {
      props: { blocks: [heroFull] },
    });
    expect(html).toContain('Welcome to YWCC');
  });

  test('dispatches featureGrid to FeatureGrid component', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockRenderer, {
      props: { blocks: [featureGridFull] },
    });
    expect(html).toContain('What We Offer');
    expect(html).toContain('Web Development');
  });

  test('dispatches ctaBanner to CtaBanner component', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockRenderer, {
      props: { blocks: [ctaFull] },
    });
    expect(html).toContain('Ready to Get Started?');
    expect(html).toContain('Sign Up');
  });

  test('dispatches statsRow to StatsRow component', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockRenderer, {
      props: { blocks: [statsFull] },
    });
    expect(html).toContain('500+');
    expect(html).toContain('Members');
  });

  test('dispatches faqSection to FaqSection component', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockRenderer, {
      props: { blocks: [faqFull] },
    });
    expect(html).toContain('Frequently Asked Questions');
    expect(html).toContain('What is YWCC?');
  });

  test('dispatches richText to RichText component', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockRenderer, {
      props: { blocks: [richTextFull] },
    });
    expect(html).toContain('About Our Mission');
    expect(html).toContain('We empower women in technology.');
  });

  test('dispatches sponsorCards to SponsorCards component', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockRenderer, {
      props: { blocks: [sponsorCardsFull], sponsors: sponsorCardsSponsors },
    });
    expect(html).toContain('Our Sponsors');
    expect(html).toContain('Acme Corp');
  });

  test('dispatches sponsorSteps to SponsorSteps component', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockRenderer, {
      props: { blocks: [sponsorStepsFull] },
    });
    expect(html).toContain('How to Become a Sponsor');
    expect(html).toContain('Choose a Tier');
  });

  test('dispatches logoCloud to LogoCloud component', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockRenderer, {
      props: { blocks: [logoCloudFull], sponsors: logoCloudSponsors },
    });
    expect(html).toContain('Trusted By');
    expect(html).toContain('TechCorp');
  });

  test('dispatches textWithImage to TextWithImage component', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockRenderer, {
      props: { blocks: [textWithImageFull] },
    });
    expect(html).toContain('Our Story');
  });

  test('dispatches contactForm to ContactForm component', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockRenderer, {
      props: { blocks: [contactFormFull] },
    });
    expect(html).toContain('Get In Touch');
    expect(html).toContain('data-contact-form');
  });

  test('renders all 11 custom block types in sequence', async () => {
    const allBlocks: PageBlock[] = [
      heroFull,
      featureGridFull,
      ctaFull,
      statsFull,
      faqFull,
      richTextFull,
      sponsorCardsFull,
      sponsorStepsFull,
      logoCloudFull,
      textWithImageFull,
      contactFormFull,
    ];

    // Merge all sponsor data for blocks that need it
    const allTestSponsors = [...logoCloudSponsors, ...sponsorCardsSponsors.filter(s => !logoCloudSponsors.some(ls => ls._id === s._id))];

    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockRenderer, {
      props: { blocks: allBlocks, sponsors: allTestSponsors },
    });

    // Every block's key content should appear
    expect(html).toContain('Welcome to YWCC');
    expect(html).toContain('What We Offer');
    expect(html).toContain('Ready to Get Started?');
    expect(html).toContain('500+');
    expect(html).toContain('Frequently Asked Questions');
    expect(html).toContain('About Our Mission');
    expect(html).toContain('Our Sponsors');
    expect(html).toContain('How to Become a Sponsor');
    expect(html).toContain('Trusted By');
    expect(html).toContain('Our Story');
    expect(html).toContain('Get In Touch');
  });

  test('unknown _type falls through without crashing', async () => {
    const unknownBlock = { _type: 'nonExistentType', _key: 'unknown-1' } as unknown as PageBlock;
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockRenderer, {
      props: { blocks: [unknownBlock] },
    });
    // Should render without crashing — unknown type returns null
    expect(html).toBeDefined();
  });

  test('empty blocks array renders without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(BlockRenderer, {
      props: { blocks: [] },
    });
    expect(html).toBeDefined();
  });
});

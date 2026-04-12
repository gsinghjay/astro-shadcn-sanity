import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock image utilities before imports
vi.mock('@/lib/image', () => ({
  urlFor: (img: unknown) => ({
    width: () => ({
      height: () => ({ fit: () => ({ url: () => 'https://cdn.sanity.io/mock-image.jpg' }) }),
      url: () => 'https://cdn.sanity.io/mock-image.jpg',
    }),
    url: () => 'https://cdn.sanity.io/mock-image.jpg',
  }),
  safeUrlFor: (img: unknown) => {
    if (!img || !(img as Record<string, unknown>)?.asset) return null;
    return {
      width: () => ({
        height: () => ({ fit: () => ({ url: () => 'https://cdn.sanity.io/mock-image.jpg' }) }),
        url: () => 'https://cdn.sanity.io/mock-image.jpg',
      }),
      url: () => 'https://cdn.sanity.io/mock-image.jpg',
    };
  },
}));

function extractJsonLd(html: string): Record<string, unknown>[] {
  const regex = /<script type="application\/ld\+json">(.*?)<\/script>/gs;
  const results: Record<string, unknown>[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    const parsed = JSON.parse(match[1]);
    if (Array.isArray(parsed)) {
      results.push(...parsed);
    } else {
      results.push(parsed);
    }
  }
  return results;
}

// ── Story 18.1 ──

describe('FaqSection JSON-LD', () => {
  test('emits FAQPage schema with Q&A pairs', async () => {
    const FaqSection = (await import('../blocks/custom/FaqSection.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqSection, {
      props: {
        _type: 'faqSection' as const,
        _key: 'faq-1',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'FAQ',
        items: [
          { _key: 'q1', question: 'What is this?', answer: 'A test.' },
          { _key: 'q2', question: 'How?', answer: 'Like this.' },
        ],
        variant: 'split',
      },
    });

    const schemas = extractJsonLd(html);
    const faq = schemas.find(s => s['@type'] === 'FAQPage');
    expect(faq).toBeDefined();
    expect(faq!['@context']).toBe('https://schema.org');
    expect((faq!.mainEntity as unknown[]).length).toBe(2);
  });

  test('does not emit JSON-LD when items empty', async () => {
    const FaqSection = (await import('../blocks/custom/FaqSection.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(FaqSection, {
      props: {
        _type: 'faqSection' as const,
        _key: 'faq-2',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'FAQ',
        items: [],
        variant: 'split',
      },
    });

    const schemas = extractJsonLd(html);
    expect(schemas.find(s => s['@type'] === 'FAQPage')).toBeUndefined();
  });
});

describe('SponsorSteps JSON-LD', () => {
  test('emits HowTo schema with steps', async () => {
    const SponsorSteps = (await import('../blocks/custom/SponsorSteps.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorSteps, {
      props: {
        _type: 'sponsorSteps' as const,
        _key: 'ss-1',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'How to Sponsor',
        subheading: 'Follow these steps',
        items: [
          { _key: 's1', title: 'Step 1', description: 'Do this', list: [] },
          { _key: 's2', title: 'Step 2', description: 'Then this', list: [] },
        ],
        variant: 'steps',
      },
    });

    const schemas = extractJsonLd(html);
    const howTo = schemas.find(s => s['@type'] === 'HowTo');
    expect(howTo).toBeDefined();
    expect(howTo!.name).toBe('How to Sponsor');
    expect((howTo!.step as unknown[]).length).toBe(2);
  });
});

describe('VideoEmbed JSON-LD', () => {
  test('emits VideoObject schema for YouTube URL', async () => {
    const VideoEmbed = (await import('../blocks/custom/VideoEmbed.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: {
        _type: 'videoEmbed' as const,
        _key: 've-1',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'Demo Video',
        description: 'Watch our demo',
        youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        variant: 'full-width',
      },
    });

    const schemas = extractJsonLd(html);
    const video = schemas.find(s => s['@type'] === 'VideoObject');
    expect(video).toBeDefined();
    expect(video!.name).toBe('Demo Video');
    expect(video!.embedUrl).toContain('youtube-nocookie.com');
    expect(video!.thumbnailUrl).toContain('dQw4w9WgXcQ');
  });

  test('does not emit JSON-LD for invalid URL', async () => {
    const VideoEmbed = (await import('../blocks/custom/VideoEmbed.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(VideoEmbed, {
      props: {
        _type: 'videoEmbed' as const,
        _key: 've-2',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'Bad Video',
        youtubeUrl: 'https://example.com/not-a-video',
        variant: 'full-width',
      },
    });

    const schemas = extractJsonLd(html);
    expect(schemas.find(s => s['@type'] === 'VideoObject')).toBeUndefined();
  });
});

describe('Accordion JSON-LD', () => {
  test('emits FAQPage schema', async () => {
    const Accordion = (await import('../blocks/custom/Accordion.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(Accordion, {
      props: {
        _type: 'accordion' as const,
        _key: 'acc-1',
        backgroundVariant: null,
        spacing: 'default' as const,
        maxWidth: 'default' as const,
        heading: 'FAQ',
        description: 'Common questions',
        items: [
          { _key: 'a1', title: 'Q1', content: 'A1' },
          { _key: 'a2', title: 'Q2', content: 'A2' },
        ],
        variant: 'default',
      },
    });

    const schemas = extractJsonLd(html);
    const faq = schemas.find(s => s['@type'] === 'FAQPage');
    expect(faq).toBeDefined();
    expect((faq!.mainEntity as unknown[]).length).toBe(2);
  });
});

// ── Story 18.2 ──

describe('PricingTable JSON-LD', () => {
  test('emits Offer schemas for tiers', async () => {
    const PricingTable = (await import('../blocks/custom/PricingTable.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(PricingTable, {
      props: {
        _type: 'pricingTable' as const,
        _key: 'pt-1',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'Pricing',
        tiers: [
          { _key: 't1', name: 'Basic', price: '$99/mo', features: [], highlighted: false },
          { _key: 't2', name: 'Pro', price: '$199/mo', features: [], highlighted: true },
        ],
        variant: 'simple',
      },
    });

    const schemas = extractJsonLd(html);
    const offers = schemas.filter(s => s['@type'] === 'Offer');
    expect(offers.length).toBe(2);
    expect(offers[0].name).toBe('Basic');
    expect(offers[0].price).toBe('99');
    expect(offers[0].priceCurrency).toBe('USD');
  });
});

describe('SponsorshipTiers JSON-LD', () => {
  test('emits Offer schemas with benefits as description', async () => {
    const SponsorshipTiers = (await import('../blocks/custom/SponsorshipTiers.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(SponsorshipTiers, {
      props: {
        _type: 'sponsorshipTiers' as const,
        _key: 'st-1',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'Sponsorship',
        tiers: [
          { _key: 't1', name: 'Gold', price: '$5,000/year', benefits: ['Logo placement', 'Event tickets'], highlighted: false },
        ],
        variant: 'default',
      },
    });

    const schemas = extractJsonLd(html);
    const offer = schemas.find(s => s['@type'] === 'Offer');
    expect(offer).toBeDefined();
    expect(offer!.price).toBe('5000');
    expect(offer!.description).toContain('Logo placement');
  });
});

describe('TeamGrid JSON-LD', () => {
  test('emits Person schemas for members', async () => {
    const TeamGrid = (await import('../blocks/custom/TeamGrid.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(TeamGrid, {
      props: {
        _type: 'teamGrid' as const,
        _key: 'tg-1',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'Team',
        items: [
          { _key: 'm1', name: 'Alice', role: 'Engineer', links: [{ _key: 'l1', label: 'GitHub', href: 'https://github.com/alice' }] },
          { _key: 'm2', name: 'Bob', role: 'Designer', links: [] },
        ],
        variant: 'grid',
      },
    });

    const schemas = extractJsonLd(html);
    const persons = schemas.filter(s => s['@type'] === 'Person');
    expect(persons.length).toBe(2);
    expect(persons[0].name).toBe('Alice');
    expect(persons[0].jobTitle).toBe('Engineer');
    expect((persons[0].sameAs as string[])).toContain('https://github.com/alice');
  });
});

describe('Testimonials JSON-LD', () => {
  test('emits Review schemas', async () => {
    const Testimonials = (await import('../blocks/custom/Testimonials.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(Testimonials, {
      props: {
        heading: 'What people say',
        testimonials: [
          { _id: 't1', name: 'Jane', quote: 'Great product!', role: 'CEO', organization: 'Acme', type: 'industry' },
        ],
        variant: 'grid',
      },
    });

    const schemas = extractJsonLd(html);
    const review = schemas.find(s => s['@type'] === 'Review');
    expect(review).toBeDefined();
    expect(review!.reviewBody).toBe('Great product!');
    expect((review!.author as Record<string, unknown>).name).toBe('Jane');
  });
});

describe('Timeline JSON-LD', () => {
  test('emits ItemList schema', async () => {
    const Timeline = (await import('../blocks/custom/Timeline.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(Timeline, {
      props: {
        _type: 'timeline' as const,
        _key: 'tl-1',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'Our Journey',
        description: 'Key milestones',
        items: [
          { _key: 'i1', date: '2024', title: 'Founded' },
          { _key: 'i2', date: '2025', title: 'Series A', description: 'Raised $10M' },
        ],
        variant: 'vertical',
      },
    });

    const schemas = extractJsonLd(html);
    const list = schemas.find(s => s['@type'] === 'ItemList');
    expect(list).toBeDefined();
    expect(list!.name).toBe('Our Journey');
    expect((list!.itemListElement as unknown[]).length).toBe(2);
  });
});

// ── Story 18.3 ──

describe('MapBlock JSON-LD', () => {
  test('emits Place schema with geo coordinates', async () => {
    const MapBlock = (await import('../blocks/custom/MapBlock.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(MapBlock, {
      props: {
        _type: 'mapBlock' as const,
        _key: 'mb-1',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'Our Office',
        address: '123 Main St, City, ST 12345',
        coordinates: { lat: 40.7128, lng: -74.006 },
        variant: 'default',
      },
    });

    const schemas = extractJsonLd(html);
    const place = schemas.find(s => s['@type'] === 'Place');
    expect(place).toBeDefined();
    expect(place!.name).toBe('Our Office');
    expect(place!.address).toBe('123 Main St, City, ST 12345');
    expect((place!.geo as Record<string, unknown>).latitude).toBe(40.7128);
  });

  test('emits LocalBusiness when contact info present', async () => {
    const MapBlock = (await import('../blocks/custom/MapBlock.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(MapBlock, {
      props: {
        _type: 'mapBlock' as const,
        _key: 'mb-2',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'Our Office',
        coordinates: { lat: 40.7128, lng: -74.006 },
        contactInfo: { phone: '555-1234', email: 'info@test.com' },
        variant: 'split',
      },
    });

    const schemas = extractJsonLd(html);
    const biz = schemas.find(s => s['@type'] === 'LocalBusiness');
    expect(biz).toBeDefined();
    expect(biz!.telephone).toBe('555-1234');
    expect(biz!.email).toBe('info@test.com');
  });
});

describe('StatsRow JSON-LD', () => {
  test('emits QuantitativeValue schemas', async () => {
    const StatsRow = (await import('../blocks/custom/StatsRow.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(StatsRow, {
      props: {
        _type: 'statsRow' as const,
        _key: 'sr-1',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'Stats',
        stats: [
          { _key: 's1', value: '98%', label: 'Success Rate' },
          { _key: 's2', value: '$2M', label: 'Revenue' },
        ],
        variant: 'grid',
      },
    });

    const schemas = extractJsonLd(html);
    const stats = schemas.filter(s => s['@type'] === 'QuantitativeValue');
    expect(stats.length).toBe(2);
    expect(stats[0].value).toBe('98');
    expect(stats[0].unitText).toBe('percent');
    expect(stats[1].value).toBe('2000000');
    expect(stats[1].unitText).toBe('USD');
  });
});

describe('CountdownTimer JSON-LD', () => {
  test('emits Event schema with target date', async () => {
    const CountdownTimer = (await import('../blocks/custom/CountdownTimer.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(CountdownTimer, {
      props: {
        _type: 'countdownTimer' as const,
        _key: 'ct-1',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'Launch Day',
        description: 'Get ready!',
        targetDate: '2026-06-01T00:00:00Z',
        variant: 'inline',
      },
    });

    const schemas = extractJsonLd(html);
    const event = schemas.find(s => s['@type'] === 'Event');
    expect(event).toBeDefined();
    expect(event!.name).toBe('Launch Day');
    expect(event!.startDate).toBe('2026-06-01T00:00:00Z');
    expect(event!.eventStatus).toBe('https://schema.org/EventScheduled');
  });

  test('does not emit JSON-LD without targetDate', async () => {
    const CountdownTimer = (await import('../blocks/custom/CountdownTimer.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(CountdownTimer, {
      props: {
        _type: 'countdownTimer' as const,
        _key: 'ct-2',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'TBD Event',
        variant: 'inline',
      },
    });

    const schemas = extractJsonLd(html);
    expect(schemas.find(s => s['@type'] === 'Event')).toBeUndefined();
  });
});

describe('ImageGallery JSON-LD', () => {
  test('emits ImageGallery schema with images', async () => {
    const ImageGallery = (await import('../blocks/custom/ImageGallery.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(ImageGallery, {
      props: {
        _type: 'imageGallery' as const,
        _key: 'ig-1',
        backgroundVariant: null,
        spacing: null,
        maxWidth: null,
        heading: 'Photo Gallery',
        description: 'Our best photos',
        images: [
          { _key: 'i1', image: { asset: { _ref: 'image-1' }, alt: 'Photo 1' }, caption: 'First photo' },
          { _key: 'i2', image: { asset: { _ref: 'image-2' }, alt: 'Photo 2' }, caption: 'Second photo' },
        ],
        variant: 'grid',
      },
    });

    const schemas = extractJsonLd(html);
    const gallery = schemas.find(s => s['@type'] === 'ImageGallery');
    expect(gallery).toBeDefined();
    expect(gallery!.name).toBe('Photo Gallery');
    expect((gallery!.image as unknown[]).length).toBe(2);
  });
});

describe('Multiple JSON-LD scripts on one page', () => {
  test('each block emits independent scripts', async () => {
    const Accordion = (await import('../blocks/custom/Accordion.astro')).default;
    const container = await AstroContainer.create();
    const html = await container.renderToString(Accordion, {
      props: {
        _type: 'accordion' as const,
        _key: 'acc-multi',
        backgroundVariant: null,
        spacing: 'default' as const,
        maxWidth: 'default' as const,
        heading: 'FAQ',
        items: [
          { _key: 'q1', title: 'Q1', content: 'A1' },
        ],
        variant: 'default',
      },
    });

    const schemas = extractJsonLd(html);
    expect(schemas.length).toBeGreaterThanOrEqual(1);
    schemas.forEach(s => {
      expect(s['@context']).toBe('https://schema.org');
    });
  });
});

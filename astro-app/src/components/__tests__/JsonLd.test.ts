import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import JsonLd from '../ui/json-ld/JsonLd.astro';

describe('JsonLd', () => {
  test('renders script tag with application/ld+json type', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JsonLd, {
      props: { schema: { '@type': 'FAQPage' } },
    });

    expect(html).toContain('<script type="application/ld+json">');
  });

  test('adds @context when missing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JsonLd, {
      props: { schema: { '@type': 'FAQPage' } },
    });

    const parsed = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)![1]);
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@type']).toBe('FAQPage');
  });

  test('preserves existing @context', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(JsonLd, {
      props: { schema: { '@context': 'https://schema.org', '@type': 'Event' } },
    });

    const parsed = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)![1]);
    expect(parsed['@context']).toBe('https://schema.org');
  });

  test('serializes complex nested schema', async () => {
    const container = await AstroContainer.create();
    const schema = {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'What is this?',
          acceptedAnswer: { '@type': 'Answer', text: 'A test.' },
        },
      ],
    };
    const html = await container.renderToString(JsonLd, { props: { schema } });

    const parsed = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)![1]);
    expect(parsed.mainEntity).toHaveLength(1);
    expect(parsed.mainEntity[0].name).toBe('What is this?');
  });

  test('handles array schema input', async () => {
    const container = await AstroContainer.create();
    const schema = [
      { '@type': 'Event', name: 'Event 1' },
      { '@type': 'Event', name: 'Event 2' },
    ];
    const html = await container.renderToString(JsonLd, { props: { schema } });

    const parsed = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)![1]);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]['@context']).toBe('https://schema.org');
    expect(parsed[1]['@context']).toBe('https://schema.org');
  });
});

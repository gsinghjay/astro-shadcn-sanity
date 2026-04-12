import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import AuthorCard from '../AuthorCard.astro';
import { authorFull, authorMinimal } from './__fixtures__/authors';

describe('AuthorCard', () => {
  test('renders author name linked to detail page', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AuthorCard, {
      props: { author: authorFull },
    });

    expect(html).toContain('Jane Doe');
    expect(html).toContain('href="/authors/jane-doe"');
  });

  test('renders author image with lazy loading and LQIP', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AuthorCard, {
      props: { author: authorFull },
    });

    expect(html).toContain('loading="lazy"');
    expect(html).toContain('width="400"');
    expect(html).toContain('height="400"');
    expect(html).toContain('alt="Jane Doe headshot"');
    expect(html).toContain('background-image');
  });

  test('renders role when present', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AuthorCard, {
      props: { author: authorFull },
    });

    expect(html).toContain('Senior Developer');
  });

  test('renders bio excerpt with line-clamp', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AuthorCard, {
      props: { author: authorFull },
    });

    expect(html).toContain('10 years of experience');
    expect(html).toContain('line-clamp-3');
  });

  test('renders GTM data attributes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AuthorCard, {
      props: { author: authorFull },
    });

    expect(html).toContain('data-gtm-category="author"');
    expect(html).toContain('data-gtm-action="detail"');
    expect(html).toContain('data-gtm-label="Jane Doe"');
  });

  test('renders initials fallback when no image', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AuthorCard, {
      props: { author: authorMinimal },
    });

    // Should show initials "JS" for "John Smith"
    expect(html).toContain('JS');
    expect(html).not.toContain('loading="lazy"');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AuthorCard, {
      props: { author: authorMinimal },
    });

    expect(html).toBeDefined();
    expect(html).toContain('John Smith');
    expect(html).toContain('href="/authors/john-smith"');
    // No role, no bio — should not crash
  });

  test('renders square aspect ratio container', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AuthorCard, {
      props: { author: authorFull },
    });

    expect(html).toContain('aspect-square');
  });
});

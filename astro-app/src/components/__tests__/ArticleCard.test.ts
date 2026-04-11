import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import ArticleCard from '../ArticleCard.astro';
import { articleFull, articleMinimal, articleNoAuthorSlug } from './__fixtures__/articles';

describe('ArticleCard', () => {
  test('renders title linked to article detail page', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCard, {
      props: { article: articleFull },
    });

    expect(html).toContain('Getting Started with Astro');
    expect(html).toContain('href="/articles/getting-started-with-astro"');
  });

  test('renders featured image with lazy loading and LQIP', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCard, {
      props: { article: articleFull },
    });

    expect(html).toContain('loading="lazy"');
    expect(html).toContain('width="640"');
    expect(html).toContain('height="360"');
    expect(html).toContain('alt="Astro framework logo"');
    expect(html).toContain('background-image');
  });

  test('renders excerpt', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCard, {
      props: { article: articleFull },
    });

    expect(html).toContain('Learn how to build lightning-fast websites');
  });

  test('renders author byline with link when slug present', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCard, {
      props: { article: articleFull },
    });

    expect(html).toContain('Jane Doe');
    expect(html).toContain('href="/authors/jane-doe"');
  });

  test('renders author name without link when slug absent', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCard, {
      props: { article: articleNoAuthorSlug },
    });

    expect(html).toContain('Anonymous Writer');
    expect(html).not.toContain('href="/authors/');
  });

  test('renders formatted date', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCard, {
      props: { article: articleFull },
    });

    expect(html).toContain('April');
    expect(html).toContain('2026');
    expect(html).toContain('datetime="2026-04-10T12:00:00Z"');
  });

  test('renders category badge', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCard, {
      props: { article: articleFull },
    });

    expect(html).toContain('Tutorials');
  });

  test('renders GTM data attributes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCard, {
      props: { article: articleFull },
    });

    expect(html).toContain('data-gtm-category="article"');
    expect(html).toContain('data-gtm-action="detail"');
  });

  test('handles minimal data without crashing', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArticleCard, {
      props: { article: articleMinimal },
    });

    expect(html).toBeDefined();
    expect(html).toContain('Minimal Article');
    // No image, no author, no date, no category — should not crash
    expect(html).not.toContain('loading="lazy"');
    expect(html).not.toContain('href="/authors/');
  });
});

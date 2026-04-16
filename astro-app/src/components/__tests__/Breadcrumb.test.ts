import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Breadcrumb from '../Breadcrumb.astro';
import { buildBreadcrumbJsonLd } from '@/lib/breadcrumb-jsonld';

describe('Breadcrumb', () => {
  it('renders a nav element with aria-label "Breadcrumb"', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Breadcrumb, {
      props: {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Current' },
        ],
      },
    });

    expect(html).toContain('<nav');
    expect(html).toContain('aria-label="Breadcrumb"');
  });

  it('renders an ordered list', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Breadcrumb, {
      props: {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Sponsors', href: '/sponsors' },
          { label: 'Acme Corp' },
        ],
      },
    });

    expect(html).toContain('<ol');
    expect(html).toContain('<li');
  });

  it('renders linked items with href', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Breadcrumb, {
      props: {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Sponsors', href: '/sponsors' },
          { label: 'Acme Corp' },
        ],
      },
    });

    expect(html).toContain('href="/"');
    expect(html).toContain('Home');
    expect(html).toContain('href="/sponsors"');
    expect(html).toContain('Sponsors');
  });

  it('renders the last item as current page without a link', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Breadcrumb, {
      props: {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Acme Corp' },
        ],
      },
    });

    expect(html).toContain('aria-current="page"');
    expect(html).toContain('Acme Corp');
    expect(html).not.toContain('href="Acme Corp"');
  });

  it('renders separators with aria-hidden', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Breadcrumb, {
      props: {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Sponsors', href: '/sponsors' },
          { label: 'Detail' },
        ],
      },
    });

    expect(html).toContain('aria-hidden="true"');
  });

  it('does not render a separator before the first item', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Breadcrumb, {
      props: {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Current' },
        ],
      },
    });

    const separatorCount = (html.match(/aria-hidden="true"/g) || []).length;
    expect(separatorCount).toBe(1);
  });

  it('does NOT emit JSON-LD in its own HTML output', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Breadcrumb, {
      props: {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Sponsors', href: '/sponsors' },
          { label: 'Acme Corp' },
        ],
        baseUrl: 'https://example.com',
        currentPath: '/sponsors/acme',
      },
    });

    expect(html).not.toContain('application/ld+json');
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('returns BreadcrumbList with absolute URLs', () => {
    const result = buildBreadcrumbJsonLd(
      [
        { label: 'Home', href: '/' },
        { label: 'Sponsors', href: '/sponsors' },
        { label: 'Acme Corp' },
      ],
      'https://example.com',
      '/sponsors/acme',
    );

    expect(result['@type']).toBe('BreadcrumbList');
    const items = result.itemListElement as Array<Record<string, unknown>>;
    expect(items[0].item).toBe('https://example.com/');
    expect(items[1].item).toBe('https://example.com/sponsors');
  });

  it('includes @id with #breadcrumb fragment', () => {
    const result = buildBreadcrumbJsonLd(
      [{ label: 'Home', href: '/' }, { label: 'Page' }],
      'https://example.com',
      '/some-page',
    );

    expect(result['@id']).toBe('https://example.com/some-page#breadcrumb');
  });

  it('omits @id when baseUrl is empty', () => {
    const result = buildBreadcrumbJsonLd(
      [{ label: 'Home', href: '/' }, { label: 'Page' }],
      '',
      '/some-page',
    );

    expect(result['@id']).toBeUndefined();
  });

  it('omits @id when currentPath is empty', () => {
    const result = buildBreadcrumbJsonLd(
      [{ label: 'Home', href: '/' }, { label: 'Page' }],
      'https://example.com',
      '',
    );

    expect(result['@id']).toBeUndefined();
  });

  it('uses 1-based positions', () => {
    const result = buildBreadcrumbJsonLd(
      [
        { label: 'Home', href: '/' },
        { label: 'Articles', href: '/articles' },
        { label: 'My Article' },
      ],
      'https://example.com',
      '/articles/my-article',
    );

    const items = result.itemListElement as Array<Record<string, unknown>>;
    expect(items[0].position).toBe(1);
    expect(items[1].position).toBe(2);
    expect(items[2].position).toBe(3);
  });

  it('last item omits item URL per Schema.org spec', () => {
    const result = buildBreadcrumbJsonLd(
      [
        { label: 'Home', href: '/' },
        { label: 'Current Page' },
      ],
      'https://example.com',
      '/current',
    );

    const items = result.itemListElement as Array<Record<string, unknown>>;
    expect(items[1].item).toBeUndefined();
    expect(items[1].name).toBe('Current Page');
  });

  it('does not include @context (for @graph consumption)', () => {
    const result = buildBreadcrumbJsonLd(
      [{ label: 'Home', href: '/' }, { label: 'Page' }],
      'https://example.com',
      '/page',
    );

    expect(result).not.toHaveProperty('@context');
  });

  it('stegaClean()s labels', () => {
    const result = buildBreadcrumbJsonLd(
      [{ label: 'Home', href: '/' }, { label: 'Page' }],
      'https://example.com',
      '/page',
    );

    const items = result.itemListElement as Array<Record<string, unknown>>;
    items.forEach(item => {
      expect(typeof item.name).toBe('string');
      expect(item.name).not.toMatch(/[\u200B-\u200D\uFEFF]/);
    });
  });
});

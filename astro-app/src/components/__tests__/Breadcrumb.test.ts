import { describe, it, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import Breadcrumb from '../Breadcrumb.astro';

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
    // Last item should NOT be a link
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

    // Count aria-hidden separators — should be exactly 1 (between Home and Current)
    const separatorCount = (html.match(/aria-hidden="true"/g) || []).length;
    expect(separatorCount).toBe(1);
  });

  it('renders JSON-LD BreadcrumbList structured data', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Breadcrumb, {
      props: {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Sponsors', href: '/sponsors' },
          { label: 'Acme Corp' },
        ],
        baseUrl: 'https://example.com',
      },
    });

    expect(html).toContain('application/ld+json');
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(jsonLdMatch).not.toBeNull();

    const jsonLd = JSON.parse(jsonLdMatch![1]);
    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('BreadcrumbList');
    expect(jsonLd.itemListElement).toHaveLength(3);

    expect(jsonLd.itemListElement[0].position).toBe(1);
    expect(jsonLd.itemListElement[0].name).toBe('Home');
    expect(jsonLd.itemListElement[0].item).toBe('https://example.com/');

    expect(jsonLd.itemListElement[1].position).toBe(2);
    expect(jsonLd.itemListElement[1].name).toBe('Sponsors');
    expect(jsonLd.itemListElement[1].item).toBe('https://example.com/sponsors');

    // Last item (current page) has no item URL per Schema.org spec
    expect(jsonLd.itemListElement[2].position).toBe(3);
    expect(jsonLd.itemListElement[2].name).toBe('Acme Corp');
    expect(jsonLd.itemListElement[2].item).toBeUndefined();
  });

  it('renders JSON-LD with relative URLs when baseUrl is omitted', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Breadcrumb, {
      props: {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Current' },
        ],
      },
    });

    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    expect(jsonLdMatch).not.toBeNull();

    const jsonLd = JSON.parse(jsonLdMatch![1]);
    expect(jsonLd.itemListElement[0].item).toBe('/');
  });
});

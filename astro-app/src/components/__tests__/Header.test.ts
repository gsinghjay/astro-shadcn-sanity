import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Header from '../Header.astro';

// Mock getSiteSettings to avoid Sanity API dependency
vi.mock('@/lib/sanity', () => ({
  getSiteSettings: vi.fn().mockResolvedValue({
    siteName: 'YWCC Industry Capstone',
    siteDescription: 'Test description',
    logo: { asset: { _id: 'img-1', url: '/logos/njit-logo-plain.svg', metadata: null }, alt: 'NJIT' },
    logoLight: null,
    navigationItems: [
      { _key: 'nav-1', label: 'About', href: '/about' },
      { _key: 'nav-2', label: 'Projects', href: '/projects' },
    ],
    ctaButton: { _key: 'cta-1', text: 'Become a Sponsor', url: '/contact' },
    footerContent: null,
    programLinks: null,
    resourceLinks: null,
    contactInfo: null,
    footerLinks: null,
    socialLinks: null,
  }),
}));

describe('Header', () => {
  test('renders GTM navigation attributes on desktop nav links', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header);

    expect(html).toContain('data-gtm-category="navigation"');
    expect(html).toContain('data-gtm-label="About"');
    expect(html).toContain('data-gtm-label="Projects"');
  });

  test('renders GTM navigation attribute on header CTA', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Header);

    expect(html).toContain('data-gtm-label="header-cta"');
  });
});

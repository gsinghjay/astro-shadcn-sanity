import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { vercelStegaEncode } from '@vercel/stega';
import { getSiteSettings } from '@/lib/sanity';
import Header from '../Header.astro';

const stegaSuffix = vercelStegaEncode({ origin: 'sanity.io', href: '/studio' });

const baseMockSettings = {
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
};

// Mock getSiteSettings to avoid Sanity API dependency
// vi.mock is hoisted — cannot reference baseMockSettings directly
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

  describe('stegaClean for Presentation Tool navigation (Story 7.17)', () => {
    test('strips stega encoding from desktop nav labels', async () => {
      vi.mocked(getSiteSettings).mockResolvedValueOnce({
        ...baseMockSettings,
        navigationItems: [
          { _key: 'nav-1', label: `About${stegaSuffix}`, href: '/about' },
          { _key: 'nav-2', label: `Projects${stegaSuffix}`, href: '/projects' },
        ],
      });

      const container = await AstroContainer.create();
      const html = await container.renderToString(Header);

      // Labels should be clean — no invisible stega characters in rendered text
      expect(html).not.toContain(stegaSuffix);
      // Clean labels should still appear
      expect(html).toContain('About');
      expect(html).toContain('Projects');
    });

    test('strips stega encoding from desktop sub-navigation labels', async () => {
      vi.mocked(getSiteSettings).mockResolvedValueOnce({
        ...baseMockSettings,
        navigationItems: [
          {
            _key: 'nav-1',
            label: `About${stegaSuffix}`,
            href: '/about',
            children: [
              { _key: 'child-1', label: `Team${stegaSuffix}`, href: '/about/team' },
              { _key: 'child-2', label: `Mission${stegaSuffix}`, href: '/about/mission' },
            ],
          },
        ],
      });

      const container = await AstroContainer.create();
      const html = await container.renderToString(Header);

      expect(html).not.toContain(stegaSuffix);
      expect(html).toContain('Team');
      expect(html).toContain('Mission');
    });

    test('strips stega encoding from mobile navigation labels', async () => {
      vi.mocked(getSiteSettings).mockResolvedValueOnce({
        ...baseMockSettings,
        navigationItems: [
          { _key: 'nav-1', label: `About${stegaSuffix}`, href: '/about' },
          {
            _key: 'nav-2',
            label: `Programs${stegaSuffix}`,
            href: '/programs',
            children: [
              { _key: 'child-1', label: `Research${stegaSuffix}`, href: '/programs/research' },
            ],
          },
        ],
      });

      const container = await AstroContainer.create();
      const html = await container.renderToString(Header);

      // All stega encoding should be stripped from both desktop and mobile nav
      expect(html).not.toContain(stegaSuffix);
      expect(html).toContain('About');
      expect(html).toContain('Programs');
      expect(html).toContain('Research');
    });

    test('strips stega encoding from CTA button text', async () => {
      vi.mocked(getSiteSettings).mockResolvedValueOnce({
        ...baseMockSettings,
        ctaButton: { _key: 'cta-1', text: `Become a Sponsor${stegaSuffix}`, url: '/contact' },
      });

      const container = await AstroContainer.create();
      const html = await container.renderToString(Header);

      expect(html).not.toContain(stegaSuffix);
      expect(html).toContain('Become a Sponsor');
    });
  });
});

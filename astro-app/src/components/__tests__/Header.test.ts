import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { vercelStegaEncode } from '@vercel/stega';
import { getSiteSettings } from '@/lib/sanity';
import Header from '../Header.astro';

const stegaSuffix = vercelStegaEncode({ origin: 'sanity.io', href: '/studio' });

const mockGetSiteSettings = vi.hoisted(() => vi.fn());

vi.mock('@/lib/sanity', () => ({
  getSiteSettings: mockGetSiteSettings,
}));

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
  aiSearch: {
    enabled: false,
    searchModalEnabled: false,
    apiUrl: '',
    placeholder: 'Search the site…',
    theme: 'auto',
    hideBranding: false,
    openByDefault: false,
  },
};

function makeSiteSettings(overrides: Record<string, unknown> = {}) {
  return {
    ...baseMockSettings,
    ...overrides,
    navigationItems: (overrides.navigationItems as typeof baseMockSettings.navigationItems) ?? baseMockSettings.navigationItems,
    ctaButton: (overrides.ctaButton as typeof baseMockSettings.ctaButton) ?? baseMockSettings.ctaButton,
    aiSearch: {
      ...baseMockSettings.aiSearch,
      ...(overrides.aiSearch as typeof baseMockSettings.aiSearch),
    },
  };
}

beforeEach(() => {
  mockGetSiteSettings.mockReset();
  mockGetSiteSettings.mockResolvedValue(makeSiteSettings());
});

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

  test('renders desktop and mobile search triggers when searchModalEnabled is true', async () => {
    mockGetSiteSettings.mockResolvedValueOnce(
      makeSiteSettings({
        aiSearch: {
          enabled: false,
          searchModalEnabled: true,
          apiUrl: 'https://worker.dev',
          placeholder: 'Search the site…',
          theme: 'auto',
          hideBranding: false,
          openByDefault: false,
        },
      }),
    );

    const container = await AstroContainer.create();
    const html = await container.renderToString(Header);

    expect(html).toContain('data-search-trigger');
    expect(html).toContain('data-gtm-category="site-search"');
    expect(html).toContain('data-gtm-label="nav-desktop"');
    expect(html).toContain('data-gtm-label="nav-mobile"');
    expect(html).toContain('<search-modal-snippet');

    const triggerCount = (html.match(/data-search-trigger/g) || []).length;
    expect(triggerCount).toBe(2);

    const snippetCount = (html.match(/<search-modal-snippet/g) || []).length;
    expect(snippetCount).toBe(1);
  });

  test('does NOT render search triggers when searchModalEnabled is false', async () => {
    mockGetSiteSettings.mockResolvedValueOnce(
      makeSiteSettings({
        aiSearch: {
          enabled: false,
          searchModalEnabled: false,
          apiUrl: 'https://worker.dev',
          placeholder: 'Search the site…',
          theme: 'auto',
          hideBranding: false,
          openByDefault: false,
        },
      }),
    );

    const container = await AstroContainer.create();
    const html = await container.renderToString(Header);

    expect(html).not.toContain('data-search-trigger');
    expect(html).not.toContain('<search-modal-snippet');
  });

  test('does NOT render search triggers when apiUrl is empty', async () => {
    mockGetSiteSettings.mockResolvedValueOnce(
      makeSiteSettings({
        aiSearch: {
          enabled: false,
          searchModalEnabled: true,
          apiUrl: '',
          placeholder: 'Search the site…',
          theme: 'auto',
          hideBranding: false,
          openByDefault: false,
        },
      }),
    );

    const container = await AstroContainer.create();
    const html = await container.renderToString(Header);

    expect(html).not.toContain('data-search-trigger');
    expect(html).not.toContain('<search-modal-snippet');
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

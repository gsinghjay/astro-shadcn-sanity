import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import CookieConsent from '../CookieConsent.astro';

describe('CookieConsent', () => {
  test('renders banner with Accept and Reject buttons when gtmId provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CookieConsent, {
      props: { gtmId: 'GTM-TEST123' },
    });

    expect(html).toContain('Accept');
    expect(html).toContain('Reject');
  });

  test('renders with correct ARIA attributes', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CookieConsent, {
      props: { gtmId: 'GTM-TEST123' },
    });

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-label="Cookie consent"');
    expect(html).toContain('aria-live="polite"');
  });

  test('renders with data-cookie-consent-banner attribute', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CookieConsent, {
      props: { gtmId: 'GTM-TEST123' },
    });

    expect(html).toContain('data-cookie-consent-banner');
  });

  test('renders data-cookie-accept and data-cookie-reject on buttons', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CookieConsent, {
      props: { gtmId: 'GTM-TEST123' },
    });

    expect(html).toContain('data-cookie-accept');
    expect(html).toContain('data-cookie-reject');
  });

  test('passes gtmId to banner via data-gtm-id attribute', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CookieConsent, {
      props: { gtmId: 'GTM-TEST123' },
    });

    expect(html).toContain('data-gtm-id="GTM-TEST123"');
  });

  test('renders nothing when gtmId is not provided', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CookieConsent, {
      props: {},
    });

    expect(html).not.toContain('data-cookie-consent-banner');
    expect(html).not.toContain('Accept');
  });

  test('renders with hidden state by default', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CookieConsent, {
      props: { gtmId: 'GTM-TEST123' },
    });

    expect(html).toContain('data-state="hidden"');
  });

  test('renders with inert attribute when hidden by default', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(CookieConsent, {
      props: { gtmId: 'GTM-TEST123' },
    });

    expect(html).toContain('inert');
  });
});

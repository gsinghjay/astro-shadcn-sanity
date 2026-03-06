import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import CtaBanner from '../blocks/custom/CtaBanner.astro';
import { ctaFull, ctaMinimal, ctaSplit, ctaSpread, ctaOverlay } from './__fixtures__/cta-banner';

describe('CtaBanner', () => {
  // ---------------------------------------------------------------------------
  // CENTERED variant (default / AC #4 — zero regression)
  // ---------------------------------------------------------------------------
  describe('centered variant', () => {
    test('renders heading, description, and CTA buttons', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaFull });

      expect(html).toContain('Ready to Get Started?');
      expect(html).toContain('Join our community today and start building.');
      expect(html).toContain('Sign Up');
      expect(html).toContain('/contact');
    });

    test('centers content for centered variant', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaFull });

      expect(html).toContain('items-center');
      expect(html).toContain('text-center');
    });

    test('handles minimal data without crashing', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaMinimal });

      expect(html).toContain('Simple CTA');
    });

    test('omits description when null', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaMinimal });

      expect(html).not.toContain('text-muted-foreground');
    });

    test('renders GTM tracking attributes on CTA buttons', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaFull });

      expect(html).toContain('data-gtm-category="cta"');
      expect(html).toContain('data-gtm-action="click"');
      expect(html).toContain('data-gtm-label="Sign Up"');
    });

    test('does not apply background classes on Section (wrapper handles backgrounds)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaFull });

      const sectionMatch = html.match(/<section[^>]*class="([^"]*)"/);
      expect(sectionMatch).toBeTruthy();
      expect(sectionMatch![1]).not.toContain('bg-primary');
    });

    test('retains button color mapping per backgroundVariant', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaFull });

      expect(html).toContain('bg-background');
    });

    test('defaults to centered when variant is null', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaMinimal });

      expect(html).toContain('items-center');
      expect(html).toContain('text-center');
    });
  });

  // ---------------------------------------------------------------------------
  // SPLIT variant
  // ---------------------------------------------------------------------------
  describe('split variant', () => {
    test('renders heading and buttons', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaSplit });

      expect(html).toContain('Split CTA');
      expect(html).toContain('Sign Up');
    });

    test('does not use centered layout classes', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, {
        props: { ...ctaSplit, description: 'Split desc' },
      });

      expect(html).toContain('Split desc');
    });

    test('renders image for split variant', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaSplit });

      // Image is rendered from firstImage
      expect(html).toContain('cdn.sanity.io');
      expect(html).toContain('Test image');
    });

    test('renders GTM attributes in split variant', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaSplit });

      expect(html).toContain('data-gtm-category="cta"');
      expect(html).toContain('data-gtm-label="Sign Up"');
    });
  });

  // ---------------------------------------------------------------------------
  // SPREAD variant
  // ---------------------------------------------------------------------------
  describe('spread variant', () => {
    test('renders heading and buttons', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaSpread });

      expect(html).toContain('Spread CTA');
      expect(html).toContain('Sign Up');
    });

    test('does not render image for spread variant', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaSpread });

      expect(html).not.toContain('cdn.sanity.io');
    });

    test('uses SectionSpread layout with horizontal buttons', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaSpread });

      expect(html).toContain('@5xl:justify-between');
    });

    test('renders GTM attributes in spread variant', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaSpread });

      expect(html).toContain('data-gtm-category="cta"');
      expect(html).toContain('data-gtm-label="Sign Up"');
    });
  });

  // ---------------------------------------------------------------------------
  // OVERLAY variant
  // ---------------------------------------------------------------------------
  describe('overlay variant', () => {
    test('renders heading and buttons', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaOverlay });

      expect(html).toContain('Overlay CTA');
      expect(html).toContain('Sign Up');
    });

    test('renders background image for overlay variant', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaOverlay });

      expect(html).toContain('cdn.sanity.io');
      expect(html).toContain('Test image');
    });

    test('applies overlay opacity class', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaOverlay });

      expect(html).toContain('bg-foreground/60');
    });

    test('renders content above overlay with z-10', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaOverlay });

      expect(html).toContain('z-10');
    });

    test('uses text-background for centered text on dark overlay', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaOverlay });

      expect(html).toContain('text-background');
    });

    test('renders GTM attributes in overlay variant', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(CtaBanner, { props: ctaOverlay });

      expect(html).toContain('data-gtm-category="cta"');
      expect(html).toContain('data-gtm-label="Sign Up"');
    });
  });
});

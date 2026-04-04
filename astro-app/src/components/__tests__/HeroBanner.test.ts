import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import HeroBanner from '../blocks/custom/HeroBanner.astro';
import {
  heroFull,
  heroMinimal,
  heroSplit,
  heroSplitAsymmetric,
  heroOverlay,
  heroSpread,
} from './__fixtures__/hero-banner';

describe('HeroBanner', () => {
  // ─── Centered variant (default) ────────────────────────────────────
  describe('centered variant', () => {
    test('renders heading and subheading', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroFull,
      });

      expect(html).toContain('Welcome to YWCC');
      expect(html).toContain('Building community through technology');
    });

    test('renders CTA buttons with links', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroFull,
      });

      expect(html).toContain('Get Started');
      expect(html).toContain('/about');
      expect(html).toContain('Learn More');
      expect(html).toContain('/projects');
    });

    test('renders background images in carousel', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroFull,
      });

      expect(html).toContain('data-carousel');
      expect(html).toContain('Test background');
    });

    test('first slide has fetchpriority="high" and loading="eager"', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroFull,
      });

      expect(html).toContain('fetchpriority="high"');
      expect(html).toContain('loading="eager"');
    });

    test('carousel images use urlFor() with dimensions and auto=format', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroFull,
      });

      expect(html).toContain('auto=format');
      expect(html).toContain('w=1920');
      expect(html).toContain('h=1080');
    });

    test('renders LQIP blur placeholder on slides', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroFull,
      });

      expect(html).toContain('data:image/jpeg;base64,/9j/2wBDAAYEBQY');
      expect(html).toContain('background-image');
      expect(html).toContain('background-size: cover');
    });

    test('subsequent slides have loading="lazy"', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroFull,
      });

      expect(html).toContain('loading="lazy"');
    });

    test('renders solid card (no glass-morphism)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroFull,
      });

      expect(html).not.toContain('backdrop-blur');
      expect(html).not.toContain('bg-foreground/80');
    });

    test('heading caps at text-6xl (no text-7xl or text-8xl)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroFull,
      });

      expect(html).not.toContain('text-7xl');
      expect(html).not.toContain('text-8xl');
      expect(html).toContain('text-6xl');
    });

    test('renders GTM tracking attributes on CTA buttons', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroFull,
      });

      expect(html).toContain('data-gtm-category="cta"');
      expect(html).toContain('data-gtm-action="click"');
      expect(html).toContain('data-gtm-label="Get Started"');
      expect(html).toContain('data-gtm-label="Learn More"');
    });
  });

  // ─── Minimal / null variant defaults to centered ───────────────────
  describe('null variant defaults to centered', () => {
    test('handles minimal data without crashing', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroMinimal,
      });

      expect(html).toContain('Minimal Hero');
      expect(html).not.toContain('data-carousel');
    });

    test('omits subheading when null', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroMinimal,
      });

      expect(html).not.toContain('leading-relaxed');
    });

    test('omits CTA section when no buttons', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroMinimal,
      });

      expect(html).not.toContain('Get Started');
    });
  });

  // ─── Split variant ─────────────────────────────────────────────────
  describe('split variant', () => {
    test('renders heading and subheading', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSplit,
      });

      expect(html).toContain('Split Hero');
      expect(html).toContain('Side by side layout');
    });

    test('uses SectionSplit layout', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSplit,
      });

      expect(html).toContain('data-slot="section-split"');
    });

    test('renders first image only (no carousel)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSplit,
      });

      expect(html).not.toContain('data-carousel');
      expect(html).toContain('data-slot="section-media"');
      expect(html).toContain('Test background');
      expect(html).not.toContain('Second slide');
    });

    test('heading caps at text-6xl (no text-7xl or text-8xl)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSplit,
      });

      expect(html).toContain('text-6xl');
      expect(html).not.toContain('text-7xl');
      expect(html).not.toContain('text-8xl');
    });

    test('renders CTA buttons', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSplit,
      });

      expect(html).toContain('Get Started');
      expect(html).toContain('Learn More');
    });
  });

  // ─── Split-asymmetric variant ──────────────────────────────────────
  describe('split-asymmetric variant', () => {
    test('renders heading and subheading', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSplitAsymmetric,
      });

      expect(html).toContain('Asymmetric Hero');
      expect(html).toContain('Large image layout');
    });

    test('uses SectionSplit with asymmetric grid', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSplitAsymmetric,
      });

      expect(html).toContain('data-slot="section-split"');
      expect(html).toContain('grid-cols-[2fr_3fr]');
    });

    test('renders first image only (no carousel)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSplitAsymmetric,
      });

      expect(html).not.toContain('data-carousel');
      expect(html).toContain('data-slot="section-media"');
    });
  });

  // ─── Overlay variant ───────────────────────────────────────────────
  describe('overlay variant', () => {
    test('renders heading and subheading', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroOverlay,
      });

      expect(html).toContain('Overlay Hero');
      expect(html).toContain('Text over background');
    });

    test('renders carousel (same as centered)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroOverlay,
      });

      expect(html).toContain('data-carousel');
    });

    test('does NOT render glass card (no backdrop-blur)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroOverlay,
      });

      expect(html).not.toContain('backdrop-blur-sm');
      expect(html).not.toContain('bg-foreground/80');
    });

    test('heading caps at text-6xl (no text-7xl or text-8xl)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroOverlay,
      });

      expect(html).toContain('text-6xl');
      expect(html).not.toContain('text-7xl');
      expect(html).not.toContain('text-8xl');
    });

    test('renders CTA buttons', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroOverlay,
      });

      expect(html).toContain('Get Started');
      expect(html).toContain('Learn More');
    });
  });

  // ─── Responsive srcset ──────────────────────────────────────────────
  describe('responsive srcset', () => {
    test('centered variant includes srcset with 4 widths', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroFull,
      });

      expect(html).toContain('srcset="');
      expect(html).toContain('640w');
      expect(html).toContain('1024w');
      expect(html).toContain('1440w');
      expect(html).toContain('1920w');
      expect(html).toContain('sizes="100vw"');
    });

    test('split variant uses smaller widths (480, 640, 960)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSplit,
      });

      expect(html).toContain('480w');
      expect(html).toContain('640w');
      expect(html).toContain('960w');
      expect(html).not.toContain('1920w');
    });

    test('split-asymmetric variant uses widths (640, 960, 1200)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSplitAsymmetric,
      });

      expect(html).toContain('640w');
      expect(html).toContain('960w');
      expect(html).toContain('1200w');
      expect(html).not.toContain('1920w');
    });

    test('spread variant includes srcset with full widths', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSpread,
      });

      expect(html).toContain('srcset="');
      expect(html).toContain('640w');
      expect(html).toContain('1024w');
      expect(html).toContain('1920w');
      expect(html).toContain('sizes="100vw"');
    });
  });

  // ─── Background variant handling ────────────────────────────────────
  describe('background variants', () => {
    test('hatched variant applies bg-hatched on Section', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: { ...heroFull, backgroundVariant: 'hatched' },
      });

      expect(html).toContain('bg-hatched');
      expect(html).toContain('text-background');
    });

    test('hatched-light variant applies bg-hatched-light on Section', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: { ...heroFull, backgroundVariant: 'hatched-light' },
      });

      expect(html).toContain('bg-hatched-light');
      expect(html).toContain('text-foreground');
    });

    test('white variant does not apply dark background on Section', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: { ...heroMinimal, backgroundVariant: 'white' },
      });

      const sectionMatch = html.match(/<section[^>]*class="([^"]*)"/);
      expect(sectionMatch).toBeTruthy();
      expect(sectionMatch![1]).not.toContain('bg-foreground');
    });
  });

  // ─── Spread variant ────────────────────────────────────────────────
  describe('spread variant', () => {
    test('renders heading and subheading', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSpread,
      });

      expect(html).toContain('Spread Hero');
      expect(html).toContain('Content spread layout');
    });

    test('does NOT render carousel', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSpread,
      });

      expect(html).not.toContain('data-carousel');
    });

    test('renders first image as background', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSpread,
      });

      expect(html).toContain('w-full h-full object-cover');
      expect(html).toContain('bg-foreground/60');
    });

    test('heading caps at text-6xl (no text-7xl or text-8xl)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSpread,
      });

      expect(html).toContain('text-6xl');
      expect(html).not.toContain('text-7xl');
      expect(html).not.toContain('text-8xl');
    });

    test('renders CTA buttons', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(HeroBanner, {
        props: heroSpread,
      });

      expect(html).toContain('Get Started');
      expect(html).toContain('Learn More');
    });
  });
});

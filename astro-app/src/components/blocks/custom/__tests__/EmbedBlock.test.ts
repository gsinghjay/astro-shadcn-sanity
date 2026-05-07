import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect } from 'vitest';
import EmbedBlock from '../EmbedBlock.astro';

const baseProps = {
  _type: 'embedBlock' as const,
  _key: 'test-embed',
  heading: 'Sample Embed',
  caption: null,
  embedUrl: null,
  rawEmbedCode: null,
  variant: 'default' as const,
};

const VARIANTS = ['default', 'contained', 'full-width'] as const;

describe('EmbedBlock — sandbox semantics', () => {
  describe.each(VARIANTS)('variant=%s', (variant) => {
    test('rawEmbedCode renders only inside <iframe srcdoc> (sentinel never appears at top level)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(EmbedBlock, {
        props: {
          ...baseProps,
          variant,
          rawEmbedCode: '<div data-marker="sandbox-probe"><script>alert(1)</script></div>',
        },
      });

      expect(html).toContain('<iframe');
      expect(html).toContain('srcdoc=');

      // The sentinel must appear *only* inside srcdoc="…", entity-encoded.
      // Stripping the srcdoc attribute and asserting the sentinel is gone proves
      // the raw HTML never escaped to the parent document.
      const stripped = html.replace(/srcdoc="[^"]*"/g, 'srcdoc="…"');
      expect(stripped).not.toContain('data-marker="sandbox-probe"');
      expect(stripped).not.toContain('<Fragment');

      // The encoded form should appear inside the (preserved) original html.
      expect(html).toMatch(/srcdoc="[^"]*data-marker=&#34;sandbox-probe&#34;/);
    });

    test('sandbox flags = "allow-scripts allow-popups" (no allow-same-origin, no allow-popups-to-escape-sandbox)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(EmbedBlock, {
        props: {
          ...baseProps,
          variant,
          embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
      });

      const sandboxMatch = html.match(/sandbox="([^"]+)"/);
      expect(sandboxMatch).not.toBeNull();
      const value = sandboxMatch?.[1] ?? '';
      expect(value).not.toContain('allow-same-origin');
      expect(value).not.toContain('allow-popups-to-escape-sandbox');
      expect(value).toContain('allow-scripts');
      expect(value).toContain('allow-popups');
    });

    test('any https embedUrl renders iframe with that src (allow-list dropped)', async () => {
      const container = await AstroContainer.create();
      const url = 'https://codepen.io/team/codepen/embed/PNaGbb';
      const html = await container.renderToString(EmbedBlock, {
        props: { ...baseProps, variant, embedUrl: url },
      });

      expect(html).toMatch(/<iframe[^>]*\bsrc="https:\/\/codepen\.io\/team\/codepen\/embed\/PNaGbb"/);
      expect(html).not.toContain('No embed URL provided');
      expect(html).not.toContain('Invalid embed URL');
    });

    test('non-https embedUrl renders the "invalid" placeholder, no iframe src', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(EmbedBlock, {
        props: {
          ...baseProps,
          variant,
          embedUrl: 'http://evil.example/page',
        },
      });

      expect(html).not.toMatch(/<iframe[^>]*\bsrc=/);
      expect(html).toContain('Invalid embed URL');
    });

    test('embedUrl with userinfo renders the "invalid" placeholder', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(EmbedBlock, {
        props: {
          ...baseProps,
          variant,
          embedUrl: 'https://user:pass@www.youtube.com/embed/x',
        },
      });

      expect(html).not.toMatch(/<iframe[^>]*\bsrc=/);
      expect(html).toContain('Invalid embed URL');
    });

    test('empty embedUrl + empty rawEmbedCode renders the "not provided" placeholder', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(EmbedBlock, {
        props: { ...baseProps, variant, embedUrl: '', rawEmbedCode: '' },
      });

      expect(html).not.toContain('<iframe');
      expect(html).toContain('No embed URL provided');
    });

    test('whitespace-only rawEmbedCode falls through to placeholder (no empty srcdoc iframe)', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(EmbedBlock, {
        props: { ...baseProps, variant, rawEmbedCode: '   \n\t  ' },
      });

      expect(html).not.toContain('<iframe');
      expect(html).toContain('No embed URL provided');
    });

    test('whitespace-only heading falls back to "Embedded content" iframe title', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(EmbedBlock, {
        props: {
          ...baseProps,
          variant,
          heading: '   ',
          caption: null,
          embedUrl: 'https://www.youtube.com/embed/x',
        },
      });

      expect(html).toContain('title="Embedded content"');
    });

    test('rawEmbedCode takes precedence over embedUrl', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(EmbedBlock, {
        props: {
          ...baseProps,
          variant,
          rawEmbedCode: '<div data-marker="raw-wins">hello</div>',
          embedUrl: 'https://www.youtube.com/embed/x',
        },
      });

      expect(html).toContain('srcdoc=');
      expect(html).toMatch(/srcdoc="[^"]*data-marker=&#34;raw-wins&#34;/);
      expect(html).not.toMatch(/<iframe[^>]*\bsrc="https:\/\/www\.youtube\.com\/embed\/x"/);
    });
  });
});

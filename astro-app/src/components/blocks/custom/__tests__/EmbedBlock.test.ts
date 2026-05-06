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

describe('EmbedBlock — sandbox + allow-list', () => {
  describe.each(VARIANTS)('variant=%s', (variant) => {
    test('rawEmbedCode renders inside <iframe srcdoc>, never as a top-level script', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(EmbedBlock, {
        props: {
          ...baseProps,
          variant,
          rawEmbedCode: '<script>alert(1)</script>',
        },
      });

      expect(html).toContain('<iframe');
      expect(html).toContain('srcdoc=');
      const stripped = html.replace(/srcdoc="[^"]*"/g, 'srcdoc="..."');
      expect(stripped).not.toMatch(/<script>alert\(1\)<\/script>/);
      expect(stripped).not.toContain('<Fragment');
    });

    test('sandbox does NOT include allow-same-origin', async () => {
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
      expect(value).toContain('allow-scripts');
      expect(value).toContain('allow-popups');
      expect(value).toContain('allow-popups-to-escape-sandbox');
    });

    test('allow-listed embedUrl renders iframe with that src', async () => {
      const container = await AstroContainer.create();
      const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      const html = await container.renderToString(EmbedBlock, {
        props: { ...baseProps, variant, embedUrl: url },
      });

      expect(html).toContain(`src="${url}"`);
      expect(html).not.toContain('Embed URL not allowed');
      expect(html).not.toContain('No embed URL provided');
    });

    test('non-allow-listed embedUrl renders the "not allowed" placeholder, no iframe', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(EmbedBlock, {
        props: {
          ...baseProps,
          variant,
          embedUrl: 'https://evil.example/page',
        },
      });

      expect(html).not.toContain('<iframe');
      expect(html).toContain('Embed URL not allowed');
    });

    test('empty embedUrl + empty rawEmbedCode renders the "not provided" placeholder', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(EmbedBlock, {
        props: { ...baseProps, variant, embedUrl: '', rawEmbedCode: '' },
      });

      expect(html).not.toContain('<iframe');
      expect(html).toContain('No embed URL provided');
    });

    test('rawEmbedCode takes precedence over embedUrl', async () => {
      const container = await AstroContainer.create();
      const html = await container.renderToString(EmbedBlock, {
        props: {
          ...baseProps,
          variant,
          rawEmbedCode: '<div>raw</div>',
          embedUrl: 'https://www.youtube.com/embed/x',
        },
      });

      expect(html).toContain('srcdoc=');
      expect(html).not.toContain('src="https://www.youtube.com/embed/x"');
    });
  });
});

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { vercelStegaEncode } from '@vercel/stega';
import ChatBubble from '../ChatBubble.astro';

const stegaSuffix = vercelStegaEncode({ origin: 'sanity.io', href: '/studio' });

describe('ChatBubble (Story 5.18 Path A)', () => {
  beforeEach(() => {
    // Reset any astro:env/client overrides set in individual tests.
    vi.resetModules();
  });

  test('renders .chat-bubble-shell wrapper + external Swiss trigger when apiUrl is set', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ChatBubble, {
      props: { apiUrl: 'https://search.example.workers.dev' },
    });

    expect(html).toContain('class="chat-bubble-shell"');
    expect(html).toContain('data-chat-bubble-wrapper');
    expect(html).toContain('data-chat-bubble-external-trigger');
    // WCAG 2.5.3 Label in Name: aria-label matches visible text "Chat".
    expect(html).toContain('aria-label="Chat"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('aria-controls="chat-bubble-snippet"');
    expect(html).toContain('<chat-bubble-snippet');
  });

  test('emits hide-branding attribute unconditionally (ignoring hideBranding prop)', async () => {
    // Astro minifies `hide-branding=""` to a bare `hide-branding` attribute;
    // both forms are equivalent for web components (getAttribute returns "").
    // Negative lookbehind prevents matching `data-hide-branding` substrings.
    const hideBrandingAttr = /(?<![\w-])hide-branding(="")?[\s>]/;
    const container = await AstroContainer.create();

    const htmlDefault = await container.renderToString(ChatBubble, {
      props: { apiUrl: 'https://search.example.workers.dev' },
    });
    expect(htmlDefault).toMatch(hideBrandingAttr);

    const htmlExplicitFalse = await container.renderToString(ChatBubble, {
      props: {
        apiUrl: 'https://search.example.workers.dev',
        hideBranding: false,
      },
    });
    expect(htmlExplicitFalse).toMatch(hideBrandingAttr);
  });

  test('resolves theme="light" when prop is "auto" and site theme is not dark (default red)', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ChatBubble, {
      props: { apiUrl: 'https://search.example.workers.dev', theme: 'auto' },
    });

    expect(html).toContain('theme="light"');
    expect(html).not.toContain('theme="auto"');
  });

  test('resolves theme="light" when prop is omitted (default "auto")', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ChatBubble, {
      props: { apiUrl: 'https://search.example.workers.dev' },
    });

    expect(html).toContain('theme="light"');
  });

  test('honours explicit theme prop when not "auto"', async () => {
    const container = await AstroContainer.create();
    const htmlDark = await container.renderToString(ChatBubble, {
      props: { apiUrl: 'https://search.example.workers.dev', theme: 'dark' },
    });

    expect(htmlDark).toContain('theme="dark"');
  });

  test('returns empty output when apiUrl is an empty string', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ChatBubble, {
      props: { apiUrl: '' },
    });

    expect(html).not.toContain('chat-bubble-shell');
    expect(html).not.toContain('chat-bubble-snippet');
  });

  test('stegaClean strips stega markers from apiUrl, placeholder, and theme', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ChatBubble, {
      props: {
        apiUrl: `https://search.example.workers.dev${stegaSuffix}`,
        placeholder: `Ask something${stegaSuffix}`,
        theme: `light${stegaSuffix}`,
      },
    });

    expect(html).not.toContain(stegaSuffix);
    expect(html).toContain('api-url="https://search.example.workers.dev"');
    expect(html).toContain('placeholder="Ask something"');
    expect(html).toContain('theme="light"');
  });

  test('passes siteId from PUBLIC_SITE_ID into data-site-id', async () => {
    // Default mock in src/lib/__tests__/__mocks__/astro-env-client.ts
    // sets PUBLIC_SITE_ID = "capstone".
    const container = await AstroContainer.create();
    const html = await container.renderToString(ChatBubble, {
      props: { apiUrl: 'https://search.example.workers.dev' },
    });

    expect(html).toContain('data-site-id="capstone"');
  });

  test('sets data-open-by-default="true" when openByDefault prop is true', async () => {
    const container = await AstroContainer.create();
    const htmlTrue = await container.renderToString(ChatBubble, {
      props: { apiUrl: 'https://search.example.workers.dev', openByDefault: true },
    });
    expect(htmlTrue).toContain('data-open-by-default="true"');

    const htmlFalse = await container.renderToString(ChatBubble, {
      props: { apiUrl: 'https://search.example.workers.dev', openByDefault: false },
    });
    expect(htmlFalse).toContain('data-open-by-default="false"');
  });
});

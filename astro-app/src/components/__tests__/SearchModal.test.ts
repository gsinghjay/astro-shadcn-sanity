import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { vercelStegaEncode } from '@vercel/stega';

const envMock = vi.hoisted(() => ({
  PUBLIC_SITE_THEME: 'red',
}));

vi.mock('astro:env/client', () => envMock);

const stegaSuffix = vercelStegaEncode({ origin: 'sanity.io', href: '/studio' });

async function renderSearchModal(props: Record<string, unknown>) {
  const { default: SearchModal } = await import('../SearchModal.astro');
  const container = await AstroContainer.create();
  return container.renderToString(SearchModal, { props });
}

function getSnippetTag(html: string): string {
  const match = html.match(/<search-modal-snippet[^>]*>/);
  return match?.[0] ?? '';
}

describe('SearchModal', () => {
  beforeEach(() => {
    vi.resetModules();
    envMock.PUBLIC_SITE_THEME = 'red';
  });

  test('renders <search-modal-snippet> with the configured attributes', async () => {
    const html = await renderSearchModal({
      apiUrl: 'https://worker.dev',
      placeholder: 'Search the site…',
      theme: 'dark',
    });
    const snippet = getSnippetTag(html);

    expect(html).toContain('class="search-modal-shell"');
    expect(html).toContain('data-search-modal-root');
    expect(snippet).toContain('<search-modal-snippet');
    expect(snippet).toContain('api-url="https://worker.dev"');
    expect(snippet).toContain('placeholder="Search the site…"');
    expect(snippet).toContain('max-results="8"');
    expect(snippet).toContain('debounce-ms="200"');
    expect(snippet).toContain('theme="dark"');
    expect(snippet).toContain('shortcut="k"');
    expect(snippet).toContain('use-meta-key');
    expect(snippet).toContain('see-more="/search?q="');
  });

  test('returns empty output when apiUrl is empty', async () => {
    const html = await renderSearchModal({ apiUrl: '' });

    expect(html).not.toContain('search-modal-shell');
    expect(html).not.toContain('search-modal-snippet');
  });

  test('stegaClean strips stega markers from attributes', async () => {
    const html = await renderSearchModal({
      apiUrl: `https://worker.dev${stegaSuffix}`,
      placeholder: `Search the site…${stegaSuffix}`,
      theme: `dark${stegaSuffix}`,
      seeMore: `/search?q=${stegaSuffix}`,
    });

    expect(html).not.toContain(stegaSuffix);
    expect(html).toContain('api-url="https://worker.dev"');
    expect(html).toContain('placeholder="Search the site…"');
    expect(html).toContain('theme="dark"');
    expect(html).toContain('see-more="/search?q="');
  });

  test('always emits hide-branding', async () => {
    const html = await renderSearchModal({
      apiUrl: 'https://worker.dev',
      hideBranding: false,
    });
    const snippet = getSnippetTag(html);

    expect(snippet).toContain('hide-branding');
  });

  test('resolves theme="auto" from PUBLIC_SITE_THEME=red to light', async () => {
    envMock.PUBLIC_SITE_THEME = 'red';

    const html = await renderSearchModal({
      apiUrl: 'https://worker.dev',
      theme: 'auto',
    });

    expect(html).toContain('theme="light"');
    expect(html).not.toContain('theme="auto"');
  });

  test('resolves theme="auto" from PUBLIC_SITE_THEME=dark to dark', async () => {
    envMock.PUBLIC_SITE_THEME = 'dark';

    const html = await renderSearchModal({
      apiUrl: 'https://worker.dev',
      theme: 'auto',
    });

    expect(html).toContain('theme="dark"');
  });

  test('emits see-more default when prop is omitted', async () => {
    const html = await renderSearchModal({
      apiUrl: 'https://worker.dev',
    });

    expect(html).toContain('see-more="/search?q="');
  });

  test('returns empty output when apiUrl is whitespace-only', async () => {
    const html = await renderSearchModal({ apiUrl: '   ' });

    expect(html).not.toContain('search-modal-shell');
    expect(html).not.toContain('search-modal-snippet');
  });

  test('rejects non-http(s) protocols (e.g. javascript:)', async () => {
    const html = await renderSearchModal({ apiUrl: 'javascript:alert(1)' });

    expect(html).not.toContain('search-modal-shell');
    expect(html).not.toContain('search-modal-snippet');
  });

  test('rejects scheme-less / malformed URLs', async () => {
    const html = await renderSearchModal({ apiUrl: 'worker.dev/api' });

    expect(html).not.toContain('search-modal-shell');
    expect(html).not.toContain('search-modal-snippet');
  });

  test('accepts plain http:// (allowlist matches ChatBubble)', async () => {
    const html = await renderSearchModal({ apiUrl: 'http://worker.dev' });

    expect(html).toContain('search-modal-shell');
    expect(html).toContain('api-url="http://worker.dev"');
  });
});
import { describe, test, expect } from 'vitest';
import { validateEmbedUrl, EMBED_ALLOWED_ORIGINS } from '../embed-allowlist';

describe('validateEmbedUrl', () => {
  test('accepts youtube-nocookie embed URL', () => {
    const url = 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ';
    expect(validateEmbedUrl(url)).toBe(url);
  });

  test('accepts youtube.com embed URL', () => {
    const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    expect(validateEmbedUrl(url)).toBe(url);
  });

  test('accepts player.vimeo.com URL', () => {
    const url = 'https://player.vimeo.com/video/12345';
    expect(validateEmbedUrl(url)).toBe(url);
  });

  test('accepts Google Maps embed URL', () => {
    const url = 'https://www.google.com/maps/embed?pb=!1m18';
    expect(validateEmbedUrl(url)).toBe(url);
  });

  test('rejects google.com root (no /maps/embed path)', () => {
    expect(validateEmbedUrl('https://www.google.com/')).toBeNull();
    expect(validateEmbedUrl('https://www.google.com/search?q=evil')).toBeNull();
  });

  test('accepts loom embed URL', () => {
    const url = 'https://www.loom.com/embed/abc123';
    expect(validateEmbedUrl(url)).toBe(url);
  });

  test('accepts gist.github.com URL', () => {
    const url = 'https://gist.github.com/octocat/12345';
    expect(validateEmbedUrl(url)).toBe(url);
  });

  test('rejects attacker origin', () => {
    expect(validateEmbedUrl('https://evil.example/page')).toBeNull();
  });

  test('rejects malformed URL', () => {
    expect(validateEmbedUrl('not a url')).toBeNull();
    expect(validateEmbedUrl('javascript:alert(1)')).toBeNull();
  });

  test('rejects empty string', () => {
    expect(validateEmbedUrl('')).toBeNull();
  });

  test('rejects http (non-https) youtube', () => {
    expect(validateEmbedUrl('http://www.youtube.com/embed/x')).toBeNull();
  });

  test('rejects youtube subdomain spoof', () => {
    expect(validateEmbedUrl('https://youtube.com.evil.example/embed/x')).toBeNull();
  });

  test('exposes the canonical allow-list constant', () => {
    expect(EMBED_ALLOWED_ORIGINS).toContain('https://www.youtube.com');
    expect(EMBED_ALLOWED_ORIGINS).toContain('https://player.vimeo.com');
    expect(EMBED_ALLOWED_ORIGINS).toContain('https://gist.github.com');
  });
});

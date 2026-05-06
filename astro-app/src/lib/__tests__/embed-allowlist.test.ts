import { describe, test, expect } from 'vitest';
import { validateEmbedUrl } from '../embed-allowlist';

describe('validateEmbedUrl', () => {
  test('accepts arbitrary https URL (allow-list deliberately dropped post-review)', () => {
    const url = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    expect(validateEmbedUrl(url)).toBe(url);
  });

  test('accepts https URLs from previously-blocked origins', () => {
    expect(validateEmbedUrl('https://codepen.io/team/codepen/embed/PNaGbb')).toBe(
      'https://codepen.io/team/codepen/embed/PNaGbb',
    );
    expect(validateEmbedUrl('https://www.figma.com/embed?embed_host=share&url=x')).toBe(
      'https://www.figma.com/embed?embed_host=share&url=x',
    );
    expect(validateEmbedUrl('https://observablehq.com/embed/@d3/zoomable-sunburst')).toBe(
      'https://observablehq.com/embed/@d3/zoomable-sunburst',
    );
  });

  test('preserves caller input verbatim (no URL normalization)', () => {
    const input = 'https://www.google.com/maps/embed?pb=!1m18';
    expect(validateEmbedUrl(input)).toBe(input);
    const trailing = 'https://www.youtube.com/embed/x/';
    expect(validateEmbedUrl(trailing)).toBe(trailing);
  });

  test('rejects http (non-https) scheme', () => {
    expect(validateEmbedUrl('http://www.youtube.com/embed/x')).toBeNull();
  });

  test('rejects blob: URL even when its inner origin would match', () => {
    expect(validateEmbedUrl('blob:https://www.youtube.com/abc-def')).toBeNull();
  });

  test('rejects javascript: URL', () => {
    expect(validateEmbedUrl('javascript:alert(1)')).toBeNull();
  });

  test('rejects data: URL', () => {
    expect(validateEmbedUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
  });

  test('rejects URL with userinfo (username:password@)', () => {
    expect(validateEmbedUrl('https://user:pass@www.youtube.com/embed/x')).toBeNull();
  });

  test('rejects URL with username only', () => {
    expect(validateEmbedUrl('https://user@www.youtube.com/embed/x')).toBeNull();
  });

  test('rejects malformed URL', () => {
    expect(validateEmbedUrl('not a url')).toBeNull();
  });

  test('rejects empty string', () => {
    expect(validateEmbedUrl('')).toBeNull();
  });
});

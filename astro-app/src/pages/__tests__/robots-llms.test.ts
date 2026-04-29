/**
 * Story 5.19: robots.txt advertises llms.txt
 *
 * File-based regex assertion that robots.txt.ts source emits an `# LLMs:` hint
 * line referencing `${siteUrl}/llms.txt` while leaving the existing User-agent
 * blocks and Sitemap line untouched.
 *
 * @story 5-19
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROBOTS_PATH = resolve(__dirname, '../robots.txt.ts');
const source = readFileSync(ROBOTS_PATH, 'utf8');

describe('Story 5-19: robots.txt llms.txt advertisement', () => {
  it('advertises the llms.txt index via a # LLMs: hint line', () => {
    expect(source).toMatch(/#\s*LLMs:\s*\$\{siteUrl\}\/llms\.txt/);
  });

  it('keeps the existing Sitemap: line', () => {
    expect(source).toMatch(/Sitemap:\s*\$\{siteUrl\}\/sitemap-index\.xml/);
  });

  it('keeps both User-agent blocks', () => {
    expect(source).toMatch(/User-agent:\s*\*/);
    expect(source).toMatch(/User-agent:\s*Cloudflare-AI-Search/);
  });

  it('keeps Disallow rules for /portal/, /auth/, /student/, /demo/', () => {
    for (const path of ['/portal/', '/auth/', '/student/', '/demo/']) {
      expect(source).toContain(`Disallow: ${path}`);
    }
  });
});

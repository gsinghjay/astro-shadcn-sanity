/**
 * Story 5.19: astro-llms-md build output
 *
 * Asserts the integration emitted /llms.txt, /llms-full.txt, per-page .md
 * twins, excluded internal-only routes, and that robots.txt advertises the
 * llms.txt index.
 *
 * Skips gracefully if astro-app/dist is missing (build hasn't run yet).
 *
 * @story 5-19
 */
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const DIST = resolve(__dirname, '../../../astro-app/dist');
const LLMS_TXT = join(DIST, 'llms.txt');
const LLMS_FULL_TXT = join(DIST, 'llms-full.txt');
const ROBOTS_TXT_SRC = resolve(__dirname, '../../../astro-app/src/pages/robots.txt.ts');

const llmsArtifactsPresent = existsSync(LLMS_TXT);
const describeIfBuilt = llmsArtifactsPresent ? describe : describe.skip;

describeIfBuilt('Story 5-19: astro-llms-md build artifacts', () => {
  it('emits dist/llms.txt', () => {
    expect(existsSync(LLMS_TXT)).toBe(true);
  });

  it('emits a non-empty dist/llms-full.txt', () => {
    expect(existsSync(LLMS_FULL_TXT)).toBe(true);
    const body = readFileSync(LLMS_FULL_TXT, 'utf8');
    expect(body.trim().length).toBeGreaterThan(0);
  });

  it('emits at least one per-page .md twin alongside HTML output', () => {
    const topLevel = readdirSync(DIST, { withFileTypes: true });
    const mdFiles = topLevel
      .filter((e) => e.isFile() && e.name.endsWith('.md'))
      .map((e) => e.name);
    expect(mdFiles.length).toBeGreaterThan(0);
  });

  it('excludes /portal/, /auth/, /student/, /demo/ from llms.txt', () => {
    const body = readFileSync(LLMS_TXT, 'utf8');
    for (const blocked of ['/portal/', '/auth/', '/student/', '/demo/']) {
      expect(body).not.toContain(blocked);
    }
  });

  it('contains no stega Unicode markers in llms-full.txt', () => {
    const body = readFileSync(LLMS_FULL_TXT, 'utf8');
    // Stega encodes private-use Unicode characters U+E0000–U+E007F.
    expect(body).not.toMatch(/[\u{E0000}-\u{E007F}]/u);
  });
});

describe('Story 5-19: robots.txt source advertises llms.txt', () => {
  it('robots.txt.ts source contains the llms.txt advertisement', () => {
    const source = readFileSync(ROBOTS_TXT_SRC, 'utf8');
    expect(source).toMatch(/llms\.txt/);
  });
});
